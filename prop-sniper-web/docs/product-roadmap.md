# PropSniper Product Roadmap

## Vision
PropSniper becomes an end-to-end wholesaling platform that helps users:

- find off-market opportunities
- identify motivation and distress faster
- analyze deals with confidence
- contact sellers and manage follow-up
- build and match cash buyers
- dispo deals faster
- use AI to make better acquisition decisions

The target is a product that can compete with BatchLeads, PropStream, and DealMachine by combining lead generation, CRM, dispo, and AI into one workflow.

## Product Positioning
PropSniper should feel like:

- a lead engine for acquisitions teams
- a decision engine for evaluating deals
- a workflow system for moving leads to contract
- a disposition tool for moving contracts to buyers
- an AI copilot for prioritization, negotiation, and action suggestions

## Core User Types
- Solo wholesaler
- Acquisitions manager
- Dispositions manager
- Small acquisitions team
- Investor building a buyer list

## Core Product Pillars

### 1. Lead Engine
Users need to search, import, save, filter, and organize properties.

Key features:
- city, ZIP, and map-based search
- saved leads and custom lists
- property filters
- list import and CSV upload
- lead statuses and tags
- notes, reminders, and assignments

### 2. Motivation Intelligence
Users need to know which properties are most likely to convert.

Key signals:
- absentee owner
- high equity
- tax delinquent
- pre-foreclosure
- foreclosure
- vacant
- tired landlord
- long-term owner
- inherited / probate
- lien or distress indicators
- code violation indicators

AI layer:
- motivation summary
- ranked distress signals
- likely seller situation
- suggested outreach angle

### 3. Deal Engine
Users need fast and trustworthy numbers.

Key features:
- comp analysis
- ARV estimate
- rehab estimate
- max allowable offer
- cash offer guidance
- spread and margin analysis
- exit strategy suggestions

AI layer:
- deal strength explanation
- negotiation suggestions
- seller text/call opener generation
- missing-data warnings

### 4. CRM + Pipeline
Users need to move leads from cold to closed.

Key features:
- pipeline statuses
- outreach logging
- call, text, email history
- follow-up tasks
- reminders
- owner contact records
- team assignment
- activity timeline

### 5. Buyer / Dispo Engine
Users need to sell deals faster once they get one under contract.

Key features:
- investor database
- buyer preferences / buy box
- match deal to buyer criteria
- send deal to buyers
- track responses
- dispo notes and status

### 6. AI Copilot
AI should support the user at every step instead of living in one isolated feature.

Key use cases:
- explain why a lead is worth pursuing
- summarize motivation signals
- analyze whether a deal is viable
- draft seller outreach
- suggest follow-up timing
- summarize lead history before a call
- suggest best buyers for a deal

## Competitive Edge
To stand out, PropSniper should combine:

- better workflow than spreadsheet-driven wholesalers
- clearer motivation reasoning than raw data-only tools
- faster deal triage with AI
- smoother handoff from acquisition to dispo
- a cleaner, more modern UX than legacy real estate SaaS tools

## Product Phases

## Phase 1: Foundation MVP
Goal: make the app useful for a solo wholesaler end to end.

Must-have outcomes:
- users can create and manage leads
- users can analyze a deal
- users can see motivation signals
- users can track follow-ups
- users can manage buyers
- users can send a deal to buyers

Scope:
- auth and billing baseline
- dashboard overview
- lead list and lead detail pages
- add/edit lead flow
- buyer list and buyer detail flow
- basic map view
- deal analyzer
- AI lead summary
- send-to-buyers workflow

## Phase 2: Lead Discovery and Data Depth
Goal: compete on finding better opportunities.

Scope:
- city finder upgrades
- saved searches
- richer property filters
- map search with polygons and bounds
- list imports
- distress/motivation scoring model v2
- enrichment pipeline for owner and property data
- pre-foreclosure / foreclosure and tax signal ingestion

## Phase 3: Acquisition CRM
Goal: help teams consistently move leads to contract.

Scope:
- reminders and task queue
- outreach cadence tracking
- seller timeline
- team assignments
- notes and call outcomes
- follow-up automations
- KPI reporting for acquisition reps

## Phase 4: Disposition System
Goal: help users sell deals faster and build repeat buyers.

Scope:
- buyer buy-box management
- deal packet pages
- buyer matching scores
- blast campaigns
- response tracking
- disposition pipeline

## Phase 5: AI Operating System
Goal: make AI part of every meaningful workflow.

Scope:
- AI deal triage
- AI lead prioritization
- AI seller outreach assistant
- AI buyer match explanation
- AI action recommendations on dashboard
- AI summaries for lead history and next best action

## Phase 6: Team and Enterprise Features
Goal: support growing wholesaling operations.

Scope:
- roles and permissions
- admin tools
- team performance reporting
- shared pipelines
- account-wide automations
- audit logs

## Current Repo Capabilities
Already present in the codebase:

- dashboard shell
- lead pages
- investor pages
- map page
- city finder
- deal analysis logic
- buyer send flow
- Supabase auth
- Stripe billing
- OpenAI integration hooks

Current gaps:

- route consistency and app stability
- unified lead detail experience
- durable motivation signal model
- consistent database-backed dashboard flows
- richer buyer matching
- production-grade AI workflows
- complete verification and lint/build health

## Recommended First Sprint
Build the strongest core loop first:

`Find lead -> score lead -> analyze deal -> contact seller -> move status -> match buyers`

Sprint 1 scope:
- stabilize routing and build health
- unify dashboard navigation
- improve lead detail page
- add motivation signals panel to lead detail
- add AI summary panel to lead detail
- connect deal analyzer to real lead data
- improve buyer match output
- make dashboard pages reflect real app functions instead of placeholders

## Proposed Data Model Additions
Tables or fields we likely need:

### leads
- property address fields
- owner fields
- phones and emails
- status
- source
- tags
- distress flags
- motivation score
- AI summary
- asking price
- arv
- rehab estimate
- mao
- assigned user
- next follow-up date

### lead_events
- lead_id
- event_type
- note
- created_by
- created_at

### lead_tasks
- lead_id
- task_type
- due_at
- status
- assigned_to

### investors
- contact info
- markets
- price range
- asset types
- bedrooms/bath preferences
- notes

### buyer_matches
- lead_id
- investor_id
- match_score
- reasons

## Build Principles
- Every feature should reduce time to contract or time to dispo.
- Every screen should answer: what should the user do next?
- AI should explain and assist, not just decorate.
- Dashboard items should map to real workflows, not placeholders.
- The app should work for a solo wholesaler before it tries to satisfy a large team.

## Immediate Execution Order
1. Stabilize the app and clean routing/build blockers.
2. Turn dashboard pages into real workflow pages.
3. Strengthen lead detail as the center of the system.
4. Add motivation intelligence and AI explanations.
5. Upgrade finder and map search.
6. Improve buyer database and match engine.
7. Add reminders, tasks, and pipeline automation.

## Definition of Success
PropSniper is on the right track when a wholesaler can:

- find a property worth pursuing
- understand why it is motivated
- analyze the deal confidently
- contact the seller from inside the app
- track every follow-up
- assign or move the lead through a pipeline
- match the deal to likely buyers
- move from lead to contract without leaving the platform
