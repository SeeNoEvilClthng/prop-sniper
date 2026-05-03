"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import BrandLogo from "@/components/ui/BrandLogo";
import ActionButton from "@/components/ui/ActionButton";

function getHeaderMeta(pathname: string) {
  if (pathname.startsWith("/ai-agent")) {
    return {
      title: "AI Agent",
      subtitle: "Monitor replies, AI call status, seller qualification, and appointment handoffs.",
    };
  }

  if (pathname.startsWith("/campaigns")) {
    return {
      title: "Campaigns",
      subtitle: "Launch and monitor seller outreach campaigns without leaving the command center.",
    };
  }

  if (pathname.startsWith("/buyer-finder") || pathname.startsWith("/investors")) {
    return {
      title: "Buyer Finder",
      subtitle: "Search your investor CRM, review buyer fit, and move deals toward dispo faster.",
    };
  }

  if (pathname.startsWith("/leads")) {
    return {
      title: "Saved Leads",
      subtitle: "Move leads from new to contacted, replied, qualified, and closed.",
    };
  }

  if (pathname.startsWith("/finder")) {
    return {
      title: "Finder",
      subtitle: "Search a city or zip and save the best seller opportunities fast.",
    };
  }

  if (pathname.startsWith("/outreach")) {
    return {
      title: "AI Outreach",
      subtitle: "Send safe first texts, monitor replies, and trigger AI calls only after interest.",
    };
  }

  if (pathname.startsWith("/appointments")) {
    return {
      title: "Appointments",
      subtitle: "Track booked callbacks, seller conversations, and closing steps.",
    };
  }

  if (pathname.startsWith("/map")) {
    return {
      title: "Map",
      subtitle: "Click properties, save leads, and move them into outreach without losing context.",
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      title: "Settings",
      subtitle: "Manage integrations, account details, and workflow defaults.",
    };
  }

  return {
    title: "Dashboard",
    subtitle: "See what to do next, who to contact, and which deals are closest to moving.",
  };
}

export default function TopBar() {
  const pathname = usePathname();
  const meta = getHeaderMeta(pathname);
  const [search, setSearch] = useState("");

  return (
    <header className="border-b border-white/8 bg-[#090c13]/92 backdrop-blur-xl">
      <div className="px-4 py-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <BrandLogo size="xs" className="w-fit" />
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Command Center
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">
                {meta.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                {meta.subtitle}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 xl:max-w-[760px] xl:flex-row xl:items-center xl:justify-end">
              <form
                className="flex-1"
                action="/leads"
              >
                <input
                  name="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search owner, address, phone, or city"
                  className="w-full rounded-xl border border-white/10 bg-[#0b0f17] px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/30"
                />
              </form>
              <ActionButton href="/dashboard/new" variant="primary">
                Quick Add Lead
              </ActionButton>
              <button
                type="button"
                className="hover-glow inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200"
              >
                Notifications
              </button>
              <button
                type="button"
                className="hover-glow inline-flex items-center justify-center rounded-xl border border-violet-400/18 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-100"
              >
                Upgrade
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200"
              >
                Account
              </button>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="flex flex-wrap gap-2">
              <StatusChip label="Dashboard" tone={pathname === "/dashboard" ? "purple" : "slate"} href="/dashboard" />
              <StatusChip label="Finder" tone={pathname.startsWith("/finder") ? "purple" : "slate"} href="/finder" />
              <StatusChip label="Map" tone={pathname.startsWith("/map") ? "purple" : "slate"} href="/map" />
              <StatusChip label="Saved Leads" tone={pathname.startsWith("/leads") ? "purple" : "slate"} href="/leads?view=table" />
              <StatusChip label="AI Agent" tone={pathname.startsWith("/ai-agent") ? "purple" : "slate"} href="/ai-agent" />
              <StatusChip label="Campaigns" tone={pathname.startsWith("/campaigns") ? "purple" : "slate"} href="/campaigns" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <HeaderMetric label="1" value="Find Leads" />
              <HeaderMetric label="2" value="Send Text" />
              <HeaderMetric label="3" value="AI Agent" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0b0f17] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-200">{value}</p>
    </div>
  );
}

function StatusChip({
  label,
  tone,
  href,
}: {
  label: string;
  tone: "purple" | "slate" | "blue";
  href: string;
}) {
  const className =
    tone === "purple"
      ? "border-fuchsia-400/20 bg-fuchsia-500/12 text-fuchsia-200"
      : tone === "blue"
        ? "border-sky-400/20 bg-sky-500/12 text-sky-300"
        : "border-white/10 bg-[#0b0f17] text-slate-300";

  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:bg-white/[0.08] ${className}`}
    >
      {label}
    </Link>
  );
}
