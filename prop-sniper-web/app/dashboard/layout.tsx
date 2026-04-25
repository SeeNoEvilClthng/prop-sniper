import type { ReactNode } from "react";

import CommandPalette from "@/components/ui/CommandPalette";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#08111d] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.12),transparent_22%),linear-gradient(180deg,#05060c_0%,#090b14_40%,#060811_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <CommandPalette />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <TopBar />
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
