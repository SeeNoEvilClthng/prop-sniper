import Link from "next/link";
import { menuSections } from "../menuData";

type DynamicPageProps = {
  params: {
    slug: string[];
  };
};

type PageInfo = {
  title: string;
  description: string;
  section: string;
  icon: string;
};

function findPageInfo(pathname: string): PageInfo | null {
  for (const section of menuSections) {
    for (const item of section.items) {
      if (item.href === pathname) {
        return {
          title: item.label,
          description: item.description,
          section: section.title,
          icon: item.icon,
        };
      }
    }
  }

  if (pathname === "/dashboard/analyzer") {
    return {
      title: "Deal Analyzer",
      description: "Review ARV, repairs, spread, and deal strength.",
      section: "Analytics",
      icon: "📈",
    };
  }

  if (pathname === "/dashboard/map") {
    return {
      title: "Map View",
      description: "See saved properties and lead opportunities on a map.",
      section: "Tools",
      icon: "🗺️",
    };
  }

  return null;
}

const exampleCards = [
  {
    title: "Ready for buildout",
    text: "This page is already routed and connected to your dashboard menu.",
  },
  {
    title: "Looks like a real platform",
    text: "Every menu item now opens its own screen instead of doing nothing.",
  },
  {
    title: "Easy to upgrade later",
    text: "You can swap the fake content here for Supabase, Mapbox, Twilio, or AI later.",
  },
];

export default function DynamicDashboardPage({ params }: DynamicPageProps) {
  const pathname = `/dashboard/${params.slug.join("/")}`;
  const pageInfo = findPageInfo(pathname);

  if (!pageInfo) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-300">
              Page not found
            </p>
            <h1 className="mt-4 text-4xl font-bold">This route does not exist yet</h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              The page you tried to open is not in your menu setup right now.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_25%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Home
          </Link>
        </div>

        <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200">
                {pageInfo.section}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-[#0d1727] text-3xl">
                  {pageInfo.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold sm:text-4xl">
                    {pageInfo.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-slate-300">
                    {pageInfo.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Route is working
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {exampleCards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-white/10 bg-[#0d1727] p-5"
              >
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-[#0d1727] p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Page Preview
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white">
                {pageInfo.title} Module
              </h2>
              <p className="mt-3 text-slate-300">
                This is a starter screen for this section. Later you can replace
                this with real app features.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Ready to customize
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Next Step
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Connect real data
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0d1727] p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Quick Actions
              </p>

              <div className="mt-4 grid gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 text-center text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Go back to Dashboard
                </Link>
                <Link
                  href="/dashboard/tools/import"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Open Import Tools
                </Link>
                <Link
                  href="/dashboard/analyzer"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Open Deal Analyzer
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}