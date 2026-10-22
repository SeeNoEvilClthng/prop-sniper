import type { ComponentPropsWithoutRef } from "react";

/** Shared presentation container for the existing authentication forms. */
export default function GlassCard({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#111018] shadow-xl ${className}`}
      {...props}
    />
  );
}
