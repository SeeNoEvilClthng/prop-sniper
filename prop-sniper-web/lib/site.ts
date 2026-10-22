// Single source of truth for marketing + legal pages.
// Update these values and every page picks them up.

export const SITE = {
  name: "PropSniper",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://propsniper.app",

  // TODO: add your real support email. Until it is set, the Contact page
  // shows a draft notice instead of a mailto link.
  contactEmail: "",

  trialDays: 7,
  starterPrice: 29,

  // Shown at the top of Terms and Privacy.
  legalLastUpdated: "October 21, 2026",
} as const;

export const CTA_LABEL = "Start free trial";
