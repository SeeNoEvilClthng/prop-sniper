import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
  }

  return (
    <AppShell
      title="Dashboard"
      subtitle="Track your leads, follow-ups, and strongest opportunities."
    >
      <div className="flex flex-wrap gap-3">
    <Link
  href="/dashboard/new"
  className="rounded-xl bg-black px-4 py-2 font-semibold shadow-md"
  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
>
  Add Lead
</Link>

        <Link href="/map" className="rounded-xl border px-4 py-2">
          Open Map
        </Link>

        <Link href="/finder" className="rounded-xl border px-4 py-2">
          City Finder
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="mt-2 text-3xl font-bold">{leads?.length || 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Hot / Strong Leads</p>
          <p className="mt-2 text-3xl font-bold">
            {(leads || []).filter(
              (lead) => lead.lead_rating === 'Hot' || lead.lead_rating === 'Strong'
            ).length}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Under Contract</p>
          <p className="mt-2 text-3xl font-bold">
            {(leads || []).filter((lead) => lead.status === 'Under Contract').length}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {!leads?.length && (
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-600">No leads yet.</p>
          </div>
        )}

        {leads?.map((lead) => (
          <Link
            key={lead.id}
            href={`/dashboard/${lead.id}`}
            className="block rounded-2xl border bg-white p-5 hover:bg-gray-50"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{lead.address}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {lead.city || 'Unknown city'}, {lead.state || 'Unknown state'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {lead.lead_rating && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
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

                <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                  Score {lead.lead_score ?? '—'}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <strong>Status:</strong> {lead.status || 'New'}
              </div>
              <div>
                <strong>Follow up:</strong> {lead.follow_up_date || 'None'}
              </div>
              <div>
                <strong>Estimated Value:</strong>{' '}
                {lead.estimated_value
                  ? `$${Number(lead.estimated_value).toLocaleString()}`
                  : '—'}
              </div>
            </div>

            {lead.lead_signals && (
              <div className="mt-3 flex flex-wrap gap-2">
                {lead.lead_signals
                  .split(',')
                  .map((signal: string) => signal.trim())
                  .filter(Boolean)
                  .slice(0, 5)
                  .map((signal: string) => (
                    <span
                      key={signal}
                      className="rounded-full border px-2 py-1 text-xs"
                    >
                      {signal}
                    </span>
                  ))}
              </div>
            )}

            <p className="mt-3 text-sm text-gray-700">
              <strong>Notes:</strong> {lead.notes || 'No notes yet'}
            </p>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}