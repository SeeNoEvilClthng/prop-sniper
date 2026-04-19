import AppShell from "@/components/AppShell";
import LeadCard from "@/components/ui/LeadCard";
import StatsRow from "@/components/ui/StatsRow";

const sampleLeads = [
  {
    id: "1",
    address: "5039 Galahad Dr",
    city: "San Antonio",
    state: "TX",
    status: "Negotiating",
    owner_name: "J. Harris",
    estimated_value: 215000,
    estimated_rent: 1850,
    beds: 4,
    baths: 3,
    sqft: 1545,
    score: 84,
  },
  {
    id: "2",
    address: "542 Bertetti Dr",
    city: "San Antonio",
    state: "TX",
    status: "Under Contract",
    owner_name: "R. James",
    estimated_value: 255000,
    estimated_rent: 1950,
    beds: 3,
    baths: 2,
    sqft: 1398,
    score: 91,
  },
  {
    id: "3",
    address: "1371 S Parkway E",
    city: "Memphis",
    state: "TN",
    status: "Follow Up",
    owner_name: "Unknown",
    estimated_value: 172000,
    estimated_rent: 1450,
    beds: 3,
    baths: 2,
    sqft: 1320,
    score: 58,
  },
];

const filterPills = [
  "Absentee Owner",
  "High Equity",
  "Vacant",
  "Pre-Foreclosure",
  "Tax Delinquent",
  "Tired Landlord",
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <StatsRow />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_.95fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Deal Finder
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  Filter and sort through the best lead types faster.
                </p>
              </div>

              <button className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                Import CSV
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {filterPills.map((pill) => (
                <button
                  key={pill}
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-white"
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {sampleLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-5 shadow-xl shadow-cyan-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-200/80">AI Deal Engine</p>
                  <h3 className="mt-1 text-xl font-semibold">
                    Find stronger offers
                  </h3>
                </div>

                <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-cyan-100">
                  Live
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-xs text-cyan-100/60">Avg ARV</p>
                  <p className="mt-2 text-2xl font-bold">$246K</p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-xs text-cyan-100/60">Best Max Offer</p>
                  <p className="mt-2 text-2xl font-bold">$159K</p>
                </div>
              </div>

              <button className="mt-5 w-full rounded-2xl bg-black/30 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/40">
                Open AI Analyzer
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Map View</h3>
                  <p className="mt-1 text-sm text-white/50">
                    Click neighborhoods and spot deals visually.
                  </p>
                </div>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">
                  Expand
                </button>
              </div>

              <div className="mt-5 flex h-[340px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/20">
                <div className="text-center">
                  <p className="text-lg font-semibold text-white/80">
                    Mapbox Section
                  </p>
                  <p className="mt-2 text-sm text-white/45">
                    Put your live deal map here
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
              <h3 className="text-xl font-semibold">Quick Actions</h3>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <button className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15">
                  Add new lead
                </button>
                <button className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15">
                  Run batch analysis
                </button>
                <button className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15">
                  Send buyer blast
                </button>
                <button className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15">
                  Review follow ups
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}