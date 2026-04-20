import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-20 text-white">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-300 ring-1 ring-emerald-400/30">
          ✓
        </div>

        <h1 className="mt-6 text-4xl font-bold">Trial started</h1>
        <p className="mt-4 text-slate-300">
          Your 7-day free trial is active. Unless you cancel before the trial
          ends, your plan will continue at $29/month.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-sm font-semibold text-white"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}