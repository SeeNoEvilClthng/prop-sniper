"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/ui/BrandLogo";

const featuredLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "◌" },
  { label: "Leads", href: "/leads", icon: "◎" },
  { label: "CRM", href: "/leads?follow_up=Due", icon: "◔" },
  { label: "Finder", href: "/finder", icon: "✦" },
  { label: "Buyers", href: "/investors", icon: "↗" },
  { label: "Team", href: "/team", icon: "◈" },
];

const quickTools = [
  {
    label: "Add Lead",
    href: "/dashboard/new",
    description: "Save a new opportunity fast",
    icon: "＋",
  },
  {
    label: "Map View",
    href: "/map",
    description: "See lead clusters by area",
    icon: "▣",
  },
  {
    label: "Deal Analyzer",
    href: "/dashboard/analyzer",
    description: "Run spread and offer math",
    icon: "◌",
  },
  {
    label: "Lead Statuses",
    href: "/dashboard/status",
    description: "Check every stage quickly",
    icon: "◍",
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="futuristic-grid hidden w-[290px] shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,rgba(6,7,13,0.98),rgba(10,11,20,0.94))] md:block">
      <div className="sticky top-0 flex h-screen flex-col px-5 py-6">
        <div className="luxe-panel edge-glow sheen rounded-[28px] p-4 xleads-vibe">
          <div className="flex justify-center">
            <BrandLogo size="sm" className="mx-auto" />
          </div>

          <div className="mt-4 rounded-2xl border border-fuchsia-400/16 bg-[#0b0d19] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Focus today
            </p>
            <p className="mt-2 text-sm font-semibold text-fuchsia-200">
              Work hot leads, clear overdue tasks, and move clean deals toward buyer review.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Press Cmd/Ctrl + K to jump anywhere
            </p>
          </div>
        </div>

        <nav className="mt-6 space-y-6 overflow-y-auto pr-1">
          <div>
            <p className="mb-3 px-2 text-[11px] uppercase tracking-[0.3em] text-slate-500">
              Core
            </p>
            <div className="space-y-2">
              {featuredLinks.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "border border-fuchsia-400/18 bg-fuchsia-500/10 text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)]"
                        : "border border-transparent bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span className={`text-base ${active ? "text-fuchsia-200" : "text-slate-500"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 px-2 text-[11px] uppercase tracking-[0.3em] text-slate-500">
              Quick Tools
            </p>
            <div className="space-y-2">
              {quickTools.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-start gap-3 rounded-2xl px-4 py-3 transition ${
                      active
                        ? "border border-white/10 bg-white/[0.08]"
                        : "border border-transparent hover:border-white/8 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="mt-0.5 text-base">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="luxe-panel edge-glow mt-6 rounded-[26px] p-4 xleads-vibe">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Operator note</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            The fastest teams work from one system. Keep lead context, next step, and buyer angle visible before every call.
          </p>
        </div>
      </div>
    </aside>
  );
}
