import Link from "next/link";

import LeadOutreachActions from "@/components/LeadOutreachActions";
import ActionButton from "@/components/ui/ActionButton";
import StatusBadge from "@/components/ui/StatusBadge";

type Lead = {
  id: string;
  address: string;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  owner_name?: string | null;
  phone?: string | null;
  owner_phone?: string | null;
  ai_summary?: string | null;
  last_contact_at?: string | null;
  score?: number | null;
  next_action?: string | null;
};

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-[#0b0f17] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/${lead.id}`} className="text-lg font-semibold text-white hover:text-violet-200">
              {lead.address}
            </Link>
            <StatusBadge status={lead.status} />
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
              Score {lead.score ?? "—"}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            {lead.owner_name || "Unknown owner"} • {[lead.city, lead.state].filter(Boolean).join(", ") || "No market"}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Phone</p>
              <p className="mt-1 text-sm text-white">{lead.owner_phone || lead.phone || "No phone"}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Last Contact</p>
              <p className="mt-1 text-sm text-white">{lead.last_contact_at || "No contact yet"}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Next Action</p>
              <p className="mt-1 text-sm text-white">{lead.next_action || "Open the lead and continue qualification."}</p>
            </div>
          </div>

          {lead.ai_summary ? (
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">{lead.ai_summary}</p>
          ) : null}
        </div>

        <div className="w-full max-w-sm space-y-3 xl:w-[360px]">
          <LeadOutreachActions
            leadId={lead.id}
            propertyAddress={lead.address}
            status={lead.status}
            phone={lead.owner_phone || lead.phone || null}
            compact
          />

          <div className="flex flex-wrap gap-2">
            <ActionButton href={`/dashboard/${lead.id}`}>Open Lead</ActionButton>
            <ActionButton href={`/dashboard/${lead.id}?tab=deal-analysis`} variant="ghost">
              Deal Analysis
            </ActionButton>
          </div>
        </div>
      </div>
    </article>
  );
}
