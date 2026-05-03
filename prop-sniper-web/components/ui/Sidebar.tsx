"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/ui/BrandLogo";

const items = [
  { label: "Finder", href: "/finder", icon: "⌕" },
  { label: "Map", href: "/map", icon: "◫" },
  { label: "Saved Leads", href: "/leads?view=table", icon: "◎" },
  { label: "Campaigns", href: "/campaigns", icon: "◔" },
  { label: "AI Agent", href: "/ai-agent", icon: "✦" },
  { label: "CRM", href: "/leads?view=pipeline", icon: "◍" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

function isActivePath(pathname: string, href: string) {
  if (href.includes("?")) {
    const base = href.split("?")[0];
    return pathname === base || pathname.startsWith(`${base}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[84px] shrink-0 border-r border-[#2A2A2A] bg-[#0A0A0A]/96 backdrop-blur-xl md:fixed md:inset-y-0 md:left-0 md:block">
      <div className="flex h-full flex-col items-center px-3 py-4">
        <BrandLogo size="xs" className="mb-6" />

        <nav className="flex flex-1 flex-col items-center gap-3">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 ${
                  active
                    ? "border-[#7C3AED]/30 bg-[#7C3AED]/16 text-white shadow-[0_0_20px_rgba(124,58,237,0.24)]"
                    : "border-[#2A2A2A] bg-[#121212] text-[#A1A1AA] hover:border-[#7C3AED]/20 hover:text-white hover:shadow-[0_0_18px_rgba(124,58,237,0.14)]"
                }`}
              >
                <span className="text-lg font-semibold">{item.icon}</span>
                {active ? (
                  <span className="absolute -left-3 h-7 w-1 rounded-r-full bg-[#7C3AED]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 h-12 w-12 rounded-xl border border-[#2A2A2A] bg-[#121212]" />
      </div>
    </aside>
  );
}
