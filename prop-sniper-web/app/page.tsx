"use client";

const reviews = [
  {
    name: "Marcus Allen",
    role: "Wholesale Investor",
    review:
      "PropSniper helped me organize my leads way faster than the spreadsheets I was using before. The dashboard feels clean, fast, and actually helps me move deals.",
    rating: 5,
  },
  {
    name: "Jasmine Carter",
    role: "Acquisitions Manager",
    review:
      "What I liked most was being able to see deals, scores, and lead stages all in one place. It feels like a real platform, not just a tracker.",
    rating: 5,
  },
  {
    name: "Derrick Moore",
    role: "Real Estate Entrepreneur",
    review:
      "The UI looks solid, and the workflow makes sense. If you are serious about wholesaling and lead management, this is the type of app you want in your stack.",
    rating: 5,
  },
];

const features = [
  {
    title: "Smart Lead Management",
    text: "Save leads, track statuses, and organize opportunities without losing momentum.",
    icon: "📍",
  },
  {
    title: "AI Deal Scoring",
    text: "Quickly spot stronger opportunities with score-based deal analysis and better prioritization.",
    icon: "⚡",
  },
  {
    title: "Property Pipeline",
    text: "Move leads from new to contacted, follow up, negotiating, and under contract with a clean workflow.",
    icon: "📈",
  },
  {
    title: "Investor-Focused Dashboard",
    text: "See the numbers that matter most like ARV, repairs, spread, and equity in one place.",
    icon: "🏠",
  },
  {
    title: "Built for Speed",
    text: "Search, sort, and review leads faster so you can spend more time closing deals.",
    icon: "🚀",
  },
  {
    title: "Import Ready",
    text: "Built to grow into CSV imports, list stacking, skip tracing, buyer blasts, and more.",
    icon: "📂",
  },
];

const comparison = [
  {
    label: "Lead tracking",
    propsniper: true,
    oldWay: false,
  },
  {
    label: "Deal scoring",
    propsniper: true,
    oldWay: false,
  },
  {
    label: "Pipeline stages",
    propsniper: true,
    oldWay: false,
  },
  {
    label: "Fast dashboard view",
    propsniper: true,
    oldWay: false,
  },
  {
    label: "Spreadsheet-free workflow",
    propsniper: true,
    oldWay: false,
  },
];

