import Link from "next/link";
import type { ReactNode } from "react";

import StatusBadge from "@/components/ui/StatusBadge";

export type LeadTableRow = {
  id: string;
  ownerName?: string | null;
  address: string;
  phone?: string | null;
  status?: string | null;
  score?: number | null;
  aiSummary?: string | null;
  lastContact?: string | null;
};

type LeadTableProps = {
  rows: LeadTableRow[];
  actions?: (row: LeadTableRow) => ReactNode;
};

export default function LeadTable({ rows, actions }: LeadTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0b0f17]">
      <div className="hidden grid-cols-[1.1fr_1.5fr_1fr_0.8fr_0.8fr_1.2fr_1fr] gap-4 border-b border-white/8 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500 lg:grid">
        <span>Owner</span>
        <span>Property</span>
        <span>Phone</span>
        <span>Status</span>
        <span>Score</span>
        <span>Last Contact</span>
        <span>Actions</span>
      </div>

      <div className="divide-y divide-white/8">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1.1fr_1.5fr_1fr_0.8fr_0.8fr_1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-xs text-slate-500 lg:hidden">Owner</p>
              <p className="text-sm font-medium text-white">{row.ownerName || "Unknown owner"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 lg:hidden">Property</p>
              <Link href={`/dashboard/${row.id}`} className="text-sm font-medium text-white hover:text-violet-200">
                {row.address}
              </Link>
              {row.aiSummary ? (
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{row.aiSummary}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs text-slate-500 lg:hidden">Phone</p>
              <p className="text-sm text-slate-300">{row.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 lg:hidden">Status</p>
              <StatusBadge status={row.status} />
            </div>
            <div>
              <p className="text-xs text-slate-500 lg:hidden">Score</p>
              <p className="text-sm font-semibold text-white">{row.score ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 lg:hidden">Last Contact</p>
              <p className="text-sm text-slate-300">{row.lastContact || "—"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions ? actions(row) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
