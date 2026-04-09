import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold tracking-tight">
          Find, track, and manage off-market leads faster
        </h1>
        <p className="mt-5 text-lg text-gray-600">
          PropSniper is a simple map-based wholesaling CRM built for finding leads,
          tracking follow-ups, and staying organized.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-xl bg-black px-5 py-3 text-white">
            Get started
          </Link>
          <Link href="/login" className="rounded-xl border px-5 py-3">
            Log in
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Map lead capture</h2>
          <p className="mt-2 text-sm text-gray-600">
            Search addresses or click the map and save leads fast.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Daily follow-ups</h2>
          <p className="mt-2 text-sm text-gray-600">
            See what needs action today without digging through notes.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Simple pipeline</h2>
          <p className="mt-2 text-sm text-gray-600">
            Track New, Contacted, Negotiating, and Under Contract in one place.
          </p>
        </div>
      </div>
    </main>
  )
}