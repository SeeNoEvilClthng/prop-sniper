import { redirect } from "next/navigation";

import ActionButton from "@/components/ui/ActionButton";
import PageHeader from "@/components/ui/PageHeader";
import ScoreRing from "@/components/ui/ScoreRing";
import StatusBadge from "@/components/ui/StatusBadge";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { createClient } from "@/lib/supabase/server";

type LeadRecord = {
  id: string;
  address?: string | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  status?: string | null;
  total_score?: number | null;
  ai_summary?: string | null;
};

type ActivityRecord = {
  id: string;
  lead_id?: string | null;
  method?: string | null;
  message?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type AppointmentRecord = {
  id: string;
  lead_id?: string | null;
  scheduled_for?: string | null;
  status?: string | null;
};

const stages = [
  ["new_lead", "New Lead"],
  ["text_sent", "Text Sent"],
  ["replied", "Seller Replied"],
  ["ai_calling", "AI Call"],
  ["qualified_hot", "Qualified"],
  ["appointment_booked", "Appointment Booked"],
  ["offer_ready", "Offer Ready"],
] as const;

function isQualified(status?: string | null) {
  return status === "qualified_hot" || status === "qualified_warm" || status === "qualified_cold";
}

function formatActivity(method?: string | null, status?: string | null) {
  if (method === "sms") return status === "inbound" ? "Seller reply received" : "Text sent";
  if (method === "call") return "AI or manual call logged";
  if (method === "workflow") return "Pipeline updated";
  if (method === "note") return "AI note added";
  return "AI agent activity";
}

export default async function AIAgentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: leads }, { data: activity }, { data: appointments }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, address, owner_name, owner_phone, status, total_score, ai_summary")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(40),
    supabase
      .from("contact_attempts")
      .select("id, lead_id, method, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("appointments")
      .select("id, lead_id, scheduled_for, status")
      .order("scheduled_for", { ascending: true })
      .limit(8),
  ]);

  const leadRows = (leads || []) as LeadRecord[];
  const activityRows = (activity || []) as ActivityRecord[];
  const appointmentRows = (appointments || []) as AppointmentRecord[];

  const hottestLead =
    leadRows
      .filter((lead) => typeof lead.total_score === "number")
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))[0] || null;

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="AI Agent"
        title="AI-powered seller conversion"
        description="Track replies, AI call progress, qualification results, and appointment readiness from one clean control room."
        helper="Compliance reminder: The AI agent must disclose it is an assistant or AI when calling or texting if required by law."
        actions={
          <>
            <ActionButton href="/campaigns" variant="secondary">
              Campaign Controls
            </ActionButton>
            <ActionButton href="/appointments" variant="primary">
              Book Appointment
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-white/8 bg-[#0b0f17] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Lead Pipeline</h2>
              <p className="mt-1 text-sm text-slate-400">Simple AI handoff from first text to appointment.</p>
            </div>
            <TypingIndicator label="AI monitoring replies" />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stages.map(([key, label]) => {
              const count =
                key === "qualified_hot"
                  ? leadRows.filter((lead) => isQualified(lead.status)).length
                  : key === "offer_ready"
                    ? leadRows.filter((lead) => (lead.total_score || 0) >= 85).length
                    : leadRows.filter((lead) => lead.status === key).length;

              return (
                <div key={key} className="hover-lift hover-glow rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-[#0b0f17] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Hottest Lead</h2>
              <p className="mt-1 text-sm text-slate-400">Best score in the current AI queue.</p>
            </div>
            <ScoreRing score={hottestLead?.total_score || 0} label="Lead" />
          </div>

          {hottestLead ? (
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-lg font-semibold text-white">{hottestLead.address || "No address"}</p>
              <p className="mt-1 text-sm text-slate-400">
                {hottestLead.owner_name || "Unknown owner"} • {hottestLead.owner_phone || "No phone"}
              </p>
              <div className="mt-3">
                <StatusBadge status={hottestLead.status} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {hottestLead.ai_summary || "No AI summary available yet."}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No scored leads yet.</p>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/8 bg-[#0b0f17] p-5">
          <h2 className="text-xl font-semibold text-white">AI Activity Feed</h2>
          <div className="mt-4 space-y-3">
            {activityRows.map((item) => (
              <div key={item.id} className="hover-lift rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">
                    {formatActivity(item.method, item.status)}
                  </p>
                  <span className="text-xs text-slate-500">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.message || "No detail saved."}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-[#0b0f17] p-5">
          <h2 className="text-xl font-semibold text-white">Seller Qualification Checklist</h2>
          <div className="mt-4 space-y-3">
            {[
              "Confirm seller interest before calling",
              "Ask whether they are open to a cash offer",
              "Capture condition and repair needs",
              "Capture selling reason and timeline",
              "Capture price expectation",
              "Offer human callback or appointment",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-[#0b0f17] p-5">
          <h2 className="text-xl font-semibold text-white">Appointment Booking</h2>
          <div className="mt-4 space-y-3">
            {appointmentRows.length > 0 ? (
              appointmentRows.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge status={appointment.status || "appointment_booked"} />
                    <span className="text-xs text-slate-500">
                      {appointment.scheduled_for
                        ? new Date(appointment.scheduled_for).toLocaleString()
                        : "Pending"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    Lead ID: {appointment.lead_id || "Not linked"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No appointments booked from AI yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-amber-400/18 bg-amber-500/8 p-5">
        <h2 className="text-lg font-semibold text-amber-100">Compliance Warning</h2>
        <p className="mt-2 text-sm leading-6 text-amber-50/90">
          The AI agent must clearly disclose it is an assistant or AI when contacting sellers if required by law. Do not trigger AI calls until the seller has replied with interest or consent.
        </p>
      </section>
    </main>
  );
}
