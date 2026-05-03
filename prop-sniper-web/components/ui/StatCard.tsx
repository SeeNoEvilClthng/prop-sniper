type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="hover-lift rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] p-4 transition-all duration-300">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#A1A1AA]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">{detail}</p> : null}
    </div>
  );
}
