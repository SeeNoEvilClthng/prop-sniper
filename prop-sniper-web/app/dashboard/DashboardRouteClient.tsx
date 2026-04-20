"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  findNavMeta,
  formatMoney,
  getScoreTone,
  getSpread,
  leadsSeed,
  statusClasses,
  type Lead,
  type LeadStatus,
} from "./dashboardData";

export default function DashboardRouteClient({
  params,
}: {
  params: { slug: string[] };
}) {
  const pathname = `/dashboard/${params.slug.join("/")}`;
  const meta = findNavMeta(pathname);

  const [leadForm, setLeadForm] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    owner: "",
    phone: "",
  });

  const [analyzer, setAnalyzer] = useState({
    arv: "250000",
    asking: "180000",
    repairs: "25000",
  });

  const [search, setSearch] = useState("");

  const filteredLeads = useMemo(() => {
    const value = search.toLowerCase();
    return leadsSeed.filter((lead) => {
      return (
        lead.address.toLowerCase().includes(value) ||
        lead.city.toLowerCase().includes(value) ||
        lead.state.toLowerCase().includes(value) ||
        lead.owner.toLowerCase().includes(value) ||
        lead.zip.includes(search)
      );
    });
  }, [search]);

  const groupedByStatus = useMemo(() => {
    const groups: Record<LeadStatus, Lead[]> = {
      New: [],
      Contacted: [],
      "Follow Up": [],
      Negotiating: [],
      "Under Contract": [],
      Dead: [],
    };

    for (const lead of leadsSeed) {
      groups[lead.status].push(lead);
    }

    return groups;
  }, []);

  const marketStats = useMemo(() => {
    const map = new Map<
      string,
      { city: string; count: number; avgScore: number; totalSpread: number }
    >();

    for (const lead of leadsSeed) {
      const key = `${lead.city}, ${lead.state}`;
      const current = map.get(key);

      if (!current) {
        map.set(key, {
          city: key,
          count: 1,
          avgScore: lead.score,
          totalSpread: getSpread(lead),
        });
      } else {
        current.count += 1;
        current.avgScore += lead.score;
        current.totalSpread += getSpread(lead);
      }
    }

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        avgScore: Math.round(item.avgScore / item.count),
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, []);

  const analyzerResult = useMemo(() => {
    const arv = Number(analyzer.arv) || 0;
    const asking = Number(analyzer.asking) || 0;
    const repairs = Number(analyzer.repairs) || 0;
    const spread = arv - asking - repairs;

    let score = 50;
    if (spread >= 100000) score = 92;
    else if (spread >= 70000) score = 84;
    else if (spread >= 45000) score = 76;
    else if (spread >= 20000) score = 66;
    else score = 52;

    return {
      spread,
      score,
      label: getScoreTone(score).text,
      tone: getScoreTone(score),
    };
  }, [analyzer]);

  if (!meta) {
    return (
      <main className="space-y-6">
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="mt-3 text-slate-300">
            This route is not connected yet.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
              {meta.section}
            </p>
            <h1 className="mt-2 text-3xl font-bold">{meta.label}</h1>
            <p className="mt-2 max-w-2xl text-slate-300">{meta.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/map"
              className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Open Map View
            </Link>
          </div>
        </div>
      </section>

      {meta.section === "Leads" && meta.label === "All Leads" && (
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold">All Leads</h2>
              <p className="mt-2 text-slate-300">
                View every lead saved in your system.
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-sky-400/40"
            />
          </div>

          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      )}

      {meta.section === "Leads" && meta.label === "Add Lead" && (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Add a New Lead</h2>
            <p className="mt-2 text-slate-300">
              Use this form layout as your lead intake page.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InputCard
                label="Address"
                value={leadForm.address}
                onChange={(value) =>
                  setLeadForm((prev) => ({ ...prev, address: value }))
                }
              />
              <InputCard
                label="City"
                value={leadForm.city}
                onChange={(value) =>
                  setLeadForm((prev) => ({ ...prev, city: value }))
                }
              />
              <InputCard
                label="State"
                value={leadForm.state}
                onChange={(value) =>
                  setLeadForm((prev) => ({ ...prev, state: value }))
                }
              />
              <InputCard
                label="ZIP"
                value={leadForm.zip}
                onChange={(value) =>
                  setLeadForm((prev) => ({ ...prev, zip: value }))
                }
              />
              <InputCard
                label="Owner"
                value={leadForm.owner}
                onChange={(value) =>
                  setLeadForm((prev) => ({ ...prev, owner: value }))
                }
              />
              <InputCard
                label="Phone"
                value={leadForm.phone}
                onChange={(value) =>
                  setLeadForm((prev) => ({ ...prev, phone: value }))
                }
              />
            </div>

            <button
              type="button"
              className="mt-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Save Lead
            </button>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h3 className="text-xl font-bold">Live Preview</h3>
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d1727] p-5">
              <p className="text-lg font-semibold text-white">
                {leadForm.address || "No address entered yet"}
              </p>
              <p className="mt-2 text-slate-300">
                {[leadForm.city, leadForm.state, leadForm.zip]
                  .filter(Boolean)
                  .join(", ") || "City, State ZIP"}
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Owner: {leadForm.owner || "—"}</p>
                <p>Phone: {leadForm.phone || "—"}</p>
              </div>
            </div>
          </section>
        </section>
      )}

      {meta.section === "Leads" && meta.label === "Lead Statuses" && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(groupedByStatus).map(([status, leads]) => (
            <div
              key={status}
              className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{status}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                    status as LeadStatus
                  )}`}
                >
                  {leads.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-white/10 bg-[#0d1727] p-4"
                  >
                    <p className="font-semibold">{lead.address}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {lead.city}, {lead.state}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {meta.section === "Leads" && meta.label === "Driving Leads" && (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Driving Leads</h2>
            <p className="mt-2 text-slate-300">
              Use this page for properties found while driving for dollars.
            </p>

            <div className="mt-6 grid gap-4">
              {leadsSeed.slice(0, 3).map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-white/10 bg-[#0d1727] p-5"
                >
                  <p className="font-semibold text-white">{lead.address}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {lead.city}, {lead.state} {lead.zip}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs text-sky-200 ring-1 ring-sky-400/30">
                      Driving Lead
                    </span>
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-200 ring-1 ring-amber-400/30">
                      Follow Up Needed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h3 className="text-xl font-bold">Quick Actions</h3>
            <div className="mt-4 grid gap-3">
              <QuickAction title="Add Driving Lead" />
              <QuickAction title="Tag Property as Vacant" />
              <QuickAction title="Push to Follow Up" />
              <QuickAction title="Open Map Route" />
            </div>
          </section>
        </section>
      )}

      {meta.section === "Lists" && (
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">{meta.label}</h2>
          <p className="mt-2 text-slate-300">
            This list shows leads related to this category.
          </p>

          <div className="mt-6 grid gap-4">
            {filteredLeads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      )}

      {(meta.label === "Text Campaigns" ||
        meta.label === "Direct Mail" ||
        meta.label === "Buyer Blasts" ||
        meta.label === "Skip Trace") && (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">{meta.label}</h2>
            <p className="mt-2 text-slate-300">
              This page is now connected and ready for real workflow tools.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1727] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Campaign Preview
              </p>
              <p className="mt-4 text-white">
                Hey, I came across your property and wanted to see if you’d be
                open to an offer.
              </p>
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h3 className="text-xl font-bold">Connected Actions</h3>
            <div className="mt-4 grid gap-3">
              <QuickAction title="Open Lead List" />
              <QuickAction title="Create New Campaign" />
              <QuickAction title="Send Test Message" />
              <QuickAction title="Review Contacts" />
            </div>
          </section>
        </section>
      )}

      {(meta.label === "Deal Analyzer" ||
        meta.label === "Repair Estimator" ||
        meta.label === "Comp Finder") && (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">{meta.label}</h2>
            <p className="mt-2 text-slate-300">
              Run deal numbers and see a quick score estimate.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <InputCard
                label="ARV"
                value={analyzer.arv}
                onChange={(value) =>
                  setAnalyzer((prev) => ({ ...prev, arv: value }))
                }
              />
              <InputCard
                label="Asking"
                value={analyzer.asking}
                onChange={(value) =>
                  setAnalyzer((prev) => ({ ...prev, asking: value }))
                }
              />
              <InputCard
                label="Repairs"
                value={analyzer.repairs}
                onChange={(value) =>
                  setAnalyzer((prev) => ({ ...prev, repairs: value }))
                }
              />
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Result
            </p>
            <div className={`mt-4 rounded-2xl border border-white/10 bg-[#0d1727] p-5 ${analyzerResult.tone.glow}`}>
              <p className="text-5xl font-bold">{analyzerResult.score}</p>
              <p className={`mt-2 text-sm font-semibold ${analyzerResult.tone.color}`}>
                {analyzerResult.label}
              </p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${analyzerResult.tone.bar}`}
                  style={{ width: `${analyzerResult.score}%` }}
                />
              </div>
              <p className="mt-5 text-slate-300">
                Spread: {formatMoney(analyzerResult.spread)}
              </p>
            </div>
          </section>
        </section>
      )}

      {(meta.label === "Score Trends" ||
        meta.label === "Pipeline Stats" ||
        meta.label === "Market View") && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {marketStats.map((market) => (
            <div
              key={market.city}
              className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              <h3 className="text-xl font-bold">{market.city}</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Lead Count: {market.count}</p>
                <p>Average Score: {market.avgScore}</p>
                <p>Total Spread: {formatMoney(market.totalSpread)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {(meta.label === "Import CSV" || meta.label === "Map View") && (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">{meta.label}</h2>
            <p className="mt-2 text-slate-300">
              This page is connected so the navigation feels real and stable.
            </p>

            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-10 text-center text-slate-400">
              {meta.label === "Import CSV"
                ? "CSV import area goes here."
                : "Map preview area goes here."}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h3 className="text-xl font-bold">Related Pages</h3>
            <div className="mt-4 grid gap-3">
              <LinkCard href="/leads" label="All Leads" />
              <LinkCard href="/finder" label="Comp Finder" />
              <LinkCard href="/leads" label="Deal Analyzer" />
            </div>
          </section>
        </section>
      )}

      {meta.section === "Account" && (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">{meta.label}</h2>
            <p className="mt-2 text-slate-300">
              Account area connected and ready for future buildout.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <QuickInfo label="Plan" value="Starter" />
              <QuickInfo label="Billing" value="$29 / month" />
              <QuickInfo label="Trial" value="7 days" />
              <QuickInfo label="Status" value="Active" />
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h3 className="text-xl font-bold">Manage</h3>
            <div className="mt-4 grid gap-3">
              <QuickAction title="Update Profile" />
              <QuickAction title="Manage Billing" />
              <QuickAction title="Invite Team Member" />
              <QuickAction title="Change Settings" />
            </div>
          </section>
        </section>
      )}
    </main>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{lead.address}</p>
          <p className="mt-1 text-sm text-slate-400">
            {lead.city}, {lead.state} {lead.zip}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
              lead.status
            )}`}
          >
            {lead.status}
          </span>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
            Score {lead.score}
          </span>
          <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-200 ring-1 ring-sky-400/30">
            Spread {formatMoney(getSpread(lead))}
          </span>
        </div>
      </div>
    </div>
  );
}

function InputCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-[#0a1321] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
      />
    </div>
  );
}

function QuickAction({ title }: { title: string }) {
  return (
    <button
      type="button"
      className="rounded-2xl border border-white/10 bg-[#0d1727] p-4 text-left text-sm font-semibold text-white transition hover:bg-[#101b2d]"
    >
      {title}
    </button>
  );
}

function LinkCard({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-[#0d1727] p-4 text-sm font-semibold text-white transition hover:bg-[#101b2d]"
    >
      {label}
    </Link>
  );
}

function QuickInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
