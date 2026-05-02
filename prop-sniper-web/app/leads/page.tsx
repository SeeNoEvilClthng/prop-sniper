import { redirect } from "next/navigation";

import LeadOutreachActions from "@/components/LeadOutreachActions";
import LeadCard from "@/components/ui/LeadCard";
import LeadTable, { type LeadTableRow } from "@/components/ui/LeadTable";
import ActionButton from "@/components/ui/ActionButton";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  search?: string;
  status?: string;
  view?: string;
};

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

type LeadRecord = {
  id: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  phone?: string | null;
  status?: string | null;
  lead_score?: number | null;
  ai_summary?: string | null;
  follow_up_date?: string | null;
};

type ContactAttemptRecord = {
  id: string;
  lead_id?: string | null;
  created_at?: string | null;
  method?: string | null;
};

const pipelineColumns = [
  { key: "new_lead", label: "New" },
  { key: "text_sent", label: "Text Sent" },
  { key: "replied", label: "Replied" },
  { key: "ai_calling", label: "AI Calling" },
  { key: "qualified_hot", label: "Hot" },
  { key: "qualified_warm", label: "Warm" },
  { key: "qualified_cold", label: "Cold" },
  { key: "appointment_booked", label: "Appointment Booked" },
  { key: "closed", label: "Closed" },
  { key: "dead", label: "Dead" },
];

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

function getNextAction(status?: string | null, followUpDate?: string | null) {
  if (status === "replied") return "Start the AI call workflow.";
  if (status === "new_lead") return "Send the first safe text.";
  if (status === "text_sent") return "Wait for a reply or follow up later.";
  if (status === "ai_calling") return "Review the AI qualification notes.";
  if (status === "qualified_hot") return "Book the seller appointment.";
  if (isDue(followUpDate)) return "Follow up with the seller today.";
  return "Open the lead and continue qualification.";
}

