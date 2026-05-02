"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/ui/BrandLogo";

const navSections = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "◌", meta: "Home" },
      { label: "Finder", href: "/finder", icon: "✦", meta: "Pull Data" },
      { label: "Map", href: "/map", icon: "▣", meta: "Pins" },
      { label: "Saved Leads", href: "/leads?view=table", icon: "◎", meta: "Table" },
      { label: "CRM", href: "/leads?view=pipeline", icon: "◔", meta: "Pipeline" },
      { label: "Outreach", href: "/outreach", icon: "◍", meta: "AI" },
      { label: "Deal Analyzer", href: "/dashboard/analyzer", icon: "◌", meta: "Numbers" },
      { label: "Appointments", href: "/appointments", icon: "◈", meta: "Book" },
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
    <aside className="hidden w-[250px] shrink-0 border-r border-white/8 bg-[#090c13] md:block">
      <div className="sticky top-0 flex h-screen flex-col px-3 py-3">
        <div className="rounded-2xl border border-white/8 bg-[#0c1118] p-4">
          <BrandLogo size="xs" className="mx-auto block w-fit" />
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-[#0a0e14] px-3 py-2.5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Deal Flow</p>
              <p className="mt-1 text-sm font-semibold text-white">Find • Text • Qualify</p>
            </div>
            <span className="rounded-full border border-violet-400/16 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">
              Simple CRM
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
                          ? "border border-fuchsia-400/18 bg-fuchsia-500/10 text-white"
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

        <div className="mt-4 rounded-2xl border border-white/8 bg-[#0c1118] p-4">
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Start here</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Use Finder or Map to pull data, save the lead, send the first text, then move into AI outreach once the seller replies.
          </p>
        </div>
      </div>
    </aside>
  );
}