function Check({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
        value
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
          : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
      }`}
    >
      {value ? "✓" : "✕"}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_24%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-bold shadow-lg shadow-sky-950/40">
              PS
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-200">
                PropSniper
              </p>
              <p className="text-sm text-slate-300">Real estate lead platform</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-slate-300 transition hover:text-white">
              Features
            </a>
            <a href="#why" className="text-sm text-slate-300 transition hover:text-white">
              Why PropSniper
            </a>
            <a href="#reviews" className="text-sm text-slate-300 transition hover:text-white">
              Reviews
            </a>
            <a href="#pricing" className="text-sm text-slate-300 transition hover:text-white">
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
              className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:opacity-95"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-xs font-medium text-sky-200">
              Built for wholesalers, acquisitions, and investors
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find, score, and manage real estate leads faster.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              PropSniper gives you a cleaner way to track leads, review deal numbers,
              manage your pipeline, and focus on the properties most worth chasing.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/signup"
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-center text-sm font-semibold text-white shadow-xl shadow-sky-950/30 transition hover:opacity-95"
              >
                Start Free
              </a>
              <a
                href="/dashboard"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Dashboard
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <TrustPill text="Lead Tracking" />
              <TrustPill text="AI Deal Scores" />
              <TrustPill text="Pipeline Management" />
              <TrustPill text="Investor Workflow" />
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <MiniStat value="10x" label="Cleaner workflow" />
              <MiniStat value="24/7" label="Deal visibility" />
              <MiniStat value="All-in-1" label="Lead management" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="absolute -right-10 bottom-8 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    PropSniper
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">Acquisitions Dashboard</h3>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  Live System
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DashboardCard title="Total Leads" value="248" sub="+18 this week" />
                <DashboardCard title="Strong Deals" value="67" sub="AI scored high" />
                <DashboardCard title="Potential Spread" value="$412K" sub="Across pipeline" />
                <DashboardCard title="Under Contract" value="12" sub="Moving this month" />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Lead Spotlight</p>
                    <p className="mt-1 text-xs text-slate-400">5039 Galahad Dr, San Antonio, TX</p>
                  </div>
                  <div className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-semibold text-fuchsia-300 ring-1 ring-fuchsia-400/30">
                    Negotiating
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MetricBox label="ARV" value="$265,000" />
                  <MetricBox label="Asking" value="$200,000" />
                  <MetricBox label="Repairs" value="$18,000" />
                  <MetricBox label="Equity" value="47%" />
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm text-slate-300">Deal Score</p>
                    <p className="text-sm font-semibold text-emerald-300">84 Strong</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[84%] rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <ActionCard title="Run AI Analyzer" text="Score deals faster" />
                <ActionCard title="Import Lead List" text="Upload CSV data" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-400">
            <span>Trusted by growing wholesalers</span>
            <span>Used for acquisitions workflows</span>
            <span>Built for faster deal review</span>
            <span>Made for lead-heavy teams</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-200">
            Features
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Everything you need to move deals with less mess
          </h2>
          <p className="mt-4 text-slate-300">
            PropSniper is built to help you focus on speed, organization, and better decision making.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.07]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0d1727] text-2xl">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-200">
              Why it stands out
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Stop running deals from random notes and spreadsheets
            </h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              PropSniper helps you centralize your lead workflow so you can spend less time looking for information and more time locking deals.
            </p>

            <div className="mt-8 space-y-4">
              <WhyRow
                title="One place for your lead pipeline"
                text="Keep addresses, owners, scores, statuses, and deal numbers organized in one dashboard."
              />
              <WhyRow
                title="Cleaner decisions"
                text="Review ARV, asking price, repairs, and spread without bouncing around different tools."
              />
              <WhyRow
                title="Built to grow"
                text="The structure is ready for maps, skip tracing, imports, texting, and buyer outreach."
              />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-200">
              Comparison
            </p>
            <h3 className="mt-4 text-2xl font-bold">PropSniper vs old way</h3>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] bg-[#0d1727] px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <div>Feature</div>
                <div className="text-center">PropSniper</div>
                <div className="text-center">Spreadsheets</div>
              </div>

              {comparison.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center border-t border-white/10 bg-[#0b1320] px-4 py-4"
                >
                  <div className="text-sm text-white">{row.label}</div>
                  <div className="flex justify-center">
                    <Check value={row.propsniper} />
                  </div>
                  <div className="flex justify-center">
                    <Check value={row.oldWay} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-200">
            Reviews
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            What users are saying
          </h2>
          <p className="mt-4 text-slate-300">
            Added here as sample social proof so your landing page feels more complete and convincing.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center gap-1 text-yellow-300">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="leading-7 text-slate-200">“{review.review}”</p>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="font-semibold text-white">{review.name}</p>
                <p className="text-sm text-slate-400">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="rounded-[34px] border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-violet-500/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-200">
                Start building your system
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">
                Make your app feel like a real wholesaling platform.
              </h2>
              <p className="mt-4 max-w-2xl text-slate-300">
                Use this landing page to make a stronger first impression, build trust faster, and make visitors want to try the dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/signup"
                  className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:opacity-95"
                >
                  Start Free
                </a>
                <a
                  href="/dashboard"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0d1727]/80 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Launch package
              </p>
              <h3 className="mt-3 text-3xl font-bold">$0</h3>
              <p className="mt-2 text-sm text-slate-300">
                Use this as a starter pricing card for now.
              </p>

              <div className="mt-6 space-y-3">
                <PricingLine text="Clean landing page" />
                <PricingLine text="Modern dashboard feel" />
                <PricingLine text="Fake review section" />
                <PricingLine text="Stronger conversion layout" />
                <PricingLine text="Mobile responsive sections" />
              </div>

              <a
                href="/signup"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Get Started Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 PropSniper. Built for smarter lead management.</p>
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
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
      {text}
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
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
    <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
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

function ActionCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function WhyRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-5">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function PricingLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-sm text-emerald-300 ring-1 ring-emerald-400/30">
        ✓
      </span>
      <span className="text-sm text-slate-200">{text}</span>
    </div>
  );
}