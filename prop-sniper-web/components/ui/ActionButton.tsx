"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

function getVariantClasses(variant: NonNullable<ActionButtonProps["variant"]>) {
  switch (variant) {
    case "primary":
      return "border border-violet-400/20 bg-violet-500/90 text-white hover:bg-violet-400";
    case "secondary":
      return "border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]";
    case "danger":
      return "border border-rose-400/20 bg-rose-500/12 text-rose-100 hover:bg-rose-500/18";
    default:
      return "border border-transparent bg-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white";
  }
}

export default function ActionButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "secondary",
  size = "md",
  disabled = false,
  className = "",
}: ActionButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-xl font-medium transition ${
    size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
  } ${getVariantClasses(variant)} ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
