"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/ui/BrandLogo";

function getHeaderMeta(pathname: string) {
  if (pathname.startsWith("/leads")) {
    return {
      title: "Lead Queue",
      subtitle: "Work priority leads, schedule next steps, and keep acquisitions moving cleanly.",
    };
  }

  if (pathname.startsWith("/finder")) {
    return {
      title: "Lead Finder",
      subtitle: "Source motivated properties, surface distress, and save the right opportunities faster.",
    };
  }

  if (pathname.startsWith("/investors")) {
    return {
      title: "Buyer Network",
      subtitle: "Track investor demand, match deals, and keep disposition tight.",
    };
  }

  if (pathname.startsWith("/team")) {
    return {
      title: "Team Operations",
      subtitle: "See rep load, overdue risk, and where your best deals are concentrated.",
    };
  }

  if (pathname.startsWith("/map")) {
    return {
      title: "Map View",
      subtitle: "Visualize your pipeline geographically and hunt for the next cluster of opportunities.",
    };
  }

  return {
    title: "Command Center",
    subtitle: "Run leads, CRM, dispo, and AI workflows from one clean operating view.",
  };
}

export default function TopBar() {
  const pathname = usePathname();
  const meta = getHeaderMeta(pathname);

  return (
    <header className="border-b border-white/8 bg-[#06070d]/82 backdrop-blur-2xl">
      <div className="px-4 py-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <BrandLogo size="xs" className="w-fit" />
                <span className="rounded-full border border-violet-400/14 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100">
                  Operator View
                </span>
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                PropSniper Workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                {meta.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {meta.subtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl border border-violet-400/16 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/16 hover:shadow-[0_20px_40px_rgba(91,33,182,0.22)]"
                onClick={() => window.dispatchEvent(new Event("propsniper:open-command-palette"))}
              >
                Command
              </button>
              <Link
                href="/leads"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
              >
                Queue
              </Link>
              <Link
                href="/leads?follow_up=Due"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
              >
                Follow Ups
              </Link>
              <Link
                href="/dashboard/new"
                className="edge-glow inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#9333ea,#6d28d9)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(147,51,234,0.28)] transition hover:translate-y-[-1px]"
              >
                + Lead
              </Link>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="flex flex-wrap gap-2">
              <StatusChip label="Today first" tone="purple" />
              <StatusChip label="Pipeline visible" tone="slate" />
              <StatusChip label="Team synced" tone="blue" />
              <StatusChip label="Cmd/Ctrl + K" tone="slate" />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <HeaderMetric label="Mode" value="Acquisitions" />
              <HeaderMetric label="Focus" value="Speed to contact" />
              <HeaderMetric label="Flow" value="Find • Analyze • Close" />
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
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-200">{value}</p>
    </div>
  );
}

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: "purple" | "slate" | "blue";
}) {
  const className =
    tone === "purple"
      ? "border-fuchsia-400/20 bg-fuchsia-500/12 text-fuchsia-200"
      : tone === "blue"
        ? "border-sky-400/20 bg-sky-500/12 text-sky-300"
        : "border-white/10 bg-white/[0.05] text-slate-300";

  return (
    <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${className}`}>
      {label}
    </span>
  );
}
