import fs from "node:fs";

import path from "node:path";

import type { Metadata } from "next";

import Image from "next/image";

import Link from "next/link";

import { MapPinned, ListChecks, Send, Plus } from "lucide-react";

import Pricing from "@/components/marketing/Pricing";

import MarketingShell from "@/components/marketing/MarketingShell";

import { CTA_LABEL, SITE } from "@/lib/site";



const DESCRIPTION = "Find property leads on a map, track seller follow-ups, analyze deals, and match buyers. PropSniper is the CRM for solo wholesalers and small acquisitions teams.";

export const metadata: Metadata = {

  metadataBase: new URL(SITE.url),

  title: "PropSniper | Map-based CRM for real estate wholesalers",

  description: DESCRIPTION,

  alternates: { canonical: "/" },

  openGraph: { title: "PropSniper | Map-based wholesaling CRM", description: DESCRIPTION, type: "website", url: "/", images: [{ url: "/branding/marketing-og.png", width: 1200, height: 630, alt: "PropSniper — Find leads. Track follow-ups. Match buyers." }] },

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

      {hasHero ? <div className="ps-shot"><Image src="/screens/map-view.png" alt="PropSniper map with property lead pins and the selected lead’s details panel" width={1600} height={1000} preload sizes="(min-width: 1120px) 1056px, calc(100vw - 40px)" /></div> : <div className="ps-shot-placeholder" role="note"><strong>Product screenshot pending</strong><p>The real map view with lead pins and a lead panel will appear here.</p></div>}

    </div></section>

    <section id="features" className="ps-section" aria-labelledby="features-title"><div className="ps-wrap">

<h2 id="features-title" className="ps-h2">Keep the next step in view.</h2>

<div className="ps-features">

<article className="ps-feature"><MapPinned aria-hidden="true" className="ps-feature-icon" /><h3>Find leads on a map</h3><p>Search a city. Review property records and ownership signals. Save leads to your pipeline.</p></article>

<article className="ps-feature"><ListChecks aria-hidden="true" className="ps-feature-icon" /><h3>Track every follow-up</h3><p>Keep notes, tasks, and deal estimates with each lead. Assign the next step to yourself or a teammate.</p></article>

<article className="ps-feature"><Send aria-hidden="true" className="ps-feature-icon" /><h3>Match deals to buyers</h3><p>Compare deals with your buyer list. Review matches and send a deal email.</p></article>

</div></div></section>

    <section className="ps-section" aria-labelledby="process-title"><div className="ps-wrap">

<h2 id="process-title" className="ps-h2">From search to follow-up.</h2>

<ol className="ps-steps"><li className="ps-step"><h3>Choose a market</h3><p>Search a city and state. Review property pins and save a lead.</p></li><li className="ps-step"><h3>Check the numbers</h3><p>Review the value estimate and repair allowance. Verify both before making an offer.</p></li><li className="ps-step"><h3>Move the deal forward</h3><p>Set a follow-up task. When you control a deal, review buyer matches.</p></li></ol>

<div className="ps-note"><h3>Where the data comes from</h3><p>Property records come from RentCast. Maps use Mapbox. Value estimates use RentCast’s automated valuation, available comparable prices, or a saved estimate. They are not verified after-repair values or appraisals.</p><p>Skip tracing is not connected in the reviewed enrichment flow. It does not return owner phone numbers or emails. Coverage and accuracy vary; verify records and estimates.</p></div>

</div></section>

    <Pricing />

    <section id="faq" className="ps-section" aria-labelledby="faq-title"><div className="ps-wrap">

<h2 id="faq-title" className="ps-h2">Before you start.</h2><div className="ps-faq">

<details><summary>Where does the property data come from?<Plus aria-hidden="true" /></summary><p>RentCast supplies property records and value estimates. Mapbox supplies the map. Coverage varies. Owner contact details are not supplied by the current enrichment flow.</p></details>

<details><summary>How does the trial and cancellation work?<Plus aria-hidden="true" /></summary><p>The Starter checkout is configured for a 7-day trial followed by monthly billing. Review Stripe’s checkout terms before subscribing. Cancellation instructions and refund terms are awaiting confirmation; see the draft Terms page.</p></details>

<details><summary>Which integrations are connected?<Plus aria-hidden="true" /></summary><p>The code integrates Supabase, RentCast, Mapbox, Stripe, OpenAI, Twilio, and Resend. Availability depends on account setup. No external CRM sync is advertised.</p></details>

<details><summary>Does PropSniper make calls and texts compliant?<Plus aria-hidden="true" /></summary><p>No compliance guarantee is provided. Before outreach, verify consent, applicable TCPA and state requirements, Do Not Call restrictions, and opt-out handling. A property record or phone number does not establish permission to contact someone.</p></details>

<details><summary>Who owns my data? Can I export it?<Plus aria-hidden="true" /></summary><p>Data ownership, export, retention, and deletion terms are awaiting owner and lawyer approval. The draft Terms and Privacy pages identify what still needs to be confirmed. Self-service export is not promised.</p></details>

</div>

<div className="ps-final"><h2>Put your next lead on the map.</h2><div className="ps-hero-actions"><Link href="/signup" className="ps-btn ps-btn-primary">{CTA_LABEL}</Link></div><p className="ps-fineprint">7 days free. Then $29/month. Card required.</p></div>

</div></section>

    {/* TODO: add verified customer proof only with permission and supporting evidence. */}

  </MarketingShell>;

}

