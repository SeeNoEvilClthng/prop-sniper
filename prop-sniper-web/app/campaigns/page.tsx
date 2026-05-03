import { redirect } from "next/navigation";

import ActionButton from "@/components/ui/ActionButton";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { createClient } from "@/lib/supabase/server";

type LeadRecord = {
  id: string;
  address?: string | null;
  status?: string | null;
};

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("id, address, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24);

  const leadRows = (leads || []) as LeadRecord[];
  const campaignPool = leadRows.filter((lead) => lead.status === "new_lead" || lead.status === "text_sent");

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="Campaigns"
        title="Campaign controls"
        description="Launch first-contact campaigns, watch delivery, and route interested sellers into the AI Agent lane."
        actions={
          <>
            <ActionButton href="/ai-agent" variant="primary">
              Open AI Agent
            </ActionButton>
            <ActionButton href="/outreach" variant="secondary">
              Seller Inbox
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/8 bg-[#0b0f17] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Campaign Queue</h2>
              <p className="mt-1 text-sm text-slate-400">Leads ready for first-contact messaging.</p>
            </div>
            <TypingIndicator label="Preparing AI copy" />
          </div>

          <div className="mt-4 space-y-3">
            {campaignPool.slice(0, 8).map((lead) => (
              <div key={lead.id} className="hover-lift rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{lead.address || "No address"}</p>
                  <StatusBadge status={lead.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-[#0b0f17] p-5">
          <h2 className="text-xl font-semibold text-white">Templates</h2>
          <div className="mt-4 space-y-3">
            {[
              "Hi, is this the owner of [property address]? I had a quick question about the property.",
              "Just following up on the property at [property address]. If you are open to a conversation, text me back here. Reply STOP to opt out.",
              "Thanks for replying. Our assistant can ask a few quick questions to see if the property is a fit. Would that be okay?",
            ].map((template) => (
              <div key={template} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                {template}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
