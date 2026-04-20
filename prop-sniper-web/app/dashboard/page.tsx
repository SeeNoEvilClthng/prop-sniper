"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  filters,
  formatMoney,
  getScoreTone,
  getSpread,
  leadsSeed,
  navGroups,
  statusClasses,
  type Lead,
  type LeadTag,
} from "./dashboardData";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<LeadTag | "All">("All");
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leadsSeed[0].id);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    return leadsSeed.filter((lead) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        lead.address.toLowerCase().includes(searchValue) ||
        lead.city.toLowerCase().includes(searchValue) ||
        lead.state.toLowerCase().includes(searchValue) ||
        lead.zip.includes(search) ||
        lead.owner.toLowerCase().includes(searchValue);

      const matchesFilter =
        activeFilter === "All" ? true : lead.tags.includes(activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0];

  const totalLeads = leadsSeed.length;
  const strongDeals = leadsSeed.filter((lead) => lead.score >= 80).length;
  const underContract = leadsSeed.filter(
    (lead) => lead.status === "Under Contract"
  ).length;
  const totalPotentialSpread = leadsSeed.reduce(
    (sum, lead) => sum + getSpread(lead),
    0
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_25%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-lg font-bold shadow-lg shadow-sky-950/40"
              >
                PS
              </Link>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sky-200">
                  PropSniper
                </p>
                <h1 className="text-xl font-semibold sm:text-2xl">
                  Acquisitions Dashboard
                </h1>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-2">
              {navGroups.map((group) => (
                <div
                  key={group.title}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(group.title)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu((prev) =>
                        prev === group.title ? null : group.title
                      )
                    }
                    className="rounded-xl border border-white/10 bg-[#0d1727] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-sky-400/20 hover:bg-[#101b2d]"
                  >
                    {group.title} ▾
                  </button>

                  {openMenu === group.title && (
                    <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[340px] rounded-2xl border border-white/10 bg-[#0c1524]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
                      <div className="mb-2 px-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                        {group.title}
                      </div>

                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block rounded-xl border border-transparent bg-white/0 px-3 py-3 transition hover:border-sky-400/20 hover:bg-white/5"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{item.icon}</span>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {item.label}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/add-lead"
                className="hidden sm:inline-flex rounded-xl border border-sky-400/20 bg-sky-500/15 px-4 py-3 text-sm font-medium text-sky-200 transition hover:bg-sky-500/25"
              >
                + Add Lead
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="inline-flex xl:hidden rounded-xl border border-white/10 bg-[#0d1727] px-4 py-3 text-sm font-medium text-white"
              >
                Menu
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 xl:hidden rounded-2xl border border-white/10 bg-[#0d1727] p-3">
              <div className="grid gap-3">
                {navGroups.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="mb-2 text-sm font-semibold text-white">
                      {group.title}
                    </p>
                    <div className="grid gap-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="rounded-xl bg-[#0b1320] px-3 py-3 transition hover:bg-[#101b2d]"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {item.label}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-sky-200 backdrop-blur">
              Competitive dashboard layout
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Find better deals faster
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Track leads, score deals, and manage your pipeline in one place.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Leads" value={String(totalLeads)} subtext="+12 this week" icon="🏠" />
          <StatCard title="AI Scored Strong" value={String(strongDeals)} subtext="Hot opportunities" icon="⚡" />
          <StatCard title="Potential Spread" value={formatMoney(totalPotentialSpread)} subtext="Across all active leads" icon="💰" />
          <StatCard title="Under Contract" value={String(underContract)} subtext="Deals moving now" icon="📄" />
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.95fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Deal Finder</h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Search your saved leads and filter for better opportunities.
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by address, city, owner, state, or ZIP..."
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
                  />
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const isActive = filter === activeFilter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-900/40"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                {filteredLeads.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1320] p-8 text-center text-slate-400">
                    No leads found for this search.
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      active={selectedLead?.id === lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Selected Lead
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    {selectedLead?.address ?? "No lead selected"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {selectedLead
                      ? `${selectedLead.city}, ${selectedLead.state} ${selectedLead.zip}`
                      : "Choose a lead to view details"}
                  </p>
                </div>

                {selectedLead && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                      selectedLead.status
                    )}`}
                  >
                    {selectedLead.status}
                  </span>
                )}
              </div>

              {selectedLead && (
                <>
                  <div
                    className={`mb-5 rounded-2xl border border-white/10 bg-[#0d1727] p-4 ${getScoreTone(
                      selectedLead.score
                    ).glow}`}
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      Deal Score
                    </p>
                    <div className="mt-2 flex items-end gap-3">
                      <span className="text-5xl font-bold">
                        {selectedLead.score}
                      </span>
                      <span
                        className={`mb-1 text-sm font-medium ${
                          getScoreTone(selectedLead.score).color
                        }`}
                      >
                        {getScoreTone(selectedLead.score).text}
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          getScoreTone(selectedLead.score).bar
                        }`}
                        style={{ width: `${selectedLead.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoBox label="ARV" value={formatMoney(selectedLead.arv)} />
                    <InfoBox label="Asking" value={formatMoney(selectedLead.asking)} />
                    <InfoBox label="Repairs" value={formatMoney(selectedLead.repairs)} />
                    <InfoBox label="Equity" value={`${selectedLead.equityPercent}%`} />
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                    <p className="text-sm font-semibold text-white">Owner Info</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      <p>
                        <span className="text-slate-400">Name:</span>{" "}
                        {selectedLead.owner}
                      </p>
                      <p>
                        <span className="text-slate-400">Phone:</span>{" "}
                        {selectedLead.phone}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/dashboard/leads"
                        className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
                      >
                        View Lead
                      </Link>
                      <Link
                        href="/dashboard/marketing/text"
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Contact Owner
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtext,
  icon,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-bold">{value}</h3>
          <p className="mt-2 text-sm text-slate-300">{subtext}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0d1727] text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  active,
  onClick,
}: {
  lead: Lead;
  active: boolean;
  onClick: () => void;
}) {
  const spread = getSpread(lead);
  const scoreTone = getScoreTone(lead.score);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-3xl border p-4 text-left transition ${
        active
          ? "border-sky-400/40 bg-gradient-to-br from-sky-500/10 to-blue-600/10 shadow-lg shadow-sky-950/30"
          : "border-white/10 bg-[#0b1320] hover:border-white/20 hover:bg-[#0e1727]"
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{lead.address}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                lead.status
              )}`}
            >
              {lead.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-300">
            {lead.city}, {lead.state} {lead.zip}
          </p>
        </div>

        <div className="grid min-w-[220px] grid-cols-2 gap-3 xl:w-[240px]">
          <MiniMetric label="Score" value={String(lead.score)} />
          <MiniMetric label="Spread" value={formatMoney(spread)} />
          <MiniMetric label="ARV" value={formatMoney(lead.arv)} />
          <MiniMetric label="Repairs" value={formatMoney(lead.repairs)} />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Deal strength</span>
          <span className={scoreTone.color}>{scoreTone.text}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${scoreTone.bar}`}
            style={{ width: `${lead.score}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}