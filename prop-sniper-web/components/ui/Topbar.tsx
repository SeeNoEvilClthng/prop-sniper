"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

function getHeaderMeta(pathname: string) {
  if (pathname.startsWith("/finder") || pathname === "/dashboard") {
    return {
      title: "Finder",
      subtitle: "Find leads, save them, and start AI outreach fast.",
    };
  }

  if (pathname.startsWith("/map")) {
    return {
      title: "Map",
      subtitle: "View leads geographically and jump into outreach from the map.",
    };
  }

  if (pathname.startsWith("/leads")) {
    return {
      title: "Saved Leads",
      subtitle: "Manage your lead pipeline and review next actions quickly.",
    };
  }

  if (pathname.startsWith("/campaigns")) {
    return {
      title: "Campaigns",
      subtitle: "Launch and monitor seller outreach campaigns.",
    };
  }

  if (pathname.startsWith("/ai-agent")) {
    return {
      title: "AI Agent",
      subtitle: "Qualify interested sellers and push toward booked appointments.",
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      title: "Settings",
      subtitle: "Configure the platform and manage account controls.",
    };
  }

  return {
    title: "Workspace",
    subtitle: "Run your lead workflow in one place.",
  };
}

export default function TopBar() {
  const pathname = usePathname();
  const meta = getHeaderMeta(pathname);
  const [search, setSearch] = useState("");

  return (
    <header className="border-b border-[#2A2A2A] bg-[#0A0A0A]/92 backdrop-blur-xl">
      <div className="px-4 py-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">{meta.title}</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">{meta.subtitle}</p>
          </div>

          <div className="flex w-full flex-col gap-3 xl:max-w-[760px] xl:flex-row xl:items-center xl:justify-end">
            <form className="flex-1" action="/finder">
              <input
                name="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads, owners, or markets"
                className="w-full rounded-xl border border-[#2A2A2A] bg-[#121212] px-4 py-2.5 text-sm text-white outline-none transition-all duration-300 focus:border-[#7C3AED]/40"
              />
            </form>
            <button
              type="button"
              className="rounded-xl border border-[#2A2A2A] bg-[#121212] px-4 py-2.5 text-sm font-medium text-[#A1A1AA] transition-all duration-300 hover:border-[#7C3AED]/20 hover:text-white hover:shadow-[0_0_18px_rgba(124,58,237,0.14)]"
            >
              Filters
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#2A2A2A] bg-[#121212] px-4 py-2.5 text-sm font-medium text-[#A1A1AA] transition-all duration-300 hover:border-[#7C3AED]/20 hover:text-white hover:shadow-[0_0_18px_rgba(124,58,237,0.14)]"
            >
              Export
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#121212] text-[#A1A1AA] transition-all duration-300 hover:border-[#7C3AED]/20 hover:text-white hover:shadow-[0_0_18px_rgba(124,58,237,0.14)]"
            >
              ☺
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
