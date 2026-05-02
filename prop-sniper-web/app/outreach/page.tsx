import { redirect } from "next/navigation";

import LeadOutreachActions from "@/components/LeadOutreachActions";
import ActionButton from "@/components/ui/ActionButton";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";

type LeadRecord = {
  id: string;
  address?: string | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  phone?: string | null;
  status?: string | null;
  ai_summary?: string | null;
};

type OutreachMessage = {
  id: string;
  lead_id?: string | null;
  direction?: string | null;
  body?: string | null;
  created_at?: string | null;
};

type CallLog = {
  id: string;
  lead_id?: string | null;
  status?: string | null;
  ai_summary?: string | null;
  created_at?: string | null;
};

export default async function OutreachPage({
  searchParams,
}: {
  searchParams?: Promise<{ lead?: string }>;
}) {
  const params = (await searchParams) || {};
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, address, owner_name, owner_phone, phone, status, ai_summary")
    .eq("user_id", user.id)
    .in("status", ["new_lead", "text_sent", "replied", "ai_calling", "qualified_hot", "qualified_warm"]);

  const leadRows = (leads || []) as LeadRecord[];
  const leadIds = leadRows.map((lead) => lead.id);

  const [{ data: messages }, { data: callLogs }] = await Promise.all([
    leadIds.length
      ? supabase
          .from("outreach_messages")
          .select("id, lead_id, direction, body, created_at")
          .in("lead_id", leadIds)
          .order("created_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
    leadIds.length
      ? supabase
          .from("call_logs")
          .select("id, lead_id, status, ai_summary, created_at")
          .in("lead_id", leadIds)
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
  ]);

  const selectedLead = leadRows.find((lead) => lead.id === params.lead) || leadRows[0] || null;
  const replies = ((messages || []) as OutreachMessage[]).filter((message) => message.direction === "inbound");
  const dncList = leadRows.filter((lead) => lead.status === "do_not_contact");

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="AI Outreach"
        title="Action-first seller outreach"
        description="Send the first safe text, watch replies, then move interested sellers into the AI call workflow. Never start AI calling before the seller replies."
        helper="Short rule: Text first. AI call second. Appointment after qualification."
        actions={
          <>
            <ActionButton href="/leads?view=table" variant="secondary">
              Saved Leads
            </ActionButton>
            <ActionButton href="/appointments" variant="primary">
              Appointments
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Seller Inbox</h2>
            <p className="mt-1 text-sm text-slate-400">
              View the most recent seller responses and route interested leads into AI qualification.
            </p>

            <div className="mt-4 space-y-3">
              {replies.length > 0 ? (
                replies.map((reply) => {
                  const lead = leadRows.find((item) => item.id === reply.lead_id);
                  return (
                    <div key={reply.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {lead?.address || "Unknown lead"}
                        </p>
                        <StatusBadge status={lead?.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{lead?.owner_name || "Unknown owner"}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{reply.body || "No message body"}</p>
                      {lead ? (
                        <div className="mt-4">
                          <LeadOutreachActions
                            leadId={lead.id}
                            propertyAddress={lead.address || "the property"}
                            status={lead.status}
                            phone={lead.owner_phone || lead.phone || null}
                            compact
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  title="No seller replies yet"
                  description="When sellers reply to your first texts, they will show up here so you can safely trigger the next step."
                />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">AI Call Status</h2>
            <div className="mt-4 space-y-3">
              {(callLogs || []).length > 0 ? (
                ((callLogs || []) as CallLog[]).map((log) => {
                  const lead = leadRows.find((item) => item.id === log.lead_id);
                  return (
                    <div key={log.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {lead?.address || "Unknown lead"}
                        </p>
                        <StatusBadge status={lead?.status || log.status} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {log.ai_summary || "No AI summary saved yet."}
                      </p>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  title="No AI calls started"
                  description="AI call attempts will appear here after a seller replies and the workflow is triggered."
                />
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Selected Lead</h2>
            {selectedLead ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-lg font-semibold text-white">{selectedLead.address || "No address"}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedLead.owner_name || "Unknown owner"} • {selectedLead.owner_phone || selectedLead.phone || "No phone"}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={selectedLead.status} />
                  </div>
                </div>

                <LeadOutreachActions
                  leadId={selectedLead.id}
                  propertyAddress={selectedLead.address || "the property"}
                  status={selectedLead.status}
                  phone={selectedLead.owner_phone || selectedLead.phone || null}
                />
              </div>
            ) : (
              <EmptyState
                title="No active outreach lead"
                description="Start in Saved Leads or Finder, then send the first safe text from a lead record."
              />
            )}
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Do Not Contact</h2>
            <div className="mt-4 space-y-3">
              {dncList.length > 0 ? (
                dncList.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">{lead.address || "No address"}</p>
                    <p className="mt-1 text-sm text-slate-400">{lead.owner_name || "Unknown owner"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No leads marked do not contact right now.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
