"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { navSections } from "./dashboardData";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allNavItems = useMemo(
    () => navSections.flatMap((section) => section.items),
    []
  );

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_25%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07111f]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-bold shadow-lg shadow-sky-950/40"
            >
              PS
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-200">
                PropSniper
              </p>
              <p className="text-sm text-slate-300">Dashboard</p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2">
            {allNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white xl:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#07111f]/95 px-4 py-4 xl:hidden">
            <div className="grid gap-2">
              {navSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                    {section.title}
                  </p>
                  <div className="grid gap-2">
                    {section.items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`rounded-xl px-3 py-3 text-sm transition ${
                            active
                              ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30"
                              : "bg-[#0d1727] text-slate-300 hover:bg-[#101b2d]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span>{item.icon}</span>
                            <div>
                              <p className="font-medium text-white">{item.label}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {navSections.map((section) => (
              <div key={section.title} className="mb-5 last:mb-0">
                <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                  {section.title}
                </p>
                <div className="grid gap-2">
                  {section.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-2xl px-3 py-3 transition ${
                          active
                            ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30"
                            : "bg-[#0d1727] text-slate-300 hover:bg-[#101b2d]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span>{item.icon}</span>
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
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}