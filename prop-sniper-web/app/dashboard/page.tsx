import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type Props = {
  searchParams?: Promise<{
    status?: string
    city?: string
  }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = (await searchParams) || {}
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'All') {
    query = query.eq('status', params.status)
  }

  if (params.city) {
    query = query.ilike('city', `%${params.city}%`)
  }

  const { data: leads } = await query

  const today = new Date().toISOString().split('T')[0]

  const { data: dueToday } = await supabase
    .from('leads')
    .select('*')
    .eq('follow_up_date', today)
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-3">
          <Link href="/map" className="rounded-xl border px-4 py-2">
            Open Map
          </Link>
          <Link href="/billing" className="rounded-x1 border px-4 py-2">
          Billing
          </Link>
          <Link href="/dashboard/new" className="rounded-xl bg-black px-4 py-2 text-white">
            Add Lead
          </Link>
          <form action="/auth/logout" method="post">
  <button className="rounded-xl border px-4 py-2">
    Log out
  </button>
</form>
        </div>
      </div>

      <div className="mt-8 rounded-xl border p-4">
        <h2 className="text-xl font-semibold">Follow Ups Due Today</h2>
        <div className="mt-4 space-y-3">
          {dueToday?.length === 0 && (
            <p className="text-sm text-gray-600">No follow-ups due today.</p>
          )}

          {dueToday?.map((lead) => (
            <Link
              key={lead.id}
              href={`/dashboard/${lead.id}`}
              className="block rounded-xl border p-3 hover:bg-gray-50"
            >
              <p className="font-medium">{lead.address}</p>
              <p className="text-sm text-gray-600">
                {lead.city}, {lead.state}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <form className="mt-8 grid gap-4 rounded-xl border p-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue={params.status || 'All'}
            className="w-full rounded-xl border p-3"
          >
            <option>All</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Follow Up</option>
            <option>Negotiating</option>
            <option>Under Contract</option>
            <option>Dead</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">City</label>
          <input
            name="city"
            defaultValue={params.city || ''}
            placeholder="Filter by city"
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="flex items-end gap-3">
          <button type="submit" className="rounded-xl bg-black px-5 py-3 text-white">
            Filter
          </button>
          <Link href="/dashboard" className="rounded-xl border px-5 py-3">
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {leads?.length === 0 && <p>No leads found.</p>}

        {leads?.map((lead) => (
          <Link
            key={lead.id}
            href={`/dashboard/${lead.id}`}
            className="block rounded-xl border p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{lead.address}</h2>
            <p className="text-sm text-gray-600">
              {lead.city}, {lead.state}
            </p>
            <p className="mt-2 text-sm">
              <strong>Status:</strong> {lead.status || 'New'}
            </p>
            <p className="text-sm">
              <strong>Follow up:</strong> {lead.follow_up_date || 'None'}
            </p>
            <p className="mt-2 text-sm">
              <strong>Notes:</strong> {lead.notes || 'No notes yet'}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}