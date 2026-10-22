import type { Metadata } from "next";
import Link from "next/link";

import MarketingShell from "@/components/marketing/MarketingShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | PropSniper",
  description: "How PropSniper collects, uses, and shares information.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="ps-wrap ps-doc">
        <h1>Privacy Policy</h1>
        <p className="ps-doc-meta">Last updated {SITE.legalLastUpdated}</p>

        <p className="ps-draft">
          Draft for lawyer review. This text is a starting point, not legal advice. Items marked
          TODO need your decision before launch.
        </p>

        <div className="ps-prose">
          <h2>What we collect</h2>
          <ul>
            <li>Account details: your name, email, and company name.</li>
            <li>
              Content you add: leads, property details, notes, tasks, buyer lists, and messages you
              send from PropSniper.
            </li>
            <li>
              Billing details: payments are handled by Stripe. We do not store your full card
              number.
            </li>
            <li>Usage and device information needed to run and secure the service.</li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To provide the service, including scoring leads and analyzing deals.</li>
            <li>To send texts and emails that you ask PropSniper to send.</li>
            <li>To bill your subscription and provide support.</li>
            <li>To keep the service secure and fix problems.</li>
          </ul>

          <h2>Service providers</h2>
          <p>
            We share information with companies that help us run PropSniper, only as needed for
            them to do that work:
          </p>
          <ul>
            <li>Supabase for the database and sign-in.</li>
            <li>Stripe for payments.</li>
            <li>Mapbox for maps.</li>
            <li>RentCast for property data and value estimates.</li>
            <li>OpenAI for AI summaries and draft messages.</li>
            <li>Twilio for text messages.</li>
            <li>Resend for email.</li>
          </ul>
          <p>TODO: confirm this list is complete, including any AI calling provider.</p>

          <h2>What we do not do</h2>
          <p>TODO: state whether you sell or share personal information for advertising.</p>

          <h2>Retention, export, and deletion</h2>
          <p>
            TODO: state how long you keep data, how users can export it, and how they can ask you to
            delete it.
          </p>

          <h2>Your choices and rights</h2>
          <p>
            TODO: lawyer to add rights that apply to your users (for example under California
            law) and how to exercise them.
          </p>

          <h2>Security</h2>
          <p>
            We use reasonable measures to protect your information, but no system is completely
            secure.
          </p>

          <h2>Changes</h2>
          <p>
            We may update this policy. If we make a material change, we will tell you by email or in
            the app.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy? Use the <Link href="/contact">contact page</Link>.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
