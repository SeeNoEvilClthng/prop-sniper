type Lead = {
  id: string;
  address: string;
  city: string;
  state: string;
  status: string;
  owner_name?: string | null;
  estimated_value?: number | null;
  estimated_rent?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  score?: number | null;
};

function getStatusColor(status: string) {
  const value = status.toLowerCase();

  if (value === "new") return "bg-blue-500/20 text-blue-300 border-blue-400/20";
  if (value === "contacted")
    return "bg-yellow-500/20 text-yellow-300 border-yellow-400/20";
  if (value === "follow up")
    return "bg-orange-500/20 text-orange-300 border-orange-400/20";
  if (value === "negotiating")
    return "bg-purple-500/20 text-purple-300 border-purple-400/20";
  if (value === "under contract")
    return "bg-green-500/20 text-green-300 border-green-400/20";

  return "bg-white/10 text-white/70 border-white/10";
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-300";
  if (score >= 50) return "text-orange-300";
  return "text-red-400";
}

export default function LeadCard({ lead }: { lead: Lead }) {
  const score = lead.score ?? 62;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.07]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">
              {lead.address}
            </h3>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                lead.status
              )}`}
            >
              {lead.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-white/50">
            {lead.city}, {lead.state}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-white/40">Owner</p>
              <p className="text-sm font-medium text-white/85">
                {lead.owner_name || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Value</p>
              <p className="text-sm font-medium text-white/85">
                {lead.estimated_value
                  ? `$${lead.estimated_value.toLocaleString()}`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Rent</p>
              <p className="text-sm font-medium text-white/85">
                {lead.estimated_rent
                  ? `$${lead.estimated_rent.toLocaleString()}`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Size</p>
              <p className="text-sm font-medium text-white/85">
                {lead.beds || "—"}/{lead.baths || "—"} •{" "}
                {lead.sqft ? lead.sqft.toLocaleString() : "—"} sqft
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[180px] rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Deal Score
          </p>
          <p className={`mt-2 text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </p>
          <p className="mt-1 text-sm text-white/50">
            {score >= 85
              ? "Strong"
              : score >= 70
              ? "Solid"
              : score >= 50
              ? "Borderline"
              : "Weak"}
          </p>

          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
              style={{ width: `${Math.max(8, Math.min(score, 100))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]">
          View Lead
        </button>

        <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10">
          Analyze Deal
        </button>

        <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10">
          Contact Seller
        </button>
      </div>
    </div>
  );
}