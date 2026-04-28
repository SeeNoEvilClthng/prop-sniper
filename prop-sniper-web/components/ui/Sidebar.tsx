"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/ui/BrandLogo";

const navSections = [
  {
    title: "Acquisitions",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "◌", meta: "Overview" },
      { label: "Lead Queue", href: "/leads", icon: "◎", meta: "Pipeline" },
      { label: "Follow Ups", href: "/leads?follow_up=Due", icon: "◔", meta: "CRM" },
      { label: "Map View", href: "/map", icon: "▣", meta: "Geo" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Finder", href: "/finder", icon: "✦", meta: "Lists" },
      { label: "Deal Analyzer", href: "/dashboard/analyzer", icon: "◌", meta: "AI" },
      { label: "Lead Statuses", href: "/dashboard/status", icon: "◍", meta: "Signals" },
    ],
  },
  {
    title: "Disposition",
    items: [
      { label: "Buyers", href: "/investors", icon: "↗", meta: "CRM" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Team", href: "/team", icon: "◈", meta: "Load" },
      { label: "Add Lead", href: "/dashboard/new", icon: "＋", meta: "Capture" },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,rgba(4,5,11,0.99),rgba(8,10,18,0.97))] md:block">
      <div className="sticky top-0 flex h-screen flex-col px-3 py-3">
        <div className="rounded-[18px] border border-white/8 bg-[#0a0e17]/94 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.2)]">
          <BrandLogo size="xs" className="mx-auto block w-fit" />
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-[#0b0d19] px-3 py-2.5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-white">PropSniper OS</p>
            </div>
            <span className="rounded-full border border-violet-400/16 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">
              Cmd + K
            </span>
          </div>
        </div>

        <nav className="mt-4 space-y-4 overflow-y-auto pr-1">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.26em] text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-[16px] px-3 py-2.5 transition ${
                        active
                          ? "border border-fuchsia-400/18 bg-fuchsia-500/10 text-white shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
                          : "border border-transparent bg-white/[0.02] text-slate-300 hover:border-white/8 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <span className={`text-sm ${active ? "text-fuchsia-200" : "text-slate-500"}`}>
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium text-white">{item.label}</p>
                          <span className="rounded-full border border-white/8 bg-black/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-slate-500">
                            {item.meta}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 rounded-[18px] border border-white/8 bg-[#0a0e17]/94 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.2)]">
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Quick return</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Use the logo anytime to jump back to the dashboard, then move into the next lane from there.
          </p>
        </div>
      </div>
    </aside>
  );
}
