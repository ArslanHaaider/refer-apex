import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Terms of Service — Iqrava",
  description:
    "Terms governing use of Iqrava, including accounts, messaging, Google and Meta integrations, and acceptable use.",
};

const LAST_UPDATED = "August 17, 2026";
const CONTACT_EMAIL = "support@iqrava.com";
const BUSINESS_NAME = "Iqrava";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="py-16">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                1. Acceptance of these Terms
              </h2>
              <p className="mt-2">
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access
                to and use of {BUSINESS_NAME}&apos;s website, dashboard, APIs,
                and related services (the &ldquo;Service&rdquo;). By creating an
                account, connecting an integration, or otherwise using the
                Service, you agree to these Terms and our{" "}
                <a href="/privacy" className="text-emerald hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
              <p className="mt-2">
                If you use the Service on behalf of a business, you represent
                that you have authority to bind that business to these Terms,
                and &ldquo;you&rdquo; includes that business.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                2. The Service
              </h2>
              <p className="mt-2">
                {BUSINESS_NAME} provides tools that help businesses collect
                reviews, sync client contacts, run referral campaigns, and send
                messages by email and WhatsApp. Features may depend on
                third-party platforms you choose to connect, including Google
                and Meta.
              </p>
              <p className="mt-2">
                We may modify, suspend, or discontinue features with reasonable
                notice where practicable. We do not guarantee that every
                integration or feature will remain available indefinitely.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                3. Accounts and security
              </h2>
              <p className="mt-2">
                You must provide accurate account information and keep it
                updated. You are responsible for maintaining the confidentiality
                of your credentials and for all activity under your account.
                Notify us immediately at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                if you suspect unauthorized access.
              </p>
              <p className="mt-2">
                You must be at least 18 years old (or the age of majority in
                your jurisdiction) and able to form a binding contract to use
                the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                4. Customer data and your responsibilities
              </h2>
              <p className="mt-2">
                You retain ownership of content and customer data you submit to
                the Service (&ldquo;Customer Data&rdquo;), including contact
                lists, templates, and campaign content. You grant{" "}
                {BUSINESS_NAME} a limited license to host, process, transmit,
                and display Customer Data solely to provide and improve the
                Service for you.
              </p>
              <p className="mt-2">You represent and warrant that:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  You have all rights and lawful bases needed to upload,
                  process, and message the people in your Customer Data
                </li>
                <li>
                  Your messaging complies with applicable anti-spam, privacy,
                  telemarketing, and consumer protection laws
                </li>
                <li>
                  You will honor unsubscribe, opt-out, and do-not-contact
                  requests
                </li>
                <li>
                  You will not upload or send unlawful, deceptive, or infringing
                  content
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                5. Google integrations
              </h2>
              <p className="mt-2">
                If you connect Google Business Profile, you authorize{" "}
                {BUSINESS_NAME} to access your locations and reviews and to post
                review replies you initiate, using only the scopes you approve
                on Google&apos;s consent screen. If you connect Google Sheets (or
                another Google data source), you authorize us to read the sheets
                you select in order to sync contacts into your account.
              </p>
              <p className="mt-2">
                You can revoke Google access at any time by disconnecting the
                integration in dashboard Settings or by revoking access in your
                Google account settings. You are solely responsible for the
                content of any review reply or other action taken through{" "}
                {BUSINESS_NAME} using your Google connection.
              </p>
              <p className="mt-2">
                Your use of Google features is also subject to Google&apos;s
                applicable terms and policies. Our handling of Google user data
                is described in our Privacy Policy and is intended to comply
                with the Google API Services User Data Policy, including Limited
                Use requirements.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                6. WhatsApp / Meta integrations
              </h2>
              <p className="mt-2">
                If you connect WhatsApp Business through Meta Embedded Signup,
                you authorize {BUSINESS_NAME} to store connection credentials
                and to send WhatsApp messages on your behalf through Meta&apos;s
                Cloud API as configured in your campaigns.
              </p>
              <p className="mt-2">You agree that:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  You will comply with Meta&apos;s WhatsApp Business terms,
                  Commerce Policy, messaging policies, and any template/approval
                  requirements
                </li>
                <li>
                  You will only message recipients who can lawfully be contacted
                  and who have provided any required consent
                </li>
                <li>
                  You are responsible for message content, timing, frequency,
                  and recipient lists
                </li>
                <li>
                  You can disconnect WhatsApp at any time from dashboard
                  Settings
                </li>
              </ul>
              <p className="mt-2">
                Meta may suspend or restrict WhatsApp access for policy
                violations or other reasons outside our control.{" "}
                {BUSINESS_NAME} is not responsible for Meta account bans,
                template rejections, delivery failures, or related third-party
                enforcement actions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                7. Acceptable use
              </h2>
              <p className="mt-2">You agree not to:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Violate any applicable law or third-party right</li>
                <li>
                  Send spam, phishing, fraudulent, harassing, or misleading
                  messages
                </li>
                <li>
                  Post fake, deceptive, or manipulated reviews or review replies
                </li>
                <li>
                  Attempt to gain unauthorized access to the Service, other
                  accounts, or related systems
                </li>
                <li>
                  Reverse engineer, scrape, overload, or disrupt the Service
                  except where such restriction is prohibited by law
                </li>
                <li>
                  Use the Service to build a competing product through
                  unauthorized access to non-public materials
                </li>
                <li>
                  Misrepresent your identity, business, or affiliation with{" "}
                  {BUSINESS_NAME}, Google, Meta, or any other party
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                8. Fees and plans
              </h2>
              <p className="mt-2">
                Some features may be offered under free, trial, or paid plans.
                If you purchase a paid plan, you agree to pay the fees presented
                at checkout or in your order form. Fees are non-refundable except
                where required by law or expressly stated otherwise. We may
                change pricing with notice for future billing periods.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                9. Third-party services
              </h2>
              <p className="mt-2">
                The Service depends on third-party providers, including but not
                limited to Google, Meta/WhatsApp, email delivery providers, and
                hosting/authentication providers. Those services are outside our
                control. We do not warrant uninterrupted availability of any
                feature that relies on a third-party service, and we are not
                liable for outages, API changes, policy enforcement, or data
                handling by those providers beyond our contractual and legal
                obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                10. Intellectual property
              </h2>
              <p className="mt-2">
                The Service, including software, design, trademarks, and
                documentation, is owned by {BUSINESS_NAME} or its licensors. We
                grant you a limited, non-exclusive, non-transferable right to
                use the Service as permitted by these Terms. You may not copy,
                modify, or distribute our materials except as expressly allowed.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                11. Confidentiality
              </h2>
              <p className="mt-2">
                Each party may receive non-public information from the other.
                The receiving party will use reasonable care to protect that
                information and use it only as needed to perform under these
                Terms, except where disclosure is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                12. Termination
              </h2>
              <p className="mt-2">
                You may stop using the Service and delete your account at any
                time from dashboard Settings. We may suspend or terminate access
                if you breach these Terms, create risk for other users or
                third-party platforms, fail to pay fees when due, or if we
                discontinue the Service.
              </p>
              <p className="mt-2">
                Upon termination, your right to access the Service ends. We will
                handle deletion of account data as described in our Privacy
                Policy. Provisions that by their nature should survive
                (including ownership, disclaimers, limitations of liability, and
                indemnity) will survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                13. Disclaimer of warranties
              </h2>
              <p className="mt-2">
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
                AVAILABLE.&rdquo; TO THE MAXIMUM EXTENT PERMITTED BY LAW,{" "}
                {BUSINESS_NAME.toUpperCase()} DISCLAIMS ALL WARRANTIES, WHETHER
                EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO
                NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
                OR THAT MESSAGES, REVIEWS, OR REFERRALS WILL ACHIEVE ANY
                PARTICULAR BUSINESS RESULT.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                14. Limitation of liability
              </h2>
              <p className="mt-2">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, {BUSINESS_NAME.toUpperCase()}{" "}
                WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST
                PROFITS, REVENUE, GOODWILL, DATA, OR BUSINESS OPPORTUNITIES,
                ARISING OUT OF OR RELATED TO THE SERVICE OR THESE TERMS, EVEN IF
                ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="mt-2">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR
                ALL CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER
                OF (A) THE AMOUNTS YOU PAID TO {BUSINESS_NAME.toUpperCase()} FOR
                THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING
                RISE TO LIABILITY, OR (B) USD $100 IF YOU HAVE NOT PAID ANY
                FEES.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                15. Indemnification
              </h2>
              <p className="mt-2">
                You will defend, indemnify, and hold harmless {BUSINESS_NAME}{" "}
                and its officers, directors, employees, and agents from and
                against claims, damages, losses, and expenses (including
                reasonable attorneys&apos; fees) arising out of or related to:
                your Customer Data; your messages or review replies; your use of
                Google, Meta/WhatsApp, or other integrations; your violation of
                these Terms or applicable law; or your infringement of
                third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                16. Changes to these Terms
              </h2>
              <p className="mt-2">
                We may update these Terms from time to time. We will update the
                &ldquo;Last updated&rdquo; date and may provide additional
                notice for material changes. Continued use of the Service after
                changes become effective constitutes acceptance of the revised
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                17. Governing law
              </h2>
              <p className="mt-2">
                These Terms are governed by the laws of the United Arab Emirates,
                without regard to conflict-of-law principles, unless mandatory
                local consumer law requires otherwise. Courts located in Dubai,
                United Arab Emirates, will have exclusive jurisdiction over
                disputes arising from these Terms, subject to any non-waivable
                rights you may have under applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                18. Contact
              </h2>
              <p className="mt-2">
                Questions about these Terms can be sent to:
              </p>
              <p className="mt-2">
                {BUSINESS_NAME}
                <br />
                Email:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
