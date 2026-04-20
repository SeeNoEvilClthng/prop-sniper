# Deployment Guide

## Before You Push

Make sure these pass locally:

```bash
npm run lint
npm run build
```

If `git push` fails with a GitHub auth error on this machine, authenticate first with either:

```bash
gh auth login
```

or by setting up git credentials for your GitHub account.

Then push:

```bash
git push origin main
```

## Recommended Hosting

Vercel is the cleanest deployment path for this app because it is a standard Next.js project.

## Vercel Setup

1. Create a new Vercel project from the GitHub repo.
2. Use the `prop-sniper-web` folder as the project root if Vercel asks.
3. Add the environment variables from [.env.example](/Users/wunmanbandxay._/Documents/Codex/2026-04-19-am-i-able-to-connect-you/prop-sniper/prop-sniper-web/.env.example).
4. Set:
   - `NEXT_PUBLIC_SITE_URL` to your public domain
   - `NEXT_PUBLIC_APP_URL` to your public domain
5. Deploy.

## Supabase Checklist

You will need:

- authentication enabled
- `leads` table
- `investors` table
- `profiles` table
- `contact_attempts` table

The latest app behavior expects `contact_attempts` to be used for:

- outreach logs
- workflow events
- manual notes
- tasks
- assignment events

## Stripe Checklist

For billing to work in production:

- create the live products/prices in Stripe
- set `STRIPE_SECRET_KEY`
- set `STRIPE_PRICE_ID`
- set `STRIPE_STARTER_PRICE_ID`
- set `STRIPE_WEBHOOK_SECRET`
- point Stripe success/cancel URLs to the deployed domain

## Optional Integrations

These features degrade if the keys are missing, but some workflows become preview-only:

- `OPENAI_API_KEY`
  AI lead summaries and AI deal analysis will fall back when possible.
- `RESEND_API_KEY`
  buyer blasts will generate previews instead of sending.
- `RENTCAST_API_KEY`
  property enrichment, photos, and some underwriting data will be limited.
- `NEXT_PUBLIC_MAPBOX_TOKEN`
  map features will not render correctly without it.

## Fastest Publish Path

1. Authenticate git on this machine.
2. Push `main` to GitHub.
3. Import to Vercel.
4. Fill env vars.
5. Deploy.
6. Test:
   - login
   - lead queue
   - lead detail page
   - finder
   - team page
   - billing
