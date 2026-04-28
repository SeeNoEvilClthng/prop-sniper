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
    <aside className="futuristic-grid hidden w-[276px] shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,rgba(4,5,11,0.98),rgba(8,10,18,0.95))] md:block">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-4">
        <div className="luxe-panel edge-glow sheen rounded-[24px] p-4 xleads-vibe">
          <div className="flex justify-center">
            <BrandLogo size="xs" className="mx-auto" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-violet-400/14 bg-violet-500/10 p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-violet-200/70">
                System
              </p>
              <p className="mt-2 text-sm font-semibold text-white">PropSniper OS</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#0b0d19] p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Shortcut
              </p>
              <p className="mt-2 text-sm font-semibold text-fuchsia-200">Cmd/Ctrl + K</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-fuchsia-400/16 bg-[#0b0d19] p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Daily focus
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-fuchsia-200">
              Work hot leads, clear overdue tasks, and move clean deals toward buyer review.
            </p>
          </div>
        </div>

        <nav className="mt-5 space-y-5 overflow-y-auto pr-1">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.32em] text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 transition ${
                      active
                        ? "border border-fuchsia-400/18 bg-fuchsia-500/10 text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)]"
                        : "border border-transparent bg-white/[0.02] text-slate-300 hover:border-white/8 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span className={`text-base ${active ? "text-fuchsia-200" : "text-slate-500"}`}>
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-white">{item.label}</p>
                        <span className="rounded-full border border-white/8 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
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

        <div className="luxe-panel edge-glow mt-5 rounded-[22px] p-4 xleads-vibe">
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Operator note</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Keep next step, seller context, and buyer angle visible before every touch.
          </p>
        </div>
      </div>
    </aside>
  );
}
