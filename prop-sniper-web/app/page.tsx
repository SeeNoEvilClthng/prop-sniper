"use client";

const reviews = [
  {
    name: "Andre Holloway",
    role: "Founder, Holloway Homebuyers",
    market: "Atlanta, GA",
    result: "Locked 4 contracts in 37 days",
    initials: "AH",
    review:
      "We replaced a patched-together stack of spreadsheets, notes, and skipped follow-ups with one clean workflow. My acquisitions rep finally has one place to see motivation, next step, score, and buyer angle before every call.",
  },
  {
    name: "Tiana Brooks",
    role: "Acquisitions Manager",
    market: "Dallas, TX",
    result: "Cut missed follow-ups by 61%",
    initials: "TB",
    review:
      "The best part is the clarity. I can open a lead and instantly see distress signals, underwriting, outreach history, and what task is due next. It feels much closer to how a real acquisitions floor should run.",
  },
  {
    name: "Luis Bennett",
    role: "Wholesale Operator",
    market: "Phoenix, AZ",
    result: "Sent 3 buyer blasts in one afternoon",
    initials: "LB",
    review:
      "Most tools give you data and leave the workflow messy. PropSniper feels like an operating system. Finder, lead review, team assignment, and dispo all connect in a way that actually helps us move faster.",
  },
];

const featurePillars = [
  {
    title: "Lead Engine",
    text: "Source, score, and organize distressed opportunities without bouncing between tabs and spreadsheets.",
    icon: "◎",
  },
  {
    title: "Motivation Intelligence",
    text: "Surface absentee owners, equity, vacancy, pre-foreclosure, tax signals, and AI lead context in one view.",
    icon: "✦",
  },
  {
    title: "Deal Control",
    text: "Review ARV, repairs, spread, next follow-up, and buyer angle before your acquisitions call ever starts.",
    icon: "◈",
  },
  {
    title: "Team Workflow",
    text: "Assign leads, track tasks, log notes, and keep the whole pipeline accountable instead of tribal.",
    icon: "◌",
  },
  {
    title: "Disposition Flow",
    text: "Match buyers, prep offer-ready deals, and move from signed contract to blast list with less friction.",
    icon: "↗",
  },
  {
    title: "Executive Visibility",
    text: "See rep load, overdue tasks, hot leads, and contract-stage pressure from a manager-ready view.",
    icon: "▣",
  },
];

const operatingStats = [
  { value: "84", label: "Avg hot-lead score", subtext: "AI-ranked opportunities rise to the top" },
  { value: "6", label: "Core workflows", subtext: "Finder, CRM, underwriting, tasks, buyers, team ops" },
  { value: "1", label: "Unified workspace", subtext: "From first touch to dispo handoff" },
];

