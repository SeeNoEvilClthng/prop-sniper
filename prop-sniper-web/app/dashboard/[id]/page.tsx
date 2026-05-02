import Link from "next/link";
import { redirect } from "next/navigation";

import AnalyzeDealButton from "@/components/AnalyzeDealButton";
import ContactActions from "@/components/ContactActions";
import DealAnalyzer from "@/components/DealAnalyzer";
import LeadAssignmentCard from "@/components/LeadAssignmentCard";
import LeadOutreachActions from "@/components/LeadOutreachActions";
import LeadOwnerPhoneCard from "@/components/LeadOwnerPhoneCard";
import LeadTaskPanel from "@/components/LeadTaskPanel";
import LeadTimelineNoteForm from "@/components/LeadTimelineNoteForm";
import LeadWorkflowActions from "@/components/LeadWorkflowActions";
import SendToBuyersButton from "@/components/SendToBuyersButton";
import ActionButton from "@/components/ui/ActionButton";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  parseLeadAssignmentMessage,
  formatLeadAssignmentSummary,
} from "@/lib/lead-assignment";
import { formatLeadTaskSummary, parseLeadTaskMessage } from "@/lib/lead-tasks";
import { generateLeadSummary, getLeadSignals } from "@/lib/lead-summary";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

type LeadRecord = {
  id: string;
  address?: string | null;
  property_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  zip?: string | null;
  owner_name?: string | null;
  phone?: string | null;
  owner_phone?: string | null;
  email?: string | null;
  owner_email?: string | null;
  owner_phones?: string[] | null;
  owner_emails?: string[] | null;
  status?: string | null;
  estimated_value?: number | null;
  estimated_rent?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  beds?: number | null;
  baths?: number | null;
  square_footage?: number | null;
  sqft?: number | null;
  property_age?: number | null;
  years_owned?: number | null;
  last_sale_date?: string | null;
  lead_score?: number | null;
  total_score?: number | null;
  lead_rating?: string | null;
  lead_signals?: string | null;
  likely_distressed?: boolean | null;
  is_absentee_owner?: boolean | null;
  long_term_owner?: boolean | null;
  senior_owner_likely?: boolean | null;
  owner_occupied?: boolean | null;
  ai_analysis?: string | null;
  ai_summary?: string | null;
  notes?: string | null;
  follow_up_date?: string | null;
  last_contact_at?: string | null;
  target_offer?: number | null;
  estimated_repairs?: number | null;
  rehab_level?: "light" | "medium" | "heavy" | null;
  created_at?: string | null;
};

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "property", label: "Property" },
  { key: "owner", label: "Owner" },
  { key: "outreach", label: "Outreach" },
  { key: "ai-notes", label: "AI Notes" },
  { key: "deal-analysis", label: "Deal Analysis" },
  { key: "tasks", label: "Tasks" },
] as const;

function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function getLeadNumbers(lead: LeadRecord) {
  return {
    beds: lead.bedrooms ?? lead.beds ?? null,
    baths: lead.bathrooms ?? lead.baths ?? null,
    sqft: lead.square_footage ?? lead.sqft ?? null,
    zip: lead.zip_code ?? lead.zip ?? null,
  };
}

function getContactValues(lead: LeadRecord) {
  const phones = Array.isArray(lead.owner_phones)
    ? lead.owner_phones
    : lead.phone
      ? [lead.phone]
      : lead.owner_phone
        ? [lead.owner_phone]
        : [];

  const emails = Array.isArray(lead.owner_emails)
    ? lead.owner_emails
    : lead.email
      ? [lead.email]
      : lead.owner_email
        ? [lead.owner_email]
        : [];

  return { phones, emails };
}

function getNextAction(status?: string | null, followUpDate?: string | null) {
  if (status === "replied") return "Start the AI call workflow.";
  if (status === "new_lead") return "Send the first safe text.";
  if (status === "text_sent") return "Wait for a seller reply before calling.";
  if (status === "ai_calling") return "Review AI qualification notes.";
  if (status === "qualified_hot") return "Book the appointment and prepare the offer.";
  if (followUpDate) return `Follow up on ${formatDate(followUpDate)}.`;
  return "Open outreach and move the lead forward.";
}

function MiniCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  );
}

