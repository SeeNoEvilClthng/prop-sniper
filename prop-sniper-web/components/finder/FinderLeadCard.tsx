"use client";

import { FinderLead } from "./route";

function scoreColor(score: number) {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-300";
  if (score >= 50) return "text-orange-300";
  return "text-red-400";
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

export default function FinderLeadCard({
  lead,
  isActive,
  onClick,
}: {
  lead: FinderLead;
  isActive: boolean;
  onClick: () => void;
}) {
  const score = Number(lead.score || 0);

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-3xl border p-5 text-left shadow-xl shadow-black/20 transition ${
        isActive
          ? "border-cyan-400/30 bg-cyan-400/10"
          : "border-white/10 bg-white/5 hover:-translate-y-1 hover:bg-white/[0.07]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {lead.address || "No address"}
          </h3>
          <p className="mt-1 text-sm text-white/50">
            {[lead.city, lead.state].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="rounded-2xl bg-black/30 px-4 py-3">
          <p className="text-xs text-white/40">Score</p>
          <p className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-white/40">Value</p>
          <p className="text-white/85">
            {lead.estimated_value
              ? `$${Number(lead.estimated_value).toLocaleString()}`
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-white/40">Rent</p>
          <p className="text-white/85">
            {lead.estimated_rent
              ? `$${Number(lead.estimated_rent).toLocaleString()}`
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-white/40">Owner</p>
          <p className="text-white/85">{lead.owner_name || "Unknown"}</p>
        </div>

        <div>
          <p className="text-xs text-white/40">Size</p>
          <p className="text-white/85">
            {lead.beds || "—"}/{lead.baths || "—"} •{" "}
            {lead.sqft ? Number(lead.sqft).toLocaleString() : "—"} sqft
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {lead.absentee_owner && <Tag>Absentee</Tag>}
        {lead.vacant && <Tag>Vacant</Tag>}
        {lead.high_equity && <Tag>High Equity</Tag>}
        {lead.status && <Tag>{lead.status}</Tag>}
      </div>
    </button>
  );
}