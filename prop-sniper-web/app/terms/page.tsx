import type { Metadata } from "next";
import Link from "next/link";

import MarketingShell from "@/components/marketing/MarketingShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service | PropSniper",
  description: "The terms for using PropSniper.",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="ps-wrap ps-doc">
        <h1>Terms of Service</h1>
        <p className="ps-doc-meta">Last updated {SITE.legalLastUpdated}</p>

        <p className="ps-draft">
          Draft for lawyer review. This text is a starting point, not legal advice. Items marked
          TODO need your decision before launch.
        </p>

        <div className="ps-prose">
          <h2>1. Using PropSniper</h2>
          <p>
            PropSniper is a software service for real estate wholesalers. By creating an account
            or using the service, you agree to these terms. If you use PropSniper for a business,
            you confirm you can bind that business to these terms.
          </p>

          <h2>2. Your account</h2>
          <p>
            You are responsible for your login details and for everything done under your account.
            Give accurate information when you sign up and keep it up to date.
          </p>

          <h2>3. Free trial, billing, and cancellation</h2>
          <p>
            Starter includes a {SITE.trialDays}-day free trial. A card is required at checkout. If
            you do not cancel before the trial ends, your subscription renews automatically at $
            {SITE.starterPrice} per month until you cancel. TODO: confirm the cancellation process and when cancellation takes effect.
            Payments are processed by Stripe.
          </p>
          <p>TODO: add your refund policy and how changes to pricing are communicated.</p>

          <h2>4. Acceptable use</h2>
          <p>You agree to use PropSniper lawfully. In particular, you are responsible for:</p>
          <ul>
            <li>
              Following the Telephone Consumer Protection Act (TCPA), the Do Not Call rules,
              CAN-SPAM, and any state or local rules that apply to your calls, texts, and emails.
            </li>
            <li>
              Following the real estate, wholesaling, and licensing laws of the states where you
              operate.
            </li>
            <li>Not using the service to harass anyone, send spam, or break other people’s rights.</li>
          </ul>
          <p>
            TODO: verify opt-out handling, suppression, consent records, and DNC checks before describing compliance features. The software does not establish permission to contact someone.
          </p>

          <h2>5. Property data and estimates</h2>
          <p>
            Property data, owner details, value estimates, and comparable sales come from
            third-party providers and may be incomplete or out of date. Estimates such as ARV,
            repair costs, and spread are not appraisals and are not guaranteed. You are responsible
            for checking the numbers before you make or accept an offer.
          </p>

          <h2>6. AI-generated content</h2>
          <p>
            PropSniper uses AI to produce summaries, scores, and draft messages. These can be wrong.
            Review them before you rely on or send them.
          </p>

          <h2>7. Your data</h2>
          <p>
            Proposed policy, subject to owner and lawyer approval: you retain rights to the content you upload and grant the processing rights needed to provide the service. See our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
          <p>TODO: state your export and deletion policy.</p>

          <h2>8. No guarantees and limits on liability</h2>
          <p>
            PropSniper does not guarantee that you will find deals, close contracts, or earn any
            income. The service is provided as is.
          </p>
          <p>TODO: lawyer to add warranty disclaimers, limitation of liability, and governing law.</p>

          <h2>9. Changes</h2>
          <p>
            We may update these terms. If we make a material change, we will tell you by email or
            in the app.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions about these terms? Use the <Link href="/contact">contact page</Link>.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
