import React from "react";

import BrandLogo from "@/components/ui/BrandLogo";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function AppShell({
  children,
  title,
  subtitle,
  className = "",
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#08111d] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(38,138,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(215,181,111,0.08),transparent_20%),linear-gradient(180deg,#08111d_0%,#0a1321_40%,#07101a_100%)]" />
      <main className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
        {(title || subtitle) && (
          <div className="mb-6 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="mb-5">
              <BrandLogo size="sm" />
            </div>
            {title && (
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
