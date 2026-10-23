import Image from "next/image";
import Link from "next/link";

import "@/app/landing.css";
import { CTA_LABEL, SITE } from "@/lib/site";

export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ps">
      <a href="#main" className="ps-skip">
        Skip to content
      </a>

      <header className="ps-header">
        <div className="ps-wrap ps-header-inner">
          <Link href="/" className="ps-logo" aria-label="PropSniper home">
            <Image
              src="/branding/propsniper-logo.png"
              alt=""
              width={56}
              height={56}
              priority
            />
          </Link>

          <nav className="ps-nav" aria-label="Main">
            <Link href="/#features">Features</Link>
            <Link href="/#pricing">Pricing</Link>
            
          </nav>

          <div className="ps-header-actions">
            <Link href="/login" className="ps-login">
              Log in
            </Link>
            <Link href="/signup" className="ps-btn ps-btn-primary">
              {CTA_LABEL}
            </Link>
          </div>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer className="ps-footer">
        <div className="ps-wrap ps-footer-inner">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <nav className="ps-footer-links" aria-label="Footer">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Log in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
