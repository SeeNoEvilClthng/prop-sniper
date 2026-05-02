import { redirect } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Keep setup short and clear. Use this page for the account, integrations, and outreach configuration details that support the main workflow."
      />

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
          <h2 className="text-xl font-semibold text-white">Account</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Signed in as {user.email || "current user"}.
          </p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
          <h2 className="text-xl font-semibold text-white">Outreach Integrations</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Twilio handles safe texting. AI call providers can connect later through Vapi, Retell, or OpenAI Realtime.
          </p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
          <h2 className="text-xl font-semibold text-white">Workflow Rule</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            AI calling is only allowed after the seller replies with interest or consent.
          </p>
        </div>
      </section>
    </main>
  );
}
