"use client";

import { useMemo, useState } from "react";
import FinderFilterBar from "./FinderFilterBar";
import FinderLeadCard from "./FinderLeadCard";
import FinderMap from "./FinderMap";
import FinderSearchBar from "./FinderSearchBar";
import { FinderLead } from "./route";

type Summary = {
  total: number;
  hotDeals: number;
  absenteeCount: number;
  vacantCount: number;
  highEquityCount: number;
};

export default function CityFinderShell() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<FinderLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [absentee, setAbsentee] = useState(false);
  const [vacant, setVacant] = useState(false);
  const [highEquity, setHighEquity] = useState(false);
  const [sort, setSort] = useState("score_desc");

  const [summary, setSummary] = useState<Summary>({
    total: 0,
    hotDeals: 0,
    absenteeCount: 0,
    vacantCount: 0,
    highEquityCount: 0,
  });

  async function runSearch() {
    try {
      setLoading(true);

      const res = await fetch("/api/finder/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
          absentee,
          vacant,
          highEquity,
          sort,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }

      setLeads(data.leads || []);
      setSummary(
        data.summary || {
          total: 0,
          hotDeals: 0,
          absenteeCount: 0,
          vacantCount: 0,
          highEquityCount: 0,
        }
      );

      setSelectedLeadId(data.leads?.[0]?.id || null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-400/15 bg-gradient-to-r from-cyan-500/15 to-blue-600/15 p-6 shadow-xl shadow-cyan-950/20">
        <p className="text-sm font-medium text-cyan-200/80">City Finder</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Find the best leads in a city
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Search a city, filter investor-style lead types, and sort the strongest
          opportunities first.
        </p>
      </div>

      <FinderSearchBar
        city={city}
        setCity={setCity}
        onSearch={runSearch}
        loading={loading}
      />

      <FinderFilterBar
        absentee={absentee}
        vacant={vacant}
        highEquity={highEquity}
        sort={sort}
        setAbsentee={setAbsentee}
        setVacant={setVacant}
        setHighEquity={setHighEquity}
        setSort={setSort}
      />

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <p className="text-sm text-white/50">Total Leads</p>
          <p className="mt-2 text-3xl font-bold text-white">{summary.total}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <p className="text-sm text-white/50">Hot Deals</p>
          <p className="mt-2 text-3xl font-bold text-green-400">{summary.hotDeals}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <p className="text-sm text-white/50">Absentee</p>
          <p className="mt-2 text-3xl font-bold text-white">{summary.absenteeCount}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <p className="text-sm text-white/50">Vacant</p>
          <p className="mt-2 text-3xl font-bold text-white">{summary.vacantCount}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <p className="text-sm text-white/50">High Equity</p>
          <p className="mt-2 text-3xl font-bold text-white">{summary.highEquityCount}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Lead Results</h2>
              <p className="mt-1 text-sm text-white/50">
                Best opportunities first
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/70">
              {leads.length} found
            </div>
          </div>

          <div className="mt-5 max-h-[700px] space-y-4 overflow-y-auto pr-1">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <FinderLeadCard
                  key={lead.id}
                  lead={lead}
                  isActive={lead.id === selectedLeadId}
                  onClick={() => setSelectedLeadId(lead.id)}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-10 text-center">
                <p className="text-lg font-semibold text-white/80">No leads yet</p>
                <p className="mt-2 text-sm text-white/45">
                  Search a city to load matching leads from your database
                </p>
              </div>
            )}
          </div>
        </div>

        <FinderMap
          leads={leads}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLeadId}
        />
      </section>
    </div>
  );
}