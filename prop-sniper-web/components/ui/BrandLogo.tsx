"use client";

import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const sizeClasses = {
  sm: "w-[122px]",
  md: "w-[168px]",
  lg: "w-[240px]",
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
        className={`${sizeClasses[size]} h-auto object-contain drop-shadow-[0_10px_25px_rgba(168,85,247,0.25)]`}
      />
    </Link>
  );
}
