import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-3xl">
      git add .
<h1 className="text-5xl font-bold tracking-tight text-black">
  Find off-market deals before anyone else
</h1>

<p className="mt-5 text-lg text-gray-600">
  Search cities, identify motivated sellers, and track deals in one place.
  Built for wholesalers who want more deals, faster.
</p>

        <div className="mt-8 flex flex-wrap gap-4">
        <Link
  href="/signup"
  className="inline-flex min-w-[180px] items-center justify-center rounded-xl bg-black px-6 py-3 text-base font-semibold shadow-md transition hover:bg-gray-900"
  style={{ color: '#fff', WebkitTextFillColor: '#fff' }}
>
  Start Finding Deals
</Link>

          <Link
            href="/dashboard"
            className="inline-flex min-w-[180px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-gray-100"
          >
            View Demo
          </Link>

          <Link
            href="/login"
            className="inline-flex min-w-[140px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-gray-100"
          >
            Log in
          </Link>
        </div>
        <p className="mt-3 text-sm text-gray-500">
  No credit card required. Start finding deals in seconds.
</p>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold text-black">Map lead capture</h2>
          <p className="mt-2 text-sm text-gray-600">
            Search addresses or click the map and save leads fast.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold text-black">Daily follow-ups</h2>
          <p className="mt-2 text-sm text-gray-600">
            See what needs action today without digging through notes.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold text-black">Simple pipeline</h2>
          <p className="mt-2 text-sm text-gray-600">
            Track new, contacted, negotiating, and under-contract leads in one place.
          </p>
        </div>
      </div>
    </main>
  )
}