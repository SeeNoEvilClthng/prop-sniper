import Link from "next/link";
import {
  formatMoney,
  getSpread,
  leadsSeed,
  navSections,
  statusClasses,
} from "./dashboardData";

export default function DashboardHomePage() {
  const totalLeads = leadsSeed.length;
  const strongDeals = leadsSeed.filter((lead) => lead.score >= 80).length;
  const underContract = leadsSeed.filter(
    (lead) => lead.status === "Under Contract"
  ).length;
  const totalPotentialSpread = leadsSeed.reduce(
    (sum, lead) => sum + getSpread(lead),
    0
  );

  const quickLinks = navSections.flatMap((section) => section.items).filter(
    (item) => item.href !== "/dashboard"
  );

  return (
    <main className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200">
          Dashboard overview
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Main control center
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          This section is fully working. Every link in this menu goes to a real
          page in Section 1.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Leads" value={String(totalLeads)} sub="Saved right now" />
          <StatCard title="Strong Deals" value={String(strongDeals)} sub="Score 80+" />
          <StatCard title="Under Contract" value={String(underContract)} sub="Active contracts" />
          <StatCard
            title="Potential Spread"
            value={formatMoney(totalPotentialSpread)}
            sub="Across all leads"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">Recent lead activity</h2>
          <div className="mt-5 space-y-3">
            {leadsSeed.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-white/10 bg-[#0d1727] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{lead.address}</p>
                    <p className="text-sm text-slate-400">
                      {lead.city}, {lead.state} {lead.zip}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">Working pages</h2>
          <div className="mt-5 grid gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-[#0d1727] p-4 transition hover:bg-[#101b2d]"
              >
                <div className="flex items-start gap-3">
                  <span>{item.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d1727] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{sub}</p>
    </div>
  );
}