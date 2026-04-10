import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LeadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold">Leads</h1>

      <div className="mt-4 flex gap-3">
        <Link href="/map" className="rounded-xl border px-4 py-2">
          Map
        </Link>
        <Link href="/dashboard" className="rounded-xl border px-4 py-2">
          Dashboard
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {leads?.map((lead) => (
          <Link
            key={lead.id}
            href={`/dashboard/${lead.id}`}
            className="block rounded-xl border p-4 hover:bg-gray-50"
          >
            <p className="font-semibold">{lead.address}</p>

            <p className="text-sm text-gray-600">
              {lead.city}, {lead.state}
            </p>

            <p className="mt-2 text-sm">
              <strong>Status:</strong> {lead.status || 'New'}
            </p>

            <p className="mt-1 text-sm">
              <strong>Score:</strong> {lead.lead_score ?? '—'}
            </p>

            {lead.lead_rating && (
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${
                  lead.lead_rating === 'Hot'
                    ? 'bg-red-600'
                    : lead.lead_rating === 'Strong'
                    ? 'bg-orange-500'
                    : lead.lead_rating === 'Good'
                    ? 'bg-blue-600'
                    : lead.lead_rating === 'Fair'
                    ? 'bg-gray-600'
                    : 'bg-black'
                }`}
              >
                {lead.lead_rating}
              </span>
            )}
          </Link>
        ))}
      </div>
    </main>
  )
}