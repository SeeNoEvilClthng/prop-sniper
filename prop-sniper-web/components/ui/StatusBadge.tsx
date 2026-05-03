"use client";

type StatusBadgeProps = {
  status?: string | null;
  size?: "sm" | "md";
};

const STATUS_STYLES: Record<string, string> = {
  new_lead: "bg-[#1F1F1F] text-[#A1A1AA] border-[#2A2A2A]",
  text_sent: "bg-[#7C3AED]/12 text-[#E9D5FF] border-[#7C3AED]/24",
  replied: "bg-[#7C3AED]/16 text-white border-[#7C3AED]/30",
  ai_calling: "bg-[#7C3AED]/20 text-white border-[#7C3AED]/32",
  qualified_hot: "bg-[#7C3AED]/14 text-[#E9D5FF] border-[#7C3AED]/24",
  qualified_warm: "bg-[#1F1F1F] text-[#FFFFFF] border-[#2A2A2A]",
  qualified_cold: "bg-[#1F1F1F] text-[#A1A1AA] border-[#2A2A2A]",
  appointment_booked: "bg-[#7C3AED]/16 text-white border-[#7C3AED]/28",
  closed: "bg-[#1F1F1F] text-[#FFFFFF] border-[#2A2A2A]",
  dead: "bg-[#1F1F1F] text-[#A1A1AA] border-[#2A2A2A]",
  do_not_contact: "bg-[#1F1F1F] text-[#A1A1AA] border-[#2A2A2A]",
  New: "bg-[#1F1F1F] text-[#A1A1AA] border-[#2A2A2A]",
  Contacted: "bg-[#7C3AED]/12 text-[#E9D5FF] border-[#7C3AED]/24",
  "Follow Up": "bg-[#1F1F1F] text-[#FFFFFF] border-[#2A2A2A]",
  Negotiating: "bg-[#7C3AED]/16 text-white border-[#7C3AED]/30",
  "Under Contract": "bg-[#7C3AED]/14 text-[#E9D5FF] border-[#7C3AED]/24",
  Dead: "bg-[#1F1F1F] text-[#A1A1AA] border-[#2A2A2A]",
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
  const classes = STATUS_STYLES[status || ""] || "bg-[#1F1F1F] text-[#A1A1AA] border-[#2A2A2A]";

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
