# Google OAuth / Business Profile Verification — Progress Log

This file tracks the work to get this app ready for Google OAuth verification and
Google Business Profile API approval. It exists so work can be picked up from any
machine without re-deriving context.

## Why this exists

An audit was run against Google's OAuth verification checklist (branding, auth,
scopes, Business Profile integration, security, token storage, privacy/terms,
data deletion, error handling, logging, backend, DB, compliance, production
readiness). Verdict at the time: **Not Ready** — the Google Business Profile
integration was 100% mocked. `GOOGLE_MOCK` defaulted to mock mode, OAuth tokens
were exchanged in the callback and then discarded (never stored), and every
"real" data endpoint (`locations`, `reviews`, `status`) returned `501 Not
Implemented`. No privacy policy, terms, or data-deletion flow existed either.

The fix was broken into 5 phases so it can be done (and resumed) incrementally.

## Phase status

- [x] **Phase 1 — Data & persistence foundation** (done 2026-07-22)
- [x] **Phase 2 — Make the integration real** (done 2026-07-25)
- [x] **Phase 3 — Legal & consent surfaces** (done 2026-07-25)
- [x] **Phase 4 — Security hardening** (done 2026-07-26)
- [ ] Phase 5 — Verification prep

---

## Phase 1 — Data & persistence foundation (DONE)

**Why:** Before any real Business Profile data can be fetched, OAuth tokens
need somewhere safe to live. Previously the callback exchanged tokens and threw
them away (`void tokens; // Remove when Supabase insert is implemented`) — there
was no `google_connections` table and no encryption anywhere in the codebase.

**What was done:**

1. `supabase/migrations/20260722000000_create_google_connections.sql`
   New `google_connections` table — one row per user (`user_id` is the primary
   key, FK to `auth.users`). Columns: `google_account_email`,
   `encrypted_access_token`, `encrypted_refresh_token`, `scope`, `expires_at`,
   `created_at`, `updated_at`. Row Level Security is enabled with policies that
   scope select/insert/update/delete to `auth.uid() = user_id`, matching the
   pattern already used by the `profiles` table. An `updated_at` trigger keeps
   the timestamp fresh on writes.
   Only encrypted token strings are ever written to this table — no plaintext
   tokens touch the database.

2. `src/lib/security/token-crypto.ts`
   `encryptToken()` / `decryptToken()` using Node's built-in `crypto`
   (AES-256-GCM). The key comes from `GOOGLE_TOKEN_ENCRYPTION_KEY` (a 32-byte
   key, base64-encoded). Output format is `base64(iv).base64(authTag).base64(ciphertext)`
   so each encrypted value is self-contained and independently decryptable.

3. `src/lib/reviews/google-connection.ts`
   `saveGoogleConnection(supabase, userId, tokens)` — encrypts both tokens and
   upserts them into `google_connections`.
   `getGoogleConnection(supabase, userId)` — reads the row and decrypts both
   tokens back out. **Not called anywhere yet** — it's written for Phase 2 to
   consume when it wires up the real `locations`/`reviews`/`status` endpoints.

