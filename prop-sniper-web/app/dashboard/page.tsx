import { redirect } from "next/navigation";

import ActionButton from "@/components/ui/ActionButton";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";

type LeadRecord = {
  id: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  owner_name?: string | null;
  lead_score?: number | null;
  follow_up_date?: string | null;
  ai_summary?: string | null;
};

type ActivityRecord = {
  id: string;
  lead_id?: string | null;
  method?: string | null;
  message?: string | null;
  created_at?: string | null;
};

type AppointmentRecord = {
  id: string;
  lead_id?: string | null;
  scheduled_for?: string | null;
  status?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
}

function isDue(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return due <= current;
}

function formatActivityLabel(method?: string | null) {
  switch (method) {
    case "sms":
      return "Text activity";
    case "call":
      return "Call activity";
    case "workflow":
      return "Workflow update";
    case "note":
      return "New note";
    default:
      return "CRM activity";
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: leads }, { data: activities }, appointmentsResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id, address, city, state, status, owner_name, lead_score, follow_up_date, ai_summary")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_attempts")
      .select("id, lead_id, method, message, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("appointments").select("id, lead_id, scheduled_for, status").limit(20),
  ]);

  const leadRows = (leads || []) as LeadRecord[];
  const activityRows = (activities || []) as ActivityRecord[];
  const appointmentRows = (appointmentsResult.data || []) as AppointmentRecord[];

  const totalLeads = leadRows.length;
  const hotLeads = leadRows.filter((lead) => (lead.lead_score || 0) >= 80).length;
  const followUpsDue = leadRows.filter((lead) => isDue(lead.follow_up_date)).length;
  const appointmentsBooked = appointmentRows.filter(
    (appointment) => appointment.status !== "cancelled"
  ).length;

  const repliedLead = leadRows.find((lead) => lead.status === "replied");
  const dueLead = leadRows.find((lead) => isDue(lead.follow_up_date));
  const freshLead = leadRows.find((lead) => lead.status === "new_lead");
  const nextLead = repliedLead || dueLead || freshLead || leadRows[0] || null;

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="Command Center"
        title="Simple wholesaling workflow"
        description="Keep the app focused on the next conversion step: find a lead, save it, send the first text, wait for the reply, then let AI help qualify."
        helper="Beginner tip: If you are not sure what to do next, work the Next Best Action card first."
        actions={
          <>
            <ActionButton href="/finder" variant="secondary">
              Find Leads
            </ActionButton>
            <ActionButton href="/outreach" variant="primary">
              Open AI Outreach
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Leads" value={String(totalLeads)} detail="All saved leads in your CRM." />
        <StatCard label="Hot Leads" value={String(hotLeads)} detail="Leads already showing strong motivation." />
        <StatCard label="Follow Ups Due" value={String(followUpsDue)} detail="People you should contact again today." />
        <StatCard label="Appointments Booked" value={String(appointmentsBooked)} detail="Seller conversations ready for the next step." />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-violet-200/80">
                  Next Best Action
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {nextLead ? "Work this lead next" : "Start by finding a lead"}
                </h2>
              </div>
              <StatusBadge status={nextLead?.status} size="md" />
            </div>

            {nextLead ? (
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-lg font-semibold text-white">{nextLead.address || "No address"}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {nextLead.owner_name || "Unknown owner"} • {[nextLead.city, nextLead.state].filter(Boolean).join(", ") || "No market"}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {nextLead.status === "replied"
                    ? "The seller replied. Open AI Outreach and start the AI call workflow."
                    : isDue(nextLead.follow_up_date)
                    ? "This lead needs a follow-up now. Review the last message and send the next safe touch."
                    : nextLead.status === "new_lead"
                    ? "This is a new lead. Send the first safe text to start the conversation."
                    : nextLead.ai_summary || "Open the lead and keep the qualification process moving."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton href={`/dashboard/${nextLead.id}`}>Open Lead</ActionButton>
                  <ActionButton href={`/dashboard/${nextLead.id}?tab=outreach`} variant="primary">
                    AI Outreach
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="No leads yet"
                  description="Start here: search a city or zip code to find seller leads, then save one into your CRM."
                  action={
                    <ActionButton href="/finder" variant="primary">
                      Open Finder
                    </ActionButton>
                  }
                />
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Short feed of the latest CRM and outreach events.
                </p>
              </div>
              <ActionButton href="/outreach" variant="ghost">
                View Replies
              </ActionButton>
            </div>

            <div className="mt-4 space-y-3">
              {activityRows.length > 0 ? (
                activityRows.map((activity) => (
                  <div key={activity.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">
                        {formatActivityLabel(activity.method)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {activity.message || "No message saved."}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No activity yet"
                  description="Your text sends, replies, AI call attempts, and CRM updates will show up here."
                />
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Quick Access</h2>
            <div className="mt-4 grid gap-2">
              <ActionButton href="/finder" variant="secondary">
                Find Leads
              </ActionButton>
              <ActionButton href="/map" variant="secondary">
                Open Map
              </ActionButton>
              <ActionButton href="/leads?view=pipeline" variant="secondary">
                Open CRM Pipeline
              </ActionButton>
              <ActionButton href="/outreach" variant="secondary">
                Open AI Outreach
              </ActionButton>
              <ActionButton href="/dashboard/analyzer" variant="secondary">
                Deal Analyzer
              </ActionButton>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Pipeline Snapshot</h2>
            <div className="mt-4 space-y-3">
              {[
                ["New", leadRows.filter((lead) => lead.status === "new_lead").length],
                ["Text Sent", leadRows.filter((lead) => lead.status === "text_sent").length],
                ["Replied", leadRows.filter((lead) => lead.status === "replied").length],
                ["AI Calling", leadRows.filter((lead) => lead.status === "ai_calling").length],
                ["Hot", leadRows.filter((lead) => lead.status === "qualified_hot").length],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-sm text-slate-300">{label}</p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
