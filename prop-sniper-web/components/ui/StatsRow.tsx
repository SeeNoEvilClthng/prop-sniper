const stats = [
  {
    label: "Total Leads",
    value: "148",
    sub: "+12 this week",
  },
  {
    label: "Hot Deals",
    value: "19",
    sub: "AI scored strong",
  },
  {
    label: "Avg. Max Offer",
    value: "$182K",
    sub: "Across active leads",
  },
  {
    label: "Follow Ups Due",
    value: "27",
    sub: "Today",
  },
];

export default function StatsRow() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/[0.07]"
        >
          <p className="text-sm text-white/50">{stat.label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{stat.value}</p>
          <p className="mt-2 text-sm text-cyan-300">{stat.sub}</p>
        </div>
      ))}
    </section>
  );
}