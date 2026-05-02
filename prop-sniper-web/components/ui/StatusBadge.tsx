"use client";

type StatusBadgeProps = {
  status?: string | null;
  size?: "sm" | "md";
};

const STATUS_STYLES: Record<string, string> = {
  new_lead: "bg-sky-500/12 text-sky-200 border-sky-400/20",
  text_sent: "bg-violet-500/12 text-violet-200 border-violet-400/20",
  replied: "bg-indigo-500/12 text-indigo-200 border-indigo-400/20",
  ai_calling: "bg-fuchsia-500/12 text-fuchsia-200 border-fuchsia-400/20",
  qualified_hot: "bg-emerald-500/12 text-emerald-200 border-emerald-400/20",
  qualified_warm: "bg-amber-500/12 text-amber-200 border-amber-400/20",
  qualified_cold: "bg-slate-500/12 text-slate-200 border-slate-400/20",
  appointment_booked: "bg-cyan-500/12 text-cyan-200 border-cyan-400/20",
  closed: "bg-emerald-500/12 text-emerald-100 border-emerald-300/20",
  dead: "bg-zinc-500/12 text-zinc-200 border-zinc-400/20",
  do_not_contact: "bg-rose-500/12 text-rose-200 border-rose-400/20",
  New: "bg-sky-500/12 text-sky-200 border-sky-400/20",
  Contacted: "bg-indigo-500/12 text-indigo-200 border-indigo-400/20",
  "Follow Up": "bg-amber-500/12 text-amber-200 border-amber-400/20",
  Negotiating: "bg-fuchsia-500/12 text-fuchsia-200 border-fuchsia-400/20",
  "Under Contract": "bg-emerald-500/12 text-emerald-200 border-emerald-400/20",
  Dead: "bg-zinc-500/12 text-zinc-200 border-zinc-400/20",
};

function formatStatus(status?: string | null) {
  if (!status) return "No status";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StatusBadge({
  status,
  size = "sm",
}: StatusBadgeProps) {
  const classes = STATUS_STYLES[status || ""] || "bg-white/6 text-slate-200 border-white/10";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${
        size === "md" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[11px]"
      } ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}