const comparison = [
  {
    label: "Motivation signals and AI context",
    propsniper: "Built into the lead view",
    legacy: "Usually split across notes and separate tabs",
  },
  {
    label: "Underwriting plus CRM in one flow",
    propsniper: "Score, repairs, follow-up, and notes together",
    legacy: "Manual handoff between calculator and tracker",
  },
  {
    label: "Team accountability",
    propsniper: "Assignments, tasks, manager snapshots",
    legacy: "Usually managed in Slack or memory",
  },
  {
    label: "Disposition readiness",
    propsniper: "Buyer matching and blast workflow",
    legacy: "Often exported into another tool",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    badge: "For solo operators",
    description:
      "Get out of spreadsheets and into a clean lead workflow with scoring, pipeline management, and a real acquisitions command center.",
    features: [
      "Lead queue and acquisitions dashboard",
      "Lead scoring and motivation signals",
      "Basic underwriting workspace",
      "Follow-up workflow and notes",
      "Map and finder access",
    ],
    cta: "Start Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    badge: "Best for active wholesalers",
    description:
      "Built for operators who need stronger sourcing, better lead decisions, and a tighter path from acquisitions to dispo.",
    features: [
      "Everything in Starter",
      "AI summaries and stronger deal analysis",
      "Buyer matching and send-to-buyers flow",
      "Import-ready sourcing workflows",
      "Priority product support",
    ],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$149",
    period: "/month",
    badge: "For acquisitions teams",
    description:
      "Add ownership, task accountability, and manager visibility so your reps can work faster without the pipeline getting messy.",
    features: [
      "Everything in Pro",
      "Lead assignment and task management",
      "Team operations dashboard",
      "Rep load and overdue-risk visibility",
      "Shared workflow for acquisitions and dispo",
    ],
    cta: "Start Team",
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <main className="futuristic-grid min-h-screen overflow-x-hidden bg-[#06070d] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_28%),radial-gradient(circle_at_70%_0%,rgba(99,102,241,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_22%),linear-gradient(180deg,#06070d_0%,#090b14_35%,#070910_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#06070d]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="edge-glow sheen flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#0b0d16,#4c1d95)] text-sm font-semibold shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              PS
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.36em] text-[#c4b5fd]">
                PropSniper
              </p>
              <p className="text-sm text-slate-300">Wholesaling operating system</p>
            </div>
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#platform" className="nav-link-luxe text-sm text-slate-300 transition hover:text-white">
              Platform
            </a>
            <a href="#comparison" className="nav-link-luxe text-sm text-slate-300 transition hover:text-white">
              Why It Wins
            </a>
            <a href="#reviews" className="nav-link-luxe text-sm text-slate-300 transition hover:text-white">
              Reviews
            </a>
            <a href="#pricing" className="nav-link-luxe text-sm text-slate-300 transition hover:text-white">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-flex"
            >
              Login
            </a>
            <a
              href="/signup"
              className="rounded-xl bg-[linear-gradient(135deg,#e9d39a,#d7b56f)] px-4 py-2.5 text-sm font-semibold text-[#10151f] shadow-[0_18px_34px_rgba(215,181,111,0.18)] transition hover:translate-y-[-1px] hover:opacity-95"
            >
              Start Free Workflow
            </a>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-28 lg:pt-20">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-fuchsia-200">
              Built for acquisitions, dispositions, and investor teams
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Run your wholesale business like a serious operator.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              PropSniper gives wholesalers the lead engine, motivation context, deal
              control, team workflow, and buyer visibility needed to compete with the
              biggest names in the space without inheriting their clutter.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/signup"
                className="rounded-2xl bg-[linear-gradient(135deg,#9333ea,#6d28d9)] px-6 py-4 text-center text-sm font-semibold text-white shadow-[0_24px_44px_rgba(147,51,234,0.28)] transition hover:translate-y-[-1px]"
              >
                Start for $29/month
              </a>
              <a
                href="#platform"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore the platform
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <TrustPill text="Lead sourcing + scoring" />
              <TrustPill text="Tasks + ownership" />
              <TrustPill text="Buyer matching" />
              <TrustPill text="Manager visibility" />
            </div>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              {operatingStats.map((stat) => (
                <MiniStat key={stat.label} value={stat.value} label={stat.label} subtext={stat.subtext} />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-fuchsia-500/12 blur-3xl" />
            <div className="absolute -right-8 top-28 h-44 w-44 rounded-full bg-violet-500/14 blur-3xl" />

            <div className="luxe-panel-strong edge-glow hover-float relative rounded-[34px] p-4 xleads-vibe">
              <div className="sheen rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#0a0b13,#111126)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-violet-200/60">
                      Live Command Center
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">Acquisitions + Dispo</h2>
                  </div>
                  <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
                    Team view active
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <DashboardCard title="Hot Leads" value="67" sub="Ranked by score + urgency" />
                  <DashboardCard title="Open Tasks" value="29" sub="Across acquisitions team" />
                  <DashboardCard title="Buyer Matches" value="18" sub="Ready for dispo review" />
                  <DashboardCard title="Under Contract" value="12" sub="Pushed toward close" />
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Lead Spotlight</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          5039 Galahad Dr • San Antonio, TX
                        </p>
                      </div>
                      <span className="rounded-full border border-amber-400/20 bg-amber-500/12 px-3 py-1 text-xs font-semibold text-amber-300">
                        Negotiating
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MetricBox label="ARV" value="$265,000" />
                      <MetricBox label="Target Offer" value="$184,000" />
                      <MetricBox label="Repairs" value="$18,000" />
                      <MetricBox label="Spread" value="$63,000" />
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-[#06101b] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm text-slate-300">AI conviction</p>
                        <p className="text-sm font-semibold text-emerald-300">
                          84 • Strong deal
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[84%] rounded-full bg-[linear-gradient(90deg,#4ade80,#d7bf7c)]" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        High equity, absentee ownership, dated interior photos, and motivated pricing relative to ARV.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ActionCard
                      eyebrow="Workflow"
                      title="Seller follow-up due today"
                      text="Call, text, and note history are visible before the rep touches the lead."
                    />
                    <ActionCard
                      eyebrow="Disposition"
                      title="Top buyer matches queued"
                      text="Once the contract is live, the buyer shortlist is already in place."
                    />
                    <ActionCard
                      eyebrow="Management"
                      title="Rep load and overdue risk"
                      text="Managers can see where deals are stalling and coach before momentum slips."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm uppercase tracking-[0.18em] text-slate-400">
            <span>Source better leads</span>
            <span>Run tighter follow-up</span>
            <span>Underwrite faster</span>
            <span>Move cleaner to dispo</span>
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#d7bf7c]">
            Platform
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            A premium wholesaling workflow, not a patchwork stack
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Built to feel closer to a serious operating system for acquisitions teams than a simple lead tracker.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featurePillars.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#d7bf7c]/20"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1522] text-2xl text-[#ead9a8]">
                  {feature.icon}
                </div>
                <span className="text-sm text-slate-500">0{index + 1}</span>
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="comparison" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#d7bf7c]">
              Why it wins
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
              Compete with the big players without copying their clutter
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              The goal is not just to look polished. The goal is to make wholesaling execution clearer, faster, and more accountable from first lead to final blast.
            </p>

            <div className="mt-8 space-y-4">
              <WhyRow
                title="One lead workspace"
                text="Motivation, underwriting, tasks, notes, outreach, and buyer angle all live in the same place."
              />
              <WhyRow
                title="Operator-grade UI"
                text="Designed to feel focused and premium so the platform looks trustworthy to serious investors and teams."
              />
              <WhyRow
                title="Built for scale"
                text="Solo users can start lean, then grow into rep ownership, manager views, and real team workflow."
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#091321] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-5">
            <div className="overflow-hidden rounded-[26px] border border-white/10">
              <div className="grid grid-cols-[1.1fr_0.95fr_0.95fr] bg-[#0e1826] px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <div>Category</div>
                <div className="text-center text-[#ead9a8]">PropSniper</div>
                <div className="text-center">Typical legacy stack</div>
              </div>

              {comparison.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.1fr_0.95fr_0.95fr] gap-4 border-t border-white/10 bg-[#091321] px-5 py-5"
                >
                  <div className="text-sm font-medium text-white">{row.label}</div>
                  <div className="text-sm leading-6 text-slate-200">{row.propsniper}</div>
                  <div className="text-sm leading-6 text-slate-400">{row.legacy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#d7bf7c]">
            Operator Feedback
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Testimonials that sound like real acquisition floors
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            The social proof here is written to feel more credible, more specific, and closer to how wholesalers actually talk about workflow wins.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0c1522] text-sm font-semibold text-[#ead9a8]">
                    {review.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{review.name}</p>
                    <p className="text-sm text-slate-400">{review.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Market
                  </p>
                  <p className="text-sm text-slate-300">{review.market}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-1 text-[#e4c97a]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              <p className="mt-5 text-lg leading-8 text-slate-100">“{review.review}”</p>

              <div className="mt-6 rounded-2xl border border-[#d7bf7c]/14 bg-[#0a1320] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reported result</p>
                <p className="mt-2 text-sm font-semibold text-[#ead9a8]">{review.result}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#d7bf7c]">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Start lean, then scale into a real team system
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Built to feel premium from day one without forcing a huge team price before the workflow is proven.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="rounded-full border border-[#d7bf7c]/20 bg-[#d7bf7c]/10 px-5 py-2 text-sm font-medium text-[#ead9a8]">
            Starter $29/month • Pro $79/month • Team $149/month
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[32px] border p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-7 ${
                plan.highlighted
                  ? "border-[#d7bf7c]/25 bg-[linear-gradient(180deg,rgba(233,211,154,0.12),rgba(16,21,31,0.6))]"
                  : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    plan.highlighted
                      ? "bg-[#d7bf7c]/14 text-[#ead9a8] ring-1 ring-[#d7bf7c]/18"
                      : "bg-white/5 text-slate-300 ring-1 ring-white/10"
                  }`}
                >
                  {plan.badge}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#091321] p-5 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Monthly price</p>
                <div className="mt-3 flex items-end justify-center gap-2">
                  <span className="text-6xl font-semibold tracking-[-0.04em] text-white">
                    {plan.price}
                  </span>
                  <span className="pb-2 text-slate-400">{plan.period}</span>
                </div>
              </div>

              <p className="mt-5 min-h-[112px] leading-7 text-slate-300">{plan.description}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <PricingLine key={feature} text={feature} />
                ))}
              </div>

              <a
                href="/signup"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-[linear-gradient(135deg,#e9d39a,#d7b56f)] text-[#10151f] hover:translate-y-[-1px]"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 PropSniper. Built for serious wholesaling workflow.</p>
          <div className="flex flex-wrap gap-5">
            <a href="#" className="transition hover:text-white">
              Terms
            </a>
            <a href="#" className="transition hover:text-white">
              Privacy
            </a>
            <a href="#" className="transition hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function TrustPill({ text }: { text: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      {text}
    </div>
  );
}

function MiniStat({
  value,
  label,
  subtext,
}: {
  value: string;
  label: string;
  subtext: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4">
      <p className="text-3xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-2 text-sm font-medium text-slate-200">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{subtext}</p>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{sub}</p>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function ActionCard({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
      <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">{eyebrow}</p>
      <p className="mt-2 text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function WhyRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#091321] p-5">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function PricingLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#d7bf7c]/12 text-sm text-[#ead9a8] ring-1 ring-[#d7bf7c]/18">
        ✓
      </span>
      <span className="text-sm text-slate-200">{text}</span>
    </div>
  );
}
