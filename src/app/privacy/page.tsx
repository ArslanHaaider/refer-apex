import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy Policy — Iqrava",
  description: "How Iqrava collects, uses, and protects your data.",
};

const LAST_UPDATED = "July 25, 2026";
const CONTACT_EMAIL = "support@iqrava.com";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="py-16">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

          <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-charcoal">1. Introduction</h2>
              <p className="mt-2">
                This policy explains what data Iqrava (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects
                from users of our dashboard, why we collect it, how long we keep
                it, and how you can have it deleted.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">2. What we collect</h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Account information:</strong> your email address and
                  display name, collected when you sign up, and used to
                  authenticate you and identify your account.
                </li>
                <li>
                  <strong>Google Business Profile connection:</strong> if you
                  choose to connect your Google Business Profile, we receive
                  and store an OAuth access token and refresh token from
                  Google, along with the connected Google account&apos;s email
                  address and the scope you granted
                  (<code>business.manage</code>). These tokens are encrypted
                  (AES-256-GCM) before being written to our database — we
                  never store them as plain text, and no one at Iqrava can
                  read the raw token values directly from the database.
                </li>
                <li>
                  <strong>Google Business Profile data:</strong> using the
                  stored token, we fetch your business locations and reviews
                  directly from Google&apos;s API on demand, to display them in
                  your dashboard and to let you reply to reviews. We do not
                  currently keep a separate stored copy of this data — it is
                  fetched fresh from Google each time you view it.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">3. Why we collect it</h2>
              <p className="mt-2">
                We use this data solely to operate the features you use: to
                authenticate you, to show your connected Google Business
                Profile&apos;s locations and reviews, and to let you reply to
                reviews on Google&apos;s behalf. We do not sell your data, and we
                do not use it for advertising.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">4. How long we keep it</h2>
              <p className="mt-2">
                Your account information is kept for as long as your account
                exists. Your Google OAuth tokens are kept until you
                disconnect your Google Business Profile (from your dashboard
                Settings page) or delete your account — either action deletes
                the stored tokens immediately, and we additionally notify
                Google to revoke the token so it can no longer be used.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">5. Who we share it with</h2>
              <p className="mt-2">
                We use Supabase to host our database and authenticate users,
                and Google&apos;s Business Profile API to fetch your locations
                and reviews. Neither is used for any purpose beyond operating
                the service described above. We do not share your data with
                any other third party.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">6. Your rights</h2>
              <p className="mt-2">
                You can disconnect your Google Business Profile at any time
                from your dashboard&apos;s Settings page, which immediately
                deletes the stored tokens. You can permanently delete your
                account and all associated data (profile, Google connection)
                from the same page. You can also reach us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                with any data access, correction, or deletion request.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">7. Security</h2>
              <p className="mt-2">
                Data is encrypted in transit (HTTPS/TLS) between your browser,
                our servers, and Google&apos;s and Supabase&apos;s APIs. Stored Google
                OAuth tokens are additionally encrypted at rest with
                AES-256-GCM. Access to your data in our database is
                restricted at the database level so that only your own
                authenticated session can read or write your rows.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">8. Contact</h2>
              <p className="mt-2">
                Questions about this policy or your data can be sent to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald hover:underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
