"use client";

import { useMemo, useState } from "react";

type LeadOption = {
  id: string;
  address: string;
  market: string;
  phone: string;
  score: number | null;
  rating: string | null;
};

type CampaignResult = {
  leadId: string;
  address: string;
  phone: string;
  success: boolean;
  preview: boolean;
  message: string;
  generatedText?: string;
};

export default function BulkFirstContactCampaign({
  leads,
}: {
  leads: LeadOption[];
}) {
  const availableLeads = useMemo(
    () => leads.filter((lead) => lead.phone.trim()),
    [leads]
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<CampaignResult[]>([]);

  function toggleLead(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function selectAll() {
    setSelectedIds(availableLeads.slice(0, 25).map((lead) => lead.id));
  }

  function clearAll() {
    setSelectedIds([]);
    setResults([]);
    setStatus("");
  }

  async function sendCampaign() {
    try {
      setRunning(true);
      setStatus("");
      setResults([]);

      const res = await fetch("/api/contact/send-first-contact-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadIds: selectedIds,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        sentCount?: number;
        previewCount?: number;
        failedCount?: number;
        results?: CampaignResult[];
      };

      if (!res.ok) {
        throw new Error(data.error || "Failed to run campaign");
      }

      setResults(data.results || []);
      setStatus(
        `Campaign finished. Sent: ${data.sentCount || 0} • Preview: ${
          data.previewCount || 0
        } • Failed: ${data.failedCount || 0}`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to run campaign.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="mt-6 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c4b5fd]">
            First Contact Campaign
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
            Generate and send one property-specific text per selected lead
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Select leads with saved phone numbers, and PropSniper will generate a first-contact text
            for each property before sending it. Campaigns are capped at 25 leads per run.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            Select Top 25
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={sendCampaign}
            disabled={running || selectedIds.length === 0}
            className="rounded-2xl bg-[linear-gradient(135deg,#9333ea,#6d28d9)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {running ? "Sending..." : `Send First Contact (${selectedIds.length})`}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-400/16 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        Only message leads you are comfortable contacting. Keep outreach compliant with your market,
        opt-out handling, and carrier rules.
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {availableLeads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
            No visible leads with saved owner phone numbers yet.
          </div>
        ) : (
          availableLeads.map((lead) => {
            const selected = selectedIds.includes(lead.id);

            return (
              <label
                key={lead.id}
                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                  selected
                    ? "border-fuchsia-400/24 bg-fuchsia-500/10"
                    : "border-white/10 bg-[#0d1727] hover:bg-[#101b2d]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleLead(lead.id)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-fuchsia-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{lead.address}</p>
                  <p className="mt-1 text-sm text-slate-400">{lead.market}</p>
                  <p className="mt-2 text-sm text-slate-300">{lead.phone}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                      Score {lead.score ?? "—"}
                    </span>
                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-400/30">
                      {lead.rating || "Unrated"}
                    </span>
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>

      {status ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          {status}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-5 space-y-3">
          {results.map((result) => (
            <div
              key={result.leadId}
              className="rounded-2xl border border-white/10 bg-[#0d1727] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{result.address}</p>
                  <p className="mt-1 text-sm text-slate-400">{result.phone}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    result.success
                      ? result.preview
                        ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30"
                        : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30"
                      : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
                  }`}
                >
                  {result.success ? (result.preview ? "Preview" : "Sent") : "Failed"}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{result.message}</p>
              {result.generatedText ? (
                <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  {result.generatedText}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
