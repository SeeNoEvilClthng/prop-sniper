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
  xs: "w-[92px]",
  sm: "w-[118px]",
  md: "w-[150px]",
  lg: "w-[190px]",
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
      className={`inline-flex items-center rounded-2xl transition hover:opacity-95 ${className}`}
      aria-label="Go to dashboard"
    >
      <Image
        src="/branding/propsniper-logo.png"
        alt="PropSniper logo"
        width={768}
        height={768}
        priority={priority}
        className={`${sizeClasses[size]} h-auto object-contain drop-shadow-[0_8px_22px_rgba(168,85,247,0.2)]`}
      />
    </Link>
  );
}
