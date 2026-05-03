"use client";

import type { ReactNode } from "react";

import CommandPalette from "@/components/ui/CommandPalette";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/Topbar";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07090f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_28%),linear-gradient(180deg,#07090f_0%,#090c13_45%,#07090f_100%)]" />
      <CommandPalette />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1 md:pl-[268px]">
          <TopBar />
          <div className="page-enter px-4 py-5 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
