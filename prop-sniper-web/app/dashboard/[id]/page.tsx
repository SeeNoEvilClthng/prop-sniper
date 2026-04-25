import Link from "next/link";
import { redirect } from "next/navigation";

import AnalyzeDealButton from "@/components/AnalyzeDealButton";
import ContactActions from "@/components/ContactActions";
import DealAnalyzer from "@/components/DealAnalyzer";
import LeadAssignmentCard from "@/components/LeadAssignmentCard";
import LeadOwnerPhoneCard from "@/components/LeadOwnerPhoneCard";
import LeadTaskPanel from "@/components/LeadTaskPanel";
import LeadTimelineNoteForm from "@/components/LeadTimelineNoteForm";
import LeadWorkflowActions from "@/components/LeadWorkflowActions";
import SendToBuyersButton from "@/components/SendToBuyersButton";
import {
  formatLeadAssignmentSummary,
  parseLeadAssignmentMessage,
} from "@/lib/lead-assignment";
import { getBuyerMatch } from "@/lib/buyer-matching";
import { formatLeadTaskSummary, parseLeadTaskMessage } from "@/lib/lead-tasks";
import { generateLeadSummary, getLeadSignals } from "@/lib/lead-summary";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

type LeadRecord = {
  id: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  zip?: string | null;
  owner_name?: string | null;
  owner_phone?: string | null;
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
  lead_rating?: string | null;
  lead_signals?: string | null;
  likely_distressed?: boolean | null;
  is_absentee_owner?: boolean | null;
  long_term_owner?: boolean | null;
  senior_owner_likely?: boolean | null;
  owner_occupied?: boolean | null;
  ai_analysis?: string | null;
  notes?: string | null;
  follow_up_date?: string | null;
  target_offer?: number | null;
  estimated_repairs?: number | null;
  rehab_level?: "light" | "medium" | "heavy" | null;
  created_at?: string | null;
};

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

function getRatingClasses(rating?: string | null) {
  switch (rating) {
    case "Hot":
      return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30";
    case "Strong":
      return "bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30";
    case "Good":
      return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30";
    case "Fair":
      return "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30";
    default:
      return "bg-white/10 text-slate-200 ring-1 ring-white/10";
  }
}

function getStatusClasses(status?: string | null) {
  switch (status) {
    case "New":
      return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30";
    case "Contacted":
      return "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30";
    case "Follow Up":
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30";
    case "Negotiating":
      return "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30";
    case "Under Contract":
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30";
    case "Dead":
      return "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30";
    default:
      return "bg-white/10 text-slate-200 ring-1 ring-white/10";
  }
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
    : lead.owner_phone
    ? [lead.owner_phone]
    : [];

  const emails = Array.isArray(lead.owner_emails)
    ? lead.owner_emails
    : lead.owner_email
    ? [lead.owner_email]
    : [];

  return { phones, emails };
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-4 shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      {subtext ? <p className="mt-1 text-sm leading-6 text-slate-400">{subtext}</p> : null}
    </div>
  );
}

function MiniInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<LeadRecord>();

  if (leadError || !lead) {
    return (
      <main className="px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <Link href="/leads" className="text-sm text-sky-300 underline">
            Back to Leads
          </Link>
          <p className="mt-4 text-2xl font-semibold">Lead not found.</p>
        </div>
      </main>
    );
  }

  const { beds, baths, sqft, zip } = getLeadNumbers(lead);
  const { phones, emails } = getContactValues(lead);
  const signals = getLeadSignals(lead);

  const [{ data: contactAttempts, error: attemptsError }, { data: investors }] =
    await Promise.all([
      supabase
        .from("contact_attempts")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("investors")
        .select("*")
        .or(`user_id.eq.${user.id},is_public.eq.true`),
    ]);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role")
    .order("email", { ascending: true });

  const buyerMatches = (investors || [])
    .map((investor) => ({
      investor,
      match: getBuyerMatch(lead, investor),
    }))
    .filter((item) => item.match.score >= 35)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 5);

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
    })
    .sort((a, b) => {
      if (a.status === b.status) {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }

      return a.status === "completed" ? 1 : -1;
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
  if (
    assignmentOptions.length === 0 &&
    user.email
  ) {
    assignmentOptions.push({
      id: user.id,
      email: user.email,
      role: "user",
    });
  }

  const leadSummary = await generateLeadSummary(lead);
  const activityFeed = [
    lead.created_at
      ? {
          id: `lead-created-${lead.id}`,
          title: "Lead created",
          detail: "Lead entered the system and is ready for qualification.",
          timestamp: lead.created_at,
        }
      : null,
    lead.follow_up_date
      ? {
          id: `follow-up-${lead.id}`,
          title: "Next follow-up scheduled",
          detail: `Follow-up is set for ${formatDate(lead.follow_up_date)}.`,
          timestamp: lead.follow_up_date,
        }
      : null,
    ...(contactAttempts || []).map((attempt) => ({
      id: `attempt-${attempt.id}`,
      title:
        attempt.method === "assignment"
          ? "LEAD ASSIGNMENT"
          :
        attempt.method === "task"
          ? `TASK ${attempt.status || "open"}`
          : `${attempt.method?.toUpperCase() || "OUTREACH"} ${attempt.status || "sent"}`,
      detail:
        attempt.method === "assignment"
          ? formatLeadAssignmentSummary(parseLeadAssignmentMessage(attempt.message))
          :
        attempt.method === "task"
          ? formatLeadTaskSummary(parseLeadTaskMessage(attempt.message))
          : attempt.message || "No message saved",
      timestamp: attempt.created_at || "",
    })),
  ]
    .filter(
      (
        item
      ): item is {
        id: string;
        title: string;
        detail: string;
        timestamp: string;
      } => Boolean(item?.timestamp)
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  return (
    <main className="text-white">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.30)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Link
                href="/leads"
                className="text-sm font-medium text-[#ead9a8] transition hover:text-white"
              >
                Back to Leads
              </Link>

              <p className="mt-4 text-[11px] uppercase tracking-[0.34em] text-[#c4b5fd]">
                Acquisition Workspace
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
                {lead.address || "No address"}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {[lead.city, lead.state, zip].filter(Boolean).join(", ") || "No location"}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    lead.status
                  )}`}
                >
                  {lead.status || "No status"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRatingClasses(
                    lead.lead_rating
                  )}`}
                >
                  {lead.lead_rating || "Unrated"}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                  Score {lead.lead_score ?? "—"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                  Owner {currentAssignment.assigneeEmail}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#lead-summary"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Summary
                </a>
                <a
                  href="#deal-desk"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Deal Desk
                </a>
                <a
                  href="#timeline"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Timeline
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/dashboard/${lead.id}/edit`}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Edit Lead
              </Link>
              <AnalyzeDealButton
                leadId={lead.id}
                rehabLevel={lead.rehab_level || "medium"}
              />
              <SendToBuyersButton leadId={lead.id} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Estimated Value"
            value={formatMoney(lead.estimated_value)}
            subtext="Current property estimate"
          />
          <StatCard
            label="Target Offer"
            value={formatMoney(lead.target_offer)}
            subtext="Current acquisition target"
          />
          <StatCard
            label="Estimated Repairs"
            value={formatMoney(lead.estimated_repairs)}
            subtext={lead.rehab_level ? `${lead.rehab_level} rehab profile` : undefined}
          />
          <StatCard
            label="Next Follow Up"
            value={formatDate(lead.follow_up_date)}
            subtext="Keep the seller cadence moving"
          />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <section className="space-y-6">
            <div id="lead-summary" className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    AI Lead Brief
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">What matters here</h2>
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {leadSummary}
              </p>

              {lead.ai_analysis ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    Deal Analysis On File
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {lead.ai_analysis}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Motivation Signals</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                These are the main reasons this property may be worth pursuing.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {signals.length > 0 ? (
                  signals.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-full bg-sky-500/15 px-3 py-2 text-sm font-medium text-sky-200 ring-1 ring-sky-400/30"
                    >
                      {signal}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-white/10 px-3 py-2 text-sm text-slate-300">
                    No clear signals yet
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <MiniInfoCard
                  label="Owner Occupied"
                  value={
                    lead.owner_occupied == null
                      ? "Unknown"
                      : lead.owner_occupied
                      ? "Yes"
                      : "No"
                  }
                />
                <MiniInfoCard
                  label="Years Owned"
                  value={
                    lead.years_owned != null
                      ? `${lead.years_owned} yrs`
                      : "Unknown"
                  }
                />
                <MiniInfoCard
                  label="Property Age"
                  value={
                    lead.property_age != null
                      ? `${lead.property_age} yrs`
                      : "Unknown"
                  }
                />
              </div>
            </div>

            <div id="deal-desk" className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Deal Desk</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Underwrite the deal, pressure-test the numbers, and prep seller or buyer messaging.
              </p>

              <div className="mt-6">
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
            </div>

            <div id="timeline" className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Activity Timeline</h2>

              <div className="mt-4">
                <LeadTimelineNoteForm leadId={lead.id} />
              </div>

              {attemptsError ? (
                <p className="mt-4 text-rose-300">
                  Could not load contact history.
                </p>
              ) : activityFeed.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {activityFeed.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-4"
                    >
                      <p className="font-medium text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {item.detail}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-400">No workflow activity yet.</p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Lead Snapshot</h2>

              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <MiniInfoCard label="Owner" value={lead.owner_name || "No owner saved"} />
                <MiniInfoCard label="Seller Phone" value={phones[0] || "—"} />
                <MiniInfoCard label="Seller Email" value={emails[0] || "—"} />
                <MiniInfoCard
                  label="Beds / Baths"
                  value={`${beds ?? "—"} / ${baths ?? "—"}`}
                />
                <MiniInfoCard
                  label="Square Feet"
                  value={sqft ? Number(sqft).toLocaleString() : "—"}
                />
                <MiniInfoCard
                  label="Last Sale"
                  value={formatDate(lead.last_sale_date)}
                />
                <MiniInfoCard
                  label="Est. Rent"
                  value={formatMoney(lead.estimated_rent)}
                />
                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    Notes
                  </p>
                  <p className="mt-2 leading-7 text-slate-300">
                    {lead.notes || "No notes saved yet."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Seller Outreach</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Log contact attempts and keep seller communication in one place.
              </p>

              <div className="mt-5">
                <ContactActions leadId={lead.id} phones={phones} emails={emails} />
              </div>
            </div>

            <LeadOwnerPhoneCard leadId={lead.id} currentPhone={lead.owner_phone} />

            <LeadWorkflowActions
              leadId={lead.id}
              currentStatus={lead.status}
              currentFollowUpDate={lead.follow_up_date}
            />

            <LeadAssignmentCard
              leadId={lead.id}
              currentAssigneeId={currentAssignment.assigneeId}
              currentAssigneeEmail={currentAssignment.assigneeEmail}
              options={assignmentOptions}
            />

            <LeadTaskPanel leadId={lead.id} tasks={leadTasks} />

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Buyer Matches</h2>
                  <p className="mt-2 text-slate-300">
                    Best buyers to dispo this deal to right now.
                  </p>
                </div>
                <Link
                  href="/investors"
                  className="text-sm font-medium text-sky-200 transition hover:text-white"
                >
                  Open Buyers
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {buyerMatches.length > 0 ? (
                  buyerMatches.map(({ investor, match }) => (
                    <div
                      key={investor.id}
                      className="rounded-2xl border border-white/10 bg-[#0d1727] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">
                            {investor.company_name || investor.contact_name || "Unnamed buyer"}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {match.label}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                          {match.score}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {match.reasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-4 text-sm text-slate-400">
                    No strong buyer matches yet. Add buyers with markets and buy-box details to improve dispo recommendations.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
