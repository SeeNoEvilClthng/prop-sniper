"use client";

import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const sizeClasses = {
  xs: "w-[84px]",
  sm: "w-[108px]",
  md: "w-[138px]",
  lg: "w-[176px]",
};

export default function BrandLogo({
  href = "/dashboard",
  size = "md",
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center transition hover:opacity-95 ${className}`}
      aria-label="Go to dashboard"
    >
      <Image
        src="/branding/propsniper-logo.png"
        alt="PropSniper logo"
        width={768}
        height={768}
        priority={priority}
        className={`${sizeClasses[size]} h-auto object-contain opacity-92 saturate-[1.08] [filter:drop-shadow(0_6px_14px_rgba(168,85,247,0.12))]`}
      />
    </Link>
  );
}