4. `src/app/api/google/callback/route.ts`
   - Now requires an authenticated Supabase user before proceeding (redirects
     to `/login` if there isn't one) — needed because tokens are now written
     against a `user_id`, so the callback must know who's connecting.
   - Calls `saveGoogleConnection()` instead of discarding the exchanged tokens.
   - The previous bare `catch {}` (which silently swallowed the real error)
     now logs `err.message` server-side via `console.error` — never the token
     values themselves, only the failure reason.

5. `.env.example`
   Documented the previously-undocumented `GOOGLE_MOCK`, `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and the new
   `GOOGLE_TOKEN_ENCRYPTION_KEY` (with a comment on how to generate one via
   `openssl rand -base64 32`).

**Verified:** `npx tsc --noEmit` and `npx eslint` both pass clean on the new/changed files.

**To actually activate this in an environment:**
- Apply the migration to the Supabase project (`supabase db push` or run the
  SQL directly).
- Generate a real key: `openssl rand -base64 32` → set as
  `GOOGLE_TOKEN_ENCRYPTION_KEY`.
- Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` from
  the Google Cloud Console OAuth client.
- Set `GOOGLE_MOCK=false` to exit mock mode.

---

## Phase 2 — Make the integration real (DONE)

**Why:** `saveGoogleConnection`/`getGoogleConnection` existed but nothing
called them to actually fetch data, and every consuming route short-circuited
to `501 Not Implemented` in real mode.

**What was done:**

1. `src/lib/auth/api-auth.ts` (new)
   `requireApiUser(supabase)` — the API-route equivalent of `requireUser()`.
   Returns `{ userId }` or `{ error: NextResponse(401) }` so routes can early-
   return JSON instead of redirecting (which is what `requireUser()` does,
   correct for pages, wrong for `fetch()`-based API routes).

2. Auth guards added to every route under `src/app/api/google/*` that lacked
   one: `locations`, `reviews`, `reviews/reply` (new), `status`, `connect`,
   and `auth` (GET, redirects to `/login` instead of a JSON 401 since it's a
   real browser navigation, not a fetch call). `callback` already had one
   from Phase 1.

3. `src/lib/reviews/google-connection.ts` — added:
   - `updateAccessToken()` — re-encrypts and persists just the access token
     + new expiry after a refresh.
   - `deleteGoogleConnection()` — removes the row, used by disconnect.
   - `getValidAccessToken()` — loads the connection, and if the access token
     is expired or within 5 minutes of expiring, transparently calls
     `refreshAccessToken()` and persists the result before returning. This is
     the single entry point every real-mode route now uses instead of
     touching `getGoogleConnection()` directly.

4. `src/lib/reviews/google-business-api.ts` — added `replyToReview()` (PUT to
   the review's `/reply` sub-resource) and `revokeToken()` (POST to Google's
   `/revoke` endpoint).

5. Real-mode branches replaced the `501`s:
   - `locations/route.ts` — `fetchAccounts()` then `fetchLocations()` for the
     first account.
   - `reviews/route.ts` — `fetchReviews()`, with `repliedCount` computed from
     the results, and `pageToken` now read from the query string.
   - `status/route.ts` — reflects whether a `google_connections` row exists.
   - `reviews/reply/route.ts` (new) — real mode calls `replyToReview()`; mock
     mode simulates success without persisting (matching how mock "connect"
     already worked) so the reply UI is testable in both modes.
   - `disconnect/route.ts` (new) — best-effort revokes the refresh token via
     Google, then always deletes the local row regardless of whether the
     revoke call succeeded.

6. Frontend wiring:
   - `reviews-shell.tsx` — "Connect" now navigates to `/api/google/auth`
     (full-page redirect into Google's consent screen) in real mode instead
     of calling the mock-only `/api/google/connect`; mock mode behavior is
     unchanged.
   - `review-card.tsx` — added an inline reply form (textarea + send/cancel)
     shown on reviews without an existing owner reply; calls back through a
     new `onReply` prop.
   - `settings/google-connection-card.tsx` (new) + `dashboard/settings/page.tsx`
     — shows the connected Google account email and a working "Disconnect"
     button wired to `/api/google/disconnect`. The rest of the settings page
     (notifications, profile, etc.) is still out of scope — that's Phase 3.

**Verified:** `npx tsc --noEmit`, `npx eslint`, and `npx next build` all pass
clean.

**Not done (left for later phases):**
- No caching of fetched reviews in a `google_reviews` table (Phase 2's steps
  mentioned this as optional; skipped since nothing currently requires it).
- Rate limiting / CSP on these routes — Phase 4.
- Privacy/terms pages required before Google will accept the OAuth consent
  screen — Phase 3.

---

## Phase 3 — Legal & consent surfaces (DONE)

**Why:** Google's OAuth consent screen requires a real, accurate Privacy
Policy URL before verification can even be submitted. There was no Privacy
Policy or Terms of Service page anywhere in the repo, the footer's legal
links all pointed to `#`, and the landing page claimed "GDPR compliant and
HIPAA ready" with no certification or BAA behind either claim.

**What was done:**

1. `src/app/privacy/page.tsx` and `src/app/terms/page.tsx` (new) — real
   pages (using the site `Header`/`Footer`) that accurately describe current
   behavior: what's collected (account email/name, Google OAuth tokens
   encrypted at rest, location/review data fetched live and not separately
   stored), why, retention (tokens deleted on disconnect or account
   deletion, with a best-effort revoke call to Google), who it's shared with
   (Supabase, Google's API — no one else), and how to exercise deletion
   rights. Contact address used throughout: `support@iqrava.com`.

2. `src/lib/landing-data.ts`:
   - `legal` array now points at `/privacy` and `/terms`; dropped the
     `Cookie Policy` and `GDPR` entries since no such pages/certifications
     exist to link to.
   - Removed the unsubstantiated `GDPR Compliant` / `HIPAA Ready` trust
     badges, replaced with claims the app actually backs (`Encrypted Data at
     Rest & in Transit`, `Role-Based Access Controls`).
   - Reworded the FAQ security answer to drop the compliance-certification
     claim while keeping the (true) encryption/access-control claims, and
     pointed readers at the new Privacy Policy.

3. Account deletion flow:
   - `src/utils/supabase/admin.ts` (new) — a service-role Supabase client
     (`SUPABASE_SERVICE_ROLE_KEY`, added to `.env.example`). Needed because
     deleting an `auth.users` row requires the admin API; the anon/
     publishable key can't do it.
   - `src/app/api/account/delete/route.ts` (new) — auth-guarded POST that
     best-effort revokes the user's Google token, then calls
     `admin.auth.admin.deleteUser()`. Both `profiles` and
     `google_connections` FK `auth.users` with `ON DELETE CASCADE`, so
     deleting the auth user is sufficient to remove all of the user's rows —
     no separate table cleanup needed.
   - `src/components/dashboard/settings/account-danger-zone.tsx` (new) — a
     "Danger Zone" card requiring the user to type `DELETE` before the button
     enables, then redirects to `/` on success. Wired into
     `dashboard/settings/page.tsx` alongside Phase 2's Google connection
     card.

**Decisions made with the user (not inferable from code):**
- Contact email is `support@iqrava.com` (not a dedicated `privacy@` address).
- Account deletion is self-serve/in-app (not a documented email-request
  process) — hence the new service-role key and admin client.
- The GDPR/HIPAA claims were removed rather than kept, since neither is
  actually substantiated.

**Verified:** `npx tsc --noEmit`, `npx eslint`, and `npx next build` all pass
clean; `/privacy` and `/terms` render as static pages.

**Not done (left for later phases):**
- Legal review of the Terms/Privacy language — this is a reasonable-effort
  draft grounded in what the app actually does, not a lawyer-reviewed
  document.
- Jurisdiction/governing-law specifics in the Terms were deliberately left
  generic rather than naming a jurisdiction that wasn't confirmed.

---

## Phase 4 — Security hardening (DONE)

**Why:** `next.config.ts` had no security headers, no CSP, and no rate
limiting anywhere, including on OAuth endpoints.

**What was done:**

1. `next.config.ts` — added `headers()` applying to every route:
   `Content-Security-Policy`, `X-Frame-Options: DENY`,
   `X-Content-Type-Options: nosniff`,
   `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
   `Permissions-Policy`, and HSTS. The CSP's `connect-src` includes
   `NEXT_PUBLIC_SUPABASE_URL` (read at build time) since the browser talks to
   Supabase directly for auth. `script-src`/`style-src` still need
   `'unsafe-inline'` for Next.js's inline bootstrap scripts — switching to a
   nonce-based CSP (threaded through middleware) is a follow-up, not done
   here. Verified via `curl -I` against a production build that all six
   headers are present, and that the rendered HTML has no external
   script/style/font URLs the CSP would need to additionally allow.

2. `src/lib/security/rate-limit.ts` (new) — an in-memory fixed-window
   limiter (`rateLimit()`), plus a route-handler helper (`checkRateLimit()`)
   that returns a `429` `NextResponse` (with `Retry-After`) or `null`. Noted
   in-code that this is single-instance only; swapping the backing store for
   Supabase/Redis is a drop-in change if this app scales horizontally.

3. Applied `checkRateLimit()`, keyed by `userId`, to every route under
   `/api/google/*` and to `/api/account/delete`:
   - Reads (`status` 60/min, `locations`/`reviews` 30/min) are limited on the
     real-mode path only — mock mode returns static demo data with no
     external cost.
   - Mutating actions (`reviews/reply` 20/min, `disconnect` 10/min, `connect`
     10/min, `auth` 10/min, `callback` 10/min) are limited in **both** mock
     and real mode.
   - `account/delete` gets a much stricter 5/hour — it's the most
     consequential action in the app.

4. Closed an auth-guard gap found while wiring in rate limiting: the mock
   branches of `reviews/reply` and `disconnect` had no auth check at all
   (unlike `connect`'s mock branch, which Phase 2 already guarded) — they've
   been restructured so `requireApiUser()` runs before the mock/real branch,
   not just inside the real one.

**Verified:** `npx tsc --noEmit`, `npx eslint`, and `npx next build` all pass
clean; confirmed headers via `curl -I` against `next start`.

**Not done (left for later phases):**
- Nonce-based CSP (would drop `'unsafe-inline'` from `script-src`/`style-src`).
- The in-memory rate limiter resets on redeploy/restart and doesn't share
  state across multiple server instances — fine for a single instance, worth
  revisiting if this deploys to a multi-instance environment.

---

## Phase 5 — Verification prep (NOT STARTED)

**Why:** Google requires a demo video and a filled-out OAuth consent screen
before reviewing a `business.manage` scope request.

**What needs to happen:**
- Record the required verification demo: connect → view real locations/reviews
  → reply to a review → disconnect, all against real (non-mock) data.
- Fill out the Google Cloud Console OAuth consent screen with the real Privacy
  Policy/Terms URLs from Phase 3, and a scope justification referencing the
  actual reply-to-review feature from Phase 2.
- Submit for CASA/OAuth verification review.

---

## Key files map (for quick orientation on resume)

| Concern | File |
|---|---|
| OAuth scopes / token exchange / API wrapper | `src/lib/reviews/google-business-api.ts` |
| OAuth initiation | `src/app/api/google/auth/route.ts` |
| OAuth callback (stores tokens) | `src/app/api/google/callback/route.ts` |
| Token encryption | `src/lib/security/token-crypto.ts` |
| Token persistence (save/load) | `src/lib/reviews/google-connection.ts` |
| DB schema for connections | `supabase/migrations/20260722000000_create_google_connections.sql` |
| Mock data (used while `GOOGLE_MOCK=true`) | `src/lib/reviews/mock-data.ts` |
| Locations/reviews/status/connect endpoints | `src/app/api/google/{locations,reviews,status,connect}/route.ts` |
| Settings page (needs disconnect UI) | `src/app/dashboard/settings/page.tsx` |
| Landing page legal/company links | `src/lib/landing-data.ts` |
| Middleware / route matcher | `src/proxy.ts` |
| Auth helpers | `src/lib/auth/get-user.ts` |
| Env var reference | `.env.example` |
