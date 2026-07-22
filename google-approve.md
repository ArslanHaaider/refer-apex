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
- [ ] Phase 2 — Make the integration real
- [ ] Phase 3 — Legal & consent surfaces
- [ ] Phase 4 — Security hardening
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

## Phase 2 — Make the integration real (NOT STARTED)

**Why:** Right now `saveGoogleConnection`/`getGoogleConnection` exist but
nothing calls them to actually fetch data. `src/lib/reviews/google-business-api.ts`
already has fully-written `fetchAccounts()`, `fetchLocations()`,
`fetchReviews()`, and `refreshAccessToken()` — none of them are wired up. The
consuming routes (`api/google/locations`, `api/google/reviews`,
`api/google/status`) all short-circuit to `501 Not Implemented` in real mode.

**What needs to happen:**
- Add an auth guard (`requireUser()` from `src/lib/auth/get-user.ts`, or
  `supabase.auth.getUser()`) to every route under `src/app/api/google/*` —
  currently none of them check who's calling, despite being in the
  `src/proxy.ts` middleware matcher.
- Replace the `501` branches in `locations/route.ts`, `reviews/route.ts`,
  `status/route.ts` with real calls: load the connection via
  `getGoogleConnection()`, call `fetchAccounts`/`fetchLocations`/`fetchReviews`
  with the decrypted access token.
- Handle token expiry: if the access token is expired (compare against
  `expiresAt`), call `refreshAccessToken()`, then re-encrypt and re-save the
  new access token via a new `updateGoogleConnection`-style helper (extend
  `google-connection.ts`).
- Add a reply-to-review endpoint — the Business Profile API supports replying
  via `PUT`/`PATCH` on the review resource; nothing like this exists yet, mock
  or real.
- Add a disconnect endpoint: `POST https://oauth2.googleapis.com/revoke` with
  the refresh token, then delete the row from `google_connections`. Surface
  this as a "Disconnect" action in `src/app/dashboard/settings/page.tsx`
  (currently a static placeholder with no functional UI).

---

## Phase 3 — Legal & consent surfaces (NOT STARTED)

**Why:** Google's OAuth consent screen requires a real, accurate Privacy
Policy URL before verification can even be submitted. Right now there is no
Privacy Policy or Terms of Service page anywhere in the repo — the footer
links in `src/lib/landing-data.ts` (`legal` array) all point to `#`. The
landing page FAQ also claims "GDPR compliant and HIPAA ready... encrypted in
transit and at rest," which isn't backed by any actual document.

**What needs to happen:**
- Write real `/privacy` and `/terms` pages under `src/app/` that accurately
  describe what Phase 1/2 actually do: what's collected (Google Business
  Profile tokens, location/review data), why, how long it's retained, and how
  to delete it.
- Fix the `#` links in `src/lib/landing-data.ts` to point at the new routes.
- Either substantiate or remove the GDPR/HIPAA claim in the FAQ copy.
- Build out `src/app/dashboard/settings/page.tsx` into a real settings page:
  show the connected Google account (`google_account_email`), a working
  "Disconnect" button wired to Phase 2's disconnect endpoint, and an
  account-deletion flow.

---

## Phase 4 — Security hardening (NOT STARTED)

**Why:** `next.config.ts` currently has no security headers, no CSP, and no
CORS config (`{ reactCompiler: true }` is the entire config). There's no rate
limiting anywhere, including on OAuth endpoints.

**What needs to happen:**
- Add `headers()` to `next.config.ts` — CSP, `X-Frame-Options`, etc.
- Add basic rate limiting on `/api/google/*` (in-memory or Supabase-backed
  limiter is enough to start).
- Confirm the auth guards from Phase 2 close the "unauthenticated caller can
  hit `/api/google/*`" gap.

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
