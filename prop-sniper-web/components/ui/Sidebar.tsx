"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/ui/BrandLogo";

const navSections = [
  {
    title: "PropSniper",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "◌", meta: "Overview" },
      { label: "Finder", href: "/finder", icon: "✦", meta: "Data" },
      { label: "Map", href: "/map", icon: "▣", meta: "Visual" },
      { label: "Saved Leads", href: "/leads?view=table", icon: "◎", meta: "CRM" },
      { label: "AI Agent", href: "/ai-agent", icon: "◍", meta: "Automation" },
      { label: "Buyer Finder", href: "/buyer-finder", icon: "↗", meta: "Dispo" },
      { label: "Campaigns", href: "/campaigns", icon: "◔", meta: "Outreach" },
      { label: "Settings", href: "/settings", icon: "＋", meta: "Admin" },
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
    <aside className="hidden w-[268px] shrink-0 border-r border-white/8 bg-[#090c13]/95 backdrop-blur-xl md:fixed md:inset-y-0 md:left-0 md:block">
      <div className="sticky top-0 flex h-screen flex-col px-3 py-3">
        <div className="hover-glow rounded-[24px] border border-white/8 bg-[#0b0f17]/94 p-4 shadow-[0_18px_34px_rgba(0,0,0,0.24)]">
          <BrandLogo size="xs" className="mx-auto block w-fit" />
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-[#090c13] px-3 py-2.5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Mode</p>
              <p className="mt-1 text-sm font-semibold text-white">AI Wholesaling OS</p>
            </div>
            <span className="rounded-full border border-violet-400/16 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">
              Live
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
                      className={`hover-lift flex items-center gap-3 rounded-[18px] px-3 py-3 transition ${
                        active
                          ? "border border-fuchsia-400/18 bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(255,255,255,0.03))] text-white shadow-[0_0_28px_rgba(168,85,247,0.12)]"
                          : "border border-transparent bg-transparent text-slate-300 hover:border-white/8 hover:bg-white/[0.04] hover:text-white"
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

        <div className="mt-4 rounded-2xl border border-white/8 bg-[#0b0f17]/94 p-4">
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Flow</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Find leads, save the record, send the first text, wait for the reply, then let the AI Agent qualify the seller.
          </p>
        </div>
      </div>
    </aside>
  );
}
