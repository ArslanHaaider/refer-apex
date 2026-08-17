import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy Policy — Iqrava",
  description:
    "How Iqrava collects, uses, shares, and protects personal data for account holders, client contacts, and messaging integrations.",
};

const LAST_UPDATED = "August 17, 2026";
const CONTACT_EMAIL = "support@iqrava.com";
const BUSINESS_NAME = "Iqrava";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="py-16">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                1. Introduction
              </h2>
              <p className="mt-2">
                {BUSINESS_NAME} (&ldquo;{BUSINESS_NAME}&rdquo;, &ldquo;we&rdquo;,
                &ldquo;us&rdquo;, or &ldquo;our&rdquo;) provides a growth
                platform for service businesses that helps collect reviews, run
                referral campaigns, and message clients by email and WhatsApp.
                This Privacy Policy explains what personal data we collect, why
                we collect it, how we use and share it, how long we keep it, and
                the rights available to you.
              </p>
              <p className="mt-2">
                This policy applies to our website, dashboard, APIs, and related
                services (the &ldquo;Service&rdquo;). By creating an account or
                using the Service, you acknowledge this policy. If you use the
                Service on behalf of a business, you confirm you are authorized
                to accept this policy for that business and to process client
                contact data through the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                2. Who this policy covers
              </h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Account holders:</strong> business owners and team
                  members who sign up for {BUSINESS_NAME}.
                </li>
                <li>
                  <strong>Client contacts and referral leads:</strong> people
                  whose contact details (such as name, phone, or email) are
                  uploaded, synced, or submitted through the Service so that an
                  account holder can send reviews or referral messages.
                </li>
                <li>
                  <strong>Website visitors:</strong> people who browse our
                  marketing pages.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                3. Information we collect
              </h2>

              <h3 className="mt-4 font-semibold text-charcoal">
                3.1 Account and authentication data
              </h3>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Email address and display name</li>
                <li>Authentication credentials and session information</li>
                <li>
                  Account settings and preferences you configure in the
                  dashboard
                </li>
              </ul>

              <h3 className="mt-4 font-semibold text-charcoal">
                3.2 Google Business Profile connection
              </h3>
              <p className="mt-2">
                If you connect Google Business Profile, we receive and store
                OAuth access and refresh tokens, the connected Google
                account&apos;s email address, and the scopes you grant (including
                business management scopes needed to read locations/reviews and
                post review replies). Tokens are encrypted at rest
                (AES-256-GCM) before storage.
              </p>
              <p className="mt-2">
                Using those tokens, we may access your business locations and
                reviews to display them in your dashboard and to send review
                replies you authorize.
              </p>

              <h3 className="mt-4 font-semibold text-charcoal">
                3.3 Google Sheets / contact data source
              </h3>
              <p className="mt-2">
                If you connect a Google Sheet (or similar data source) as a
                contact source, we read the sheet data you authorize in order to
                sync client contacts into your account. Typical fields include
                full name, phone number, email address, and last service date.
                We store synced contact records in our database so we can run
                eligibility checks and campaigns on your behalf.
              </p>

              <h3 className="mt-4 font-semibold text-charcoal">
                3.4 WhatsApp / Meta connection and messaging data
              </h3>
              <p className="mt-2">
                If you connect WhatsApp Business via Meta Embedded Signup, we
                may store:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  WhatsApp Business Account identifiers (for example WABA ID)
                </li>
                <li>
                  Phone number ID, display phone number, and verified business
                  name
                </li>
                <li>
                  Encrypted Meta access tokens and token expiry metadata
                </li>
                <li>
                  Message content you instruct us to send, recipient phone
                  numbers, delivery/status events received from Meta webhooks,
                  and related campaign metadata
                </li>
              </ul>
              <p className="mt-2">
                We use Meta&apos;s WhatsApp Cloud API only to send messages you
                initiate through the Service and to process webhook events needed
                to operate messaging features. We do not sell WhatsApp message
                content or use it for unrelated advertising.
              </p>

              <h3 className="mt-4 font-semibold text-charcoal">
                3.5 Email messaging data
              </h3>
              <p className="mt-2">
                When you send email campaigns through the Service, we process
                recipient email addresses, message subject/body content, and
                delivery metadata needed to send and track those messages.
              </p>

              <h3 className="mt-4 font-semibold text-charcoal">
                3.6 Referral and campaign data
              </h3>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Campaign configuration and message templates</li>
                <li>
                  Referral links, tokens, click events, and conversion/status
                  records
                </li>
                <li>
                  Information submitted by referred leads (such as name, phone,
                  and email) through public referral or booking flows
                </li>
              </ul>

              <h3 className="mt-4 font-semibold text-charcoal">
                3.7 Technical and usage data
              </h3>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  Log data such as IP address, browser/user agent, timestamps,
                  and request paths
                </li>
                <li>
                  Security and rate-limiting signals needed to protect the
                  Service
                </li>
                <li>
                  Cookies or similar technologies required for authentication
                  and basic site operation
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                4. How we use information
              </h2>
              <p className="mt-2">We use personal data to:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Create and secure accounts, and authenticate users</li>
                <li>
                  Connect and operate third-party integrations you enable
                  (Google Business Profile, Google Sheets, WhatsApp/Meta, email
                  delivery)
                </li>
                <li>
                  Display reviews, sync contacts, run referral campaigns, and
                  send messages you request
                </li>
                <li>
                  Provide analytics about campaigns, referrals, and related
                  activity inside your dashboard
                </li>
                <li>
                  Provide customer support and respond to privacy or account
                  requests
                </li>
                <li>
                  Maintain security, prevent abuse, debug issues, and improve
                  the Service
                </li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="mt-2">
                We do not sell personal data. We do not use Google user data or
                WhatsApp message content for advertising unrelated to providing
                the Service you requested.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                5. Legal bases (where applicable)
              </h2>
              <p className="mt-2">
                Depending on your location, we process personal data based on
                one or more of the following: performance of a contract with
                you; your consent (for example, connecting Google or WhatsApp);
                our legitimate interests in operating and securing the Service;
                and compliance with legal obligations. Account holders are
                responsible for having a lawful basis to upload or message their
                client contacts.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                6. How we share information
              </h2>
              <p className="mt-2">
                We share data only as needed to operate the Service:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Supabase:</strong> database hosting, authentication,
                  and related infrastructure
                </li>
                <li>
                  <strong>Google:</strong> Google Business Profile API and
                  Google Sheets API for features you connect
                </li>
                <li>
                  <strong>Meta (WhatsApp):</strong> WhatsApp Cloud API and
                  Embedded Signup for messaging features you connect
                </li>
                <li>
                  <strong>Email delivery providers</strong> (such as Resend): to
                  send campaign emails you initiate
                </li>
                <li>
                  <strong>Service providers</strong> that help us host, monitor,
                  or secure the Service, under confidentiality obligations
                </li>
                <li>
                  <strong>Legal and safety:</strong> when required by law,
                  regulation, legal process, or to protect rights, safety, and
                  security
                </li>
                <li>
                  <strong>Business transfers:</strong> in connection with a
                  merger, acquisition, financing, or sale of assets, subject to
                  appropriate protections
                </li>
              </ul>
              <p className="mt-2">
                We do not share personal data with third parties for their
                independent marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                7. Google API Services User Data Policy
              </h2>
              <p className="mt-2">
                {BUSINESS_NAME}&apos;s use and transfer of information received
                from Google APIs adheres to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  className="text-emerald hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements. Google user data is
                used only to provide or improve user-facing features that are
                prominent in the Service. We do not use Google user data for
                serving advertisements, and we do not transfer Google user data
                to third parties except as necessary to provide/improve those
                features, comply with applicable law, or as part of a merger,
                acquisition, or sale of assets with user consent where required.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                8. Meta / WhatsApp data practices
              </h2>
              <p className="mt-2">
                When you connect WhatsApp Business through Meta, you authorize{" "}
                {BUSINESS_NAME} to use Meta APIs to manage your WhatsApp
                Business connection and send messages on your behalf. Message
                content and recipient phone numbers are processed solely to
                deliver campaigns and related product functionality you
                configure. You are responsible for complying with Meta&apos;s
                WhatsApp Business terms, messaging policies, and applicable
                consent/opt-out rules for your recipients.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                9. Data retention
              </h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  Account data is retained while your account remains active
                </li>
                <li>
                  Google and WhatsApp OAuth/access tokens are retained until you
                  disconnect the integration or delete your account
                </li>
                <li>
                  Synced contacts, campaign records, referral leads, and message
                  metadata are retained while needed to operate the Service for
                  your account, or until you delete them / delete your account
                </li>
                <li>
                  Security and server logs may be retained for a limited period
                  for abuse prevention and troubleshooting
                </li>
              </ul>
              <p className="mt-2">
                When you disconnect an integration, we delete or revoke the
                related stored credentials as soon as reasonably practicable. When
                you delete your account, we permanently delete associated account
                data from active systems, subject to limited residual copies in
                backups or where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                10. Your rights and choices
              </h2>
              <p className="mt-2">Depending on applicable law, you may:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Access, correct, or update account information</li>
                <li>
                  Disconnect Google Business Profile, Google Sheets, or WhatsApp
                  from dashboard Settings
                </li>
                <li>
                  Permanently delete your account and associated data from
                  dashboard Settings
                </li>
                <li>
                  Request access, correction, deletion, or a copy of personal
                  data we hold about you
                </li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Object to or restrict certain processing</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, use in-product controls where available
                or email{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                . We may need to verify your identity before fulfilling a
                request. Client contacts who received messages from an account
                holder should contact that business directly for opt-out or
                deletion related to the business&apos;s own customer records; we
                can assist account holders with Service-side deletion requests.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                11. Security
              </h2>
              <p className="mt-2">
                We use administrative, technical, and organizational measures
                designed to protect personal data, including HTTPS/TLS in
                transit, encryption of sensitive third-party tokens at rest,
                authentication controls, and database access restrictions. No
                method of transmission or storage is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                12. International transfers
              </h2>
              <p className="mt-2">
                We may process and store information in countries other than
                where you are located, including through cloud providers and
                integration partners. Where required, we take steps intended to
                ensure appropriate safeguards for cross-border transfers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                13. Children&apos;s privacy
              </h2>
              <p className="mt-2">
                The Service is intended for business use and is not directed to
                children under 16 (or the equivalent minimum age in your
                jurisdiction). We do not knowingly collect personal data from
                children. If you believe a child has provided personal data,
                contact us and we will take appropriate steps to delete it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                14. Changes to this policy
              </h2>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. We will
                revise the &ldquo;Last updated&rdquo; date at the top of this
                page and, where appropriate, provide additional notice. Continued
                use of the Service after an update means you accept the revised
                policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-charcoal">
                15. Contact us
              </h2>
              <p className="mt-2">
                For privacy questions, data requests, or complaints, contact:
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
