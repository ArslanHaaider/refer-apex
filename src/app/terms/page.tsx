import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Terms of Service — Iqrava",
  description: "The terms that govern your use of Iqrava.",
};

const LAST_UPDATED = "July 25, 2026";
const CONTACT_EMAIL = "support@iqrava.com";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="py-16">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-charcoal">1. Acceptance</h2>
              <p className="mt-2">
                By creating an account or using Iqrava, you agree to these
                Terms. If you are using Iqrava on behalf of a business, you
                confirm you have authority to bind that business to these
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">2. Your account</h2>
              <p className="mt-2">
                You are responsible for maintaining the security of your
                account credentials and for all activity that occurs under
                your account. Notify us immediately at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                if you suspect unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">3. Connecting Google Business Profile</h2>
              <p className="mt-2">
                Connecting your Google Business Profile grants Iqrava
                permission to read your business locations and reviews and
                to post replies to reviews on your behalf, using only the
                access you explicitly authorize through Google&apos;s consent
                screen. You can revoke this access at any time by
                disconnecting from your dashboard&apos;s Settings page. You are
                responsible for the content of any review reply sent through
                Iqrava on your behalf.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">4. Acceptable use</h2>
              <p className="mt-2">
                You agree not to use Iqrava to violate any applicable law, to
                infringe on the rights of others, to post fraudulent or
                misleading review replies, or to attempt to gain
                unauthorized access to our systems or other users&apos; data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">5. Service availability</h2>
              <p className="mt-2">
                Iqrava depends on third-party services, including Google&apos;s
                Business Profile API, that are outside our control. We do not
                guarantee uninterrupted availability of any feature that
                relies on a third-party service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">6. Termination</h2>
              <p className="mt-2">
                You may stop using Iqrava and delete your account at any time
                from your dashboard&apos;s Settings page, which permanently
                removes your account data. We may suspend or terminate access
                for accounts that violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">7. Disclaimer &amp; limitation of liability</h2>
              <p className="mt-2">
                Iqrava is provided &ldquo;as is&rdquo; without warranties of any kind.
                To the maximum extent permitted by law, Iqrava is not liable
                for indirect, incidental, or consequential damages arising
                from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">8. Changes to these terms</h2>
              <p className="mt-2">
                We may update these Terms from time to time. Continued use of
                Iqrava after an update constitutes acceptance of the revised
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">9. Contact</h2>
              <p className="mt-2">
                Questions about these Terms can be sent to{" "}
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
