# PropSniper Web

PropSniper is a real-estate wholesaling operating system built with Next.js, Supabase, Stripe, Mapbox, and AI-assisted lead intelligence.

## What It Includes

- acquisitions dashboard
- lead queue and lead workspace
- motivation signals and AI summaries
- deal analysis and buyer matching
- team assignment, notes, workflow, and tasks
- dispo send flow
- manager/team performance views

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in the required values in `.env.local`.

4. Start the app:

```bash
npm run dev
```

5. Run lint before shipping changes:

```bash
npm run lint
```

## Required Environment Variables

Core app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`

Billing:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Maps and property data:

- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `RENTCAST_API_KEY`

AI and outbound:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults in code
- `RESEND_API_KEY`

Optional server-side auth fallback:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Deployment

Recommended path:

1. Push `main` to GitHub.
2. Import the repo into Vercel.
3. Add the production environment variables from `.env.example`.
4. Set your production URL in:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_APP_URL`
5. Trigger a production deploy.

Detailed deployment notes are in [docs/deployment-guide.md](/Users/wunmanbandxay._/Documents/Codex/2026-04-19-am-i-able-to-connect-you/prop-sniper/prop-sniper-web/docs/deployment-guide.md).

## Current Product Docs

- Roadmap: [docs/product-roadmap.md](/Users/wunmanbandxay._/Documents/Codex/2026-04-19-am-i-able-to-connect-you/prop-sniper/prop-sniper-web/docs/product-roadmap.md)
- Deployment: [docs/deployment-guide.md](/Users/wunmanbandxay._/Documents/Codex/2026-04-19-am-i-able-to-connect-you/prop-sniper/prop-sniper-web/docs/deployment-guide.md)