export default async function LeadDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const currentTab = (await searchParams)?.tab || "overview";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<LeadRecord>();

  if (!lead) {
    return (
      <main>
        <PageHeader
          eyebrow="Lead"
          title="Lead not found"
          description="This lead is missing or no longer belongs to your workspace."
          actions={<ActionButton href="/leads?view=table">Back to Leads</ActionButton>}
        />
      </main>
    );
  }

  const { beds, baths, sqft, zip } = getLeadNumbers(lead);
  const { phones, emails } = getContactValues(lead);
  const signals = getLeadSignals(lead);
  const summary = await generateLeadSummary(lead);
  const totalScore = lead.total_score ?? lead.lead_score ?? null;

  const { data: contactAttempts } = await supabase
    .from("contact_attempts")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role")
    .order("email", { ascending: true });

  const leadTasks = (contactAttempts || [])
    .filter((attempt) => attempt.method === "task")
    .map((task) => {
      const parsed = parseLeadTaskMessage(task.message);
      return {
        id: String(task.id),
        title: parsed.title,
        dueDate: parsed.dueDate,
        details: parsed.details,
        status: task.status || "open",
        createdAt: task.created_at || null,
      };
    });

  const latestAssignmentAttempt = (contactAttempts || []).find(
    (attempt) => attempt.method === "assignment"
  );
  const currentAssignment = latestAssignmentAttempt
    ? parseLeadAssignmentMessage(latestAssignmentAttempt.message)
    : {
        assigneeId: user.id,
        assigneeEmail: user.email || "Current user",
        assigneeRole: "user",
      };

  const assignmentOptions = ((profiles || []) as Array<{
    id: string;
    email?: string | null;
    role?: string | null;
  }>)
    .filter((profile) => profile.email)
    .map((profile) => ({
      id: profile.id,
      email: profile.email || "",
      role: profile.role || "user",
    }));

  const activityFeed = (contactAttempts || []).slice(0, 8).map((attempt) => ({
    id: String(attempt.id),
    title:
      attempt.method === "assignment"
        ? "Assignment updated"
        : attempt.method === "task"
          ? `Task ${attempt.status || "open"}`
          : `${attempt.method || "crm"} ${attempt.status || "logged"}`,
    detail:
      attempt.method === "assignment"
        ? formatLeadAssignmentSummary(parseLeadAssignmentMessage(attempt.message))
        : attempt.method === "task"
          ? formatLeadTaskSummary(parseLeadTaskMessage(attempt.message))
          : attempt.message || "No message saved",
    timestamp: attempt.created_at || "",
  }));

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="Lead Detail"
        title={lead.address || "No address"}
        description={`${lead.owner_name || "Unknown owner"} • ${[lead.city, lead.state, zip].filter(Boolean).join(", ") || "No market"}`}
        helper={getNextAction(lead.status, lead.follow_up_date)}
        actions={
          <>
            <StatusBadge status={lead.status} size="md" />
            <ActionButton href="/leads?view=table" variant="ghost">
              Back to Leads
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lead Score" value={String(totalScore ?? "—")} detail="Combined motivation and opportunity score." />
        <StatCard label="Seller Phone" value={phones[0] || "—"} detail="Primary number for outreach." />
        <StatCard label="Next Follow Up" value={formatDate(lead.follow_up_date)} detail="Keep the workflow moving." />
        <StatCard label="Asking / Target" value={`${formatMoney(lead.target_offer)} / ${formatMoney(lead.estimated_value)}`} detail="Quick value snapshot." />
      </section>

      <section className="rounded-3xl border border-white/8 bg-[#0b0f17] p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/dashboard/${lead.id}?tab=${tab.key}`}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                currentTab === tab.key
                  ? "bg-violet-500/15 text-violet-100"
                  : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </section>

      {currentTab === "overview" ? (
        <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
              <h2 className="text-xl font-semibold text-white">Overview</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <MiniCard label="Owner" value={lead.owner_name || "Unknown owner"} />
                <MiniCard label="Phone" value={phones[0] || "No phone saved"} />
                <MiniCard label="Motivation" value={signals[0] || "No motivation signal yet"} />
                <MiniCard label="Timeline" value={lead.follow_up_date ? `Follow up by ${formatDate(lead.follow_up_date)}` : "Timeline not set"} />
                <MiniCard label="Asking Price" value={formatMoney(lead.target_offer)} />
                <MiniCard label="Next Action" value={getNextAction(lead.status, lead.follow_up_date)} />
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
              <h2 className="text-xl font-semibold text-white">AI Summary</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {lead.ai_summary || lead.ai_analysis || summary}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
              <h2 className="text-xl font-semibold text-white">Quick AI Outreach</h2>
              <div className="mt-4">
                <LeadOutreachActions
                  leadId={lead.id}
                  propertyAddress={lead.property_address || lead.address || "the property"}
                  status={lead.status}
                  phone={phones[0] || null}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <div className="mt-4 space-y-3">
                {activityFeed.length > 0 ? (
                  activityFeed.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {currentTab === "property" ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <MiniCard label="Beds / Baths" value={`${beds ?? "—"} / ${baths ?? "—"}`} />
          <MiniCard label="Square Feet" value={sqft ? Number(sqft).toLocaleString() : "—"} />
          <MiniCard label="Estimated Value" value={formatMoney(lead.estimated_value)} />
          <MiniCard label="Target Offer" value={formatMoney(lead.target_offer)} />
          <MiniCard label="Estimated Repairs" value={formatMoney(lead.estimated_repairs)} />
          <MiniCard label="Last Sale Date" value={formatDate(lead.last_sale_date)} />
        </section>
      ) : null}

      {currentTab === "owner" ? (
        <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
              <h2 className="text-xl font-semibold text-white">Owner Details</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <MiniCard label="Owner Name" value={lead.owner_name || "Unknown"} />
                <MiniCard label="Phone" value={phones[0] || "No phone saved"} />
                <MiniCard label="Email" value={emails[0] || "No email saved"} />
                <MiniCard label="Owner Occupied" value={lead.owner_occupied == null ? "Unknown" : lead.owner_occupied ? "Yes" : "No"} />
                <MiniCard label="Years Owned" value={lead.years_owned ? `${lead.years_owned} years` : "Unknown"} />
                <MiniCard label="Long Term Owner" value={lead.long_term_owner ? "Yes" : "No"} />
              </div>
            </div>

            <LeadOwnerPhoneCard leadId={lead.id} currentPhone={lead.owner_phone} />
          </div>

          <div className="space-y-5">
            <LeadAssignmentCard
              leadId={lead.id}
              currentAssigneeId={currentAssignment.assigneeId}
              currentAssigneeEmail={currentAssignment.assigneeEmail}
              options={assignmentOptions}
            />
          </div>
        </section>
      ) : null}

      {currentTab === "outreach" ? (
        <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Seller Outreach</h2>
            <p className="mt-2 text-sm text-slate-400">
              Send the first safe text, wait for the reply, then use AI calling only after interest.
            </p>
            <div className="mt-5">
              <ContactActions
                leadId={lead.id}
                phones={phones}
                emails={emails}
                propertyAddress={lead.property_address || lead.address || undefined}
                currentStatus={lead.status}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Quick Outreach Buttons</h2>
            <div className="mt-4">
              <LeadOutreachActions
                leadId={lead.id}
                propertyAddress={lead.property_address || lead.address || "the property"}
                status={lead.status}
                phone={phones[0] || null}
              />
            </div>
          </div>
        </section>
      ) : null}

      {currentTab === "ai-notes" ? (
        <section className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">AI Notes</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {lead.ai_summary || lead.ai_analysis || summary}
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Recent CRM Notes</h2>
            <div className="mt-4">
              <LeadTimelineNoteForm leadId={lead.id} />
            </div>
            <div className="mt-4 space-y-3">
              {activityFeed.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {currentTab === "deal-analysis" ? (
        <section className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <AnalyzeDealButton leadId={lead.id} rehabLevel={lead.rehab_level || "medium"} />
            <SendToBuyersButton leadId={lead.id} />
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <DealAnalyzer
              address={lead.address}
              city={lead.city}
              state={lead.state}
              sqft={sqft}
              estimatedValue={lead.estimated_value}
              beds={beds}
              baths={baths}
            />
          </div>
        </section>
      ) : null}

      {currentTab === "tasks" ? (
        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <LeadWorkflowActions
              leadId={lead.id}
              currentStatus={lead.status}
              currentFollowUpDate={lead.follow_up_date}
            />
            <LeadTaskPanel leadId={lead.id} tasks={leadTasks} />
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
            <h2 className="text-xl font-semibold text-white">Task Timeline</h2>
            <div className="mt-4">
              <LeadTimelineNoteForm leadId={lead.id} />
            </div>
            <div className="mt-4 space-y-3">
              {activityFeed.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
