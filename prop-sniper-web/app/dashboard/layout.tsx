import type { ReactNode } from "react";

import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#08111d] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(38,138,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(215,181,111,0.08),transparent_20%),linear-gradient(180deg,#08111d_0%,#0a1321_40%,#07101a_100%)]" />
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