export default async function LeadsPage({ searchParams }: PageProps) {
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
    .select("id, address, city, state, zip_code, owner_name, owner_phone, phone, status, lead_score, ai_summary, follow_up_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const leadRows = (leads || []) as LeadRecord[];
  const leadIds = leadRows.map((lead) => lead.id);

  let attempts: ContactAttemptRecord[] = [];
  if (leadIds.length > 0) {
    const { data } = await supabase
      .from("contact_attempts")
      .select("id, lead_id, created_at, method")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false });

    attempts = (data || []) as ContactAttemptRecord[];
  }

  const search = (params.search || "").trim().toLowerCase();
  const statusFilter = params.status || "all";
  const view = params.view === "table" ? "table" : "pipeline";

  const filteredLeads = leadRows.filter((lead) => {
    const haystack = [
      lead.address,
      lead.city,
      lead.state,
      lead.owner_name,
      lead.owner_phone,
      lead.phone,
      lead.status,
      lead.zip_code,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !search || haystack.includes(search);
    const matchesStatus = statusFilter === "all" || (lead.status || "") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const lastContactMap = new Map<string, string>();
  attempts.forEach((attempt) => {
    if (!attempt.lead_id || lastContactMap.has(attempt.lead_id)) return;
    lastContactMap.set(attempt.lead_id, formatDate(attempt.created_at));
  });

  const totalLeads = filteredLeads.length;
  const hotLeads = filteredLeads.filter((lead) => (lead.lead_score || 0) >= 80).length;
  const repliedLeads = filteredLeads.filter((lead) => lead.status === "replied").length;
  const followUpsDue = filteredLeads.filter((lead) => isDue(lead.follow_up_date)).length;

  const tableRows: LeadTableRow[] = filteredLeads.map((lead) => ({
    id: lead.id,
    ownerName: lead.owner_name,
    address: [lead.address, lead.city, lead.state].filter(Boolean).join(", "),
    phone: lead.owner_phone || lead.phone,
    status: lead.status,
    score: lead.lead_score,
    aiSummary: lead.ai_summary,
    lastContact: lastContactMap.get(lead.id) || "—",
  }));

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="Saved Leads + CRM"
        title="Work your pipeline without the clutter"
        description="Use the pipeline board when you want to move leads by stage. Switch to the table when you want to scan contact info and AI outreach quickly."
        helper="Hot leads are sellers with stronger motivation and shorter timelines. Only start AI calls after the seller replies."
        actions={
          <>
            <ActionButton href="/dashboard/new" variant="secondary">
              Add Lead
            </ActionButton>
            <ActionButton href="/outreach" variant="primary">
              AI Outreach
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visible Leads" value={String(totalLeads)} detail="Current leads after search and status filters." />
        <StatCard label="Hot Leads" value={String(hotLeads)} detail="Leads already worth moving fast on." />
        <StatCard label="Replied" value={String(repliedLeads)} detail="Sellers who are safe to move into AI calling." />
        <StatCard label="Follow Ups Due" value={String(followUpsDue)} detail="Leads that need seller contact today." />
      </section>

      <section className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <form className="grid flex-1 gap-3 md:grid-cols-[1fr_220px_auto]">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
                Search
              </label>
              <input
                name="search"
                defaultValue={params.search || ""}
                placeholder="Owner, phone, property, city, zip"
                className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </label>
              <select
                name="status"
                defaultValue={statusFilter}
                className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
              >
                <option value="all">All statuses</option>
                {pipelineColumns.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <input type="hidden" name="view" value={view} />
              <ActionButton type="submit" variant="primary">
                Apply
              </ActionButton>
              <ActionButton href={`/leads?view=${view}`} variant="ghost">
                Reset
              </ActionButton>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            <ActionButton href="/leads?view=pipeline" variant={view === "pipeline" ? "primary" : "secondary"}>
              Pipeline
            </ActionButton>
            <ActionButton href="/leads?view=table" variant={view === "table" ? "primary" : "secondary"}>
              Table
            </ActionButton>
          </div>
        </div>
      </section>

      {filteredLeads.length === 0 ? (
        <EmptyState
          title="No saved leads match this view"
          description="Search a city or zip in Finder or click a property on the map to create your next seller lead."
          action={
            <ActionButton href="/finder" variant="primary">
              Open Finder
            </ActionButton>
          }
        />
      ) : view === "table" ? (
        <LeadTable
          rows={tableRows}
          actions={(row) => (
            <>
              <ActionButton href={`/dashboard/${row.id}`} size="sm">
                Open
              </ActionButton>
              <ActionButton href={`/dashboard/${row.id}?tab=outreach`} size="sm" variant="ghost">
                Outreach
              </ActionButton>
            </>
          )}
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-5">
          {pipelineColumns.map((column) => {
            const columnLeads = filteredLeads.filter((lead) => (lead.status || "new_lead") === column.key);

            return (
              <div key={column.key} className="rounded-3xl border border-white/8 bg-[#0b0f17] p-4 xl:min-h-[420px]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-white">{column.label}</h2>
                  <StatusBadge status={column.key} />
                </div>
                <div className="mt-4 space-y-3">
                  {columnLeads.length > 0 ? (
                    columnLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={{
                          id: lead.id,
                          address: lead.address || "No address",
                          city: lead.city,
                          state: lead.state,
                          status: lead.status,
                          owner_name: lead.owner_name,
                          phone: lead.phone,
                          owner_phone: lead.owner_phone,
                          ai_summary: lead.ai_summary,
                          last_contact_at: lastContactMap.get(lead.id) || "No contact yet",
                          score: lead.lead_score,
                          next_action: getNextAction(lead.status, lead.follow_up_date),
                        }}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-slate-500">
                      No leads in this stage.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {view === "table" ? (
        <section className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
          <h2 className="text-xl font-semibold text-white">Fast AI Outreach</h2>
          <p className="mt-1 text-sm text-slate-400">
            Use the table for quick scanning, then jump into outreach on the right leads without opening every record.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredLeads.slice(0, 3).map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="font-semibold text-white">{lead.address || "No address"}</p>
                <p className="mt-1 text-sm text-slate-400">{lead.owner_name || "Unknown owner"}</p>
                <div className="mt-3">
                  <LeadOutreachActions
                    leadId={lead.id}
                    propertyAddress={lead.address || "the property"}
                    status={lead.status}
                    phone={lead.owner_phone || lead.phone || null}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
