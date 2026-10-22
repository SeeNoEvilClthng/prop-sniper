import type { Metadata } from "next";

import MarketingShell from "@/components/marketing/MarketingShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | PropSniper",
  description: "Get in touch with the PropSniper team.",
};

export default function ContactPage() {
  const email = SITE.contactEmail;

  return (
    <MarketingShell>
      <div className="ps-wrap ps-doc">
        <h1>Contact</h1>

        {email ? (
          <div className="ps-prose">
            <p>
              Questions about your account, billing, or the product? Email{" "}
              <a href={`mailto:${email}`}>{email}</a>.
            </p>
          </div>
        ) : (
          <p className="ps-draft">
            Support contact is not available yet. This draft page will show the support address once it is confirmed.
          </p>
        )}
      </div>
    </MarketingShell>
  );
}
