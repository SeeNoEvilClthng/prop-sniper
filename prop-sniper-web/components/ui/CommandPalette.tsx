"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CommandAction = {
  label: string;
  description: string;
  href: string;
  keywords: string[];
  section: string;
};

const baseActions: CommandAction[] = [
  {
    label: "Open Dashboard",
    description: "Jump back to the command center",
    href: "/dashboard",
    keywords: ["home", "overview", "dashboard", "command"],
    section: "Navigate",
  },
  {
    label: "Work Lead Queue",
    description: "Open the acquisitions queue",
    href: "/leads",
    keywords: ["lead", "queue", "acquisitions", "crm"],
    section: "Leads",
  },
  {
    label: "Open Follow Ups",
    description: "Show due lead follow-ups",
    href: "/leads?follow_up=Due",
    keywords: ["follow up", "crm", "due", "tasks"],
    section: "Leads",
  },
  {
    label: "Add New Lead",
    description: "Capture a new property into the pipeline",
    href: "/dashboard/new",
    keywords: ["new", "add", "capture", "property"],
    section: "Leads",
  },
  {
    label: "Launch Finder",
    description: "Search for motivated sellers by market",
    href: "/finder",
    keywords: ["finder", "search", "market", "motivation"],
    section: "Research",
  },
  {
    label: "Open Map View",
    description: "Hunt visually with deal markers",
    href: "/map",
    keywords: ["map", "sniper", "drive", "geo"],
    section: "Research",
  },
  {
    label: "Open Deal Analyzer",
    description: "Run spread, ARV, and offer math",
    href: "/dashboard/analyzer",
    keywords: ["deal", "analyzer", "arv", "repairs", "offer"],
    section: "AI",
  },
  {
    label: "Open Buyer CRM",
    description: "Review investor demand and buyer matches",
    href: "/investors",
    keywords: ["buyers", "dispo", "investors", "crm"],
    section: "Dispo",
  },
  {
    label: "Open Team Ops",
    description: "See rep load, task risk, and ownership",
    href: "/team",
    keywords: ["team", "rep", "owner", "manager"],
    section: "Operations",
  },
];

export default function CommandPalette() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  function closePalette() {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.getAttribute("contenteditable") === "true";

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (!isTypingTarget && event.key === "/") {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (event.key === "Escape") {
        closePalette();
      }
    };

    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("propsniper:open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("propsniper:open-command-palette", onOpen);
    };
  }, []);

  const actions = useMemo(() => {
    return baseActions.filter((action) => action.href !== pathname);
  }, [pathname]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return actions;

    return actions.filter((action) => {
      const haystack = [
        action.label,
        action.description,
        action.section,
        ...action.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(value);
    });
  }, [actions, query]);

  const activeIndex = filtered.length ? Math.min(selectedIndex, filtered.length - 1) : 0;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!filtered.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % filtered.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => (current - 1 + filtered.length) % filtered.length);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const selected = filtered[activeIndex];
        if (!selected) return;
        closePalette();
        router.push(selected.href);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, filtered, open, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 px-4 py-14 backdrop-blur-xl">
      <button
        type="button"
        aria-label="Close command palette backdrop"
        className="absolute inset-0 cursor-default"
        onClick={closePalette}
      />

      <div className="luxe-panel edge-glow relative z-10 w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/10">
        <div className="border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <span className="text-sm uppercase tracking-[0.28em] text-violet-200/80">
              Search
            </span>
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Find leads, jump to map, open analyzer..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-400">
              esc
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1">
              Cmd/Ctrl + K
            </span>
            <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1">
              /
            </span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-sm text-slate-400">
              No command matched that search yet.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((action, index) => {
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={closePalette}
                    className={`block rounded-2xl border px-4 py-4 transition ${
                      index === activeIndex
                        ? "border-violet-400/24 bg-violet-500/10 shadow-[0_18px_40px_rgba(91,33,182,0.24)]"
                        : "border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{action.label}</p>
                        <p className="mt-1 text-sm text-slate-400">{action.description}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-400">
                        {action.section}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
