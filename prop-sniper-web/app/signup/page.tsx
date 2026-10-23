import { Check } from "lucide-react";
import type { Metadata } from "next";

import MarketingShell from "@/components/marketing/MarketingShell";
import SignupForm from "@/components/marketing/SignupForm";
import { SITE, STARTER_FEATURES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start your free trial | PropSniper",
  description: `Try PropSniper free for ${SITE.trialDays} days. Then $${SITE.starterPrice}/month unless you cancel.`,
};

export default function SignupPage() {
  return (
    <MarketingShell>
      <div className="ps-wrap ps-signup">
        <div>
          <h1>Try PropSniper free for {SITE.trialDays} days.</h1>
          <p className="ps-hero-sub">
            Full Starter access during the trial. After {SITE.trialDays} days it becomes $
            {SITE.starterPrice}/month unless you cancel.
          </p>

          <ul className="ps-checks">
            {STARTER_FEATURES.map((feature) => (
              <li key={feature}>
                <Check aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <SignupForm />
      </div>
    </MarketingShell>
  );
}
