import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Leads", href: "/dashboard" },
  { name: "Pipeline", href: "/dashboard" },
  { name: "Buyers", href: "/dashboard" },
  { name: "AI Tools", href: "/dashboard" },
  { name: "Settings", href: "/dashboard" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/40 backdrop-blur md:block">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Prop<span className="text-cyan-400">Sniper</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Find deals faster. Close smarter.
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <p className="text-sm font-semibold text-cyan-300">Pro Tip</p>
          <p className="mt-2 text-sm text-white/70">
            Focus on absentee owners, high equity, and tired landlords first.
          </p>
        </div>
      </div>
    </aside>
  );
}