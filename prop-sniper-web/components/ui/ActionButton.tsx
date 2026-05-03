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
      return "border border-[#7C3AED]/30 bg-[#7C3AED] text-white hover:bg-[#8B5CF6] hover:shadow-[0_0_24px_rgba(124,58,237,0.28)] active:bg-[#5B21B6]";
    case "secondary":
      return "border border-[#2A2A2A] bg-[#1F1F1F] text-white hover:border-[#7C3AED]/20 hover:shadow-[0_0_20px_rgba(124,58,237,0.12)]";
    case "danger":
      return "border border-[#2A2A2A] bg-[#1F1F1F] text-white hover:border-[#7C3AED]/20 hover:text-[#FFFFFF]";
    default:
      return "border border-transparent bg-transparent text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-white";
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
  const classes = `inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ${
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
