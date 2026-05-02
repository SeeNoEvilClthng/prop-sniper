type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0b0f17] p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p> : null}
    </div>
  );
}
