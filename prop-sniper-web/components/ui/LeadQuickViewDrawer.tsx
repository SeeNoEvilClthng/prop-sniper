"use client";

import type { ReactNode } from "react";

import ActionButton from "@/components/ui/ActionButton";
import StatusBadge from "@/components/ui/StatusBadge";

type LeadQuickViewDrawerProps = {
  open: boolean;
  onClose: () => void;
  lead: {
    id?: string;
    ownerName?: string | null;
    address: string;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    score?: number | null;
    status?: string | null;
    summary?: string | null;
  } | null;
  children?: ReactNode;
};

export default function LeadQuickViewDrawer({
  open,
  onClose,
  lead,
  children,
}: LeadQuickViewDrawerProps) {
  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close drawer"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-40 h-full w-full max-w-md border-l border-white/10 bg-[#080b12] p-5 shadow-[0_0_50px_rgba(0,0,0,0.45)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-violet-200/80">
              Quick View
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {lead?.address || "Select a lead"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {[lead?.city, lead?.state].filter(Boolean).join(", ") || "Property details"}
            </p>
          </div>
          <ActionButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </ActionButton>
        </div>

        {lead ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={lead.status} />
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                Score {lead.score ?? "—"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Owner</p>
              <p className="mt-2 text-sm font-medium text-white">
                {lead.ownerName || "Owner not saved"}
              </p>
              <p className="mt-1 text-sm text-slate-300">{lead.phone || "No phone on file"}</p>
            </div>

            {lead.summary ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">AI Summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{lead.summary}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {lead.id ? (
                <>
                  <ActionButton href={`/dashboard/${lead.id}`} variant="primary">
                    View Details
                  </ActionButton>
                  <ActionButton href={`/dashboard/${lead.id}?tab=outreach`} variant="secondary">
                    AI Outreach
                  </ActionButton>
                </>
              ) : null}
            </div>

            {children}
          </div>
        ) : null}
      </aside>
    </>
  );
}
