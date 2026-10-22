import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MarketingShell from "@/components/marketing/MarketingShell";
import { CTA_LABEL, SITE } from "@/lib/site";

const DESCRIPTION = "Find property leads on a map, track seller follow-ups, analyze deals, and match buyers. PropSniper is the CRM for solo wholesalers and small acquisitions teams.";
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "PropSniper | Map-based CRM for real estate wholesalers",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: "PropSniper | Map-based wholesaling CRM", description: DESCRIPTION, type: "website", url: "/", images: [{ url: "/branding/marketing-og.png", width: 1200, height: 630, alt: "PropSniper � Find leads. Track follow-ups. Match buyers." }] },
  twitter: { card: "summary_large_image", images: ["/branding/marketing-og.png"] },
};
const heroPath = path.join(process.cwd(), "public", "screens", "map-view.png");
const hasHero = fs.existsSync(heroPath);
export default function HomePage() {
  return <MarketingShell>
    <section className="ps-hero" aria-labelledby="hero-title"><div className="ps-wrap">
      <h1 id="hero-title">Your market. Your leads. One map.</h1>
      <p className="ps-hero-sub">Find property leads, track seller follow-ups, and match deals to buyers in one CRM.</p>
      <div className="ps-hero-actions"><Link href="/signup" className="ps-btn ps-btn-primary">{CTA_LABEL}</Link></div>
      {hasHero ? <div className="ps-shot"><Image src="/screens/map-view.png" alt="PropSniper map with property lead pins and the selected lead�s details panel" width={1600} height={1000} preload sizes="(min-width: 1120px) 1056px, calc(100vw - 40px)" /></div> : <div className="ps-shot-placeholder" role="note"><strong>Product screenshot pending</strong><p>The real map view with lead pins and a lead panel will appear here.</p></div>}
    </div></section>
    {/* FEATURES */}
    {/* PROCESS */}
    {/* PRICING */}
    {/* FAQ */}
    {/* TODO: add verified customer proof only with permission and supporting evidence. */}
  </MarketingShell>;
}
