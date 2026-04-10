import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'

type Props = {
  params: Promise<{ id: string }>
}

export default async function InvestorDetailsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: investor, error } = await supabase
    .from('investors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !investor) {
    notFound()
  }

  let matchesQuery = supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('lead_score', { ascending: false, nullsFirst: false })
    .limit(5)

  if (investor.state) {
    matchesQuery = matchesQuery.ilike('state', `%${investor.state}%`)
  }

  const { data: matchedLeads } = await matchesQuery

  const filteredMatches =
    matchedLeads?.filter((lead) => {
      const markets = (investor.markets || '').toLowerCase()
      const leadCity = (lead.city || '').toLowerCase()
      const priceOk =
        !investor.max_price ||
        !lead.estimated_value ||
        Number(lead.estimated_value) <= Number(investor.max_price)

      const marketOk = !markets || !leadCity || markets.includes(leadCity)

      return priceOk && marketOk
    }) || []

  return (
    <AppShell
      title={investor.company_name}
      subtitle="Investor details and buyer matching."
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/investors/${investor.id}/edit`}
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          Edit Investor
        </Link>

        <Link href="/investors" className="rounded-xl border px-4 py-2">
          Back to Investors
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">Investor Info</h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p>{investor.company_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Contact Name</p>
              <p>{investor.contact_name || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{investor.email || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{investor.phone || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Buyer Type</p>
              <p>{investor.buyer_type || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Markets</p>
              <p>{investor.markets || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Buy Box</p>
              <p>{investor.buy_box || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Property Types</p>
              <p>{investor.property_types || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Max Price</p>
              <p>
                {investor.max_price != null
                  ? `$${Number(investor.max_price).toLocaleString()}`
                  : '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="whitespace-pre-wrap">{investor.notes || '—'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">Best Lead Matches</h2>
          <p className="mt-2 text-sm text-gray-600">
            Leads in similar markets and price range.
          </p>

          <div className="mt-5 space-y-4">
            {filteredMatches.length === 0 && (
              <p className="text-sm text-gray-600">
                No strong lead matches found yet.
              </p>
            )}

            {filteredMatches.map((lead) => (
              <Link
                key={lead.id}
                href={`/dashboard/${lead.id}`}
                className="block rounded-xl border p-4 hover:bg-gray-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{lead.address}</p>
                    <p className="text-sm text-gray-600">
                      {lead.city}, {lead.state}
                    </p>
                  </div>

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
                </div>

                <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <strong>Lead Score:</strong> {lead.lead_score ?? '—'}
                  </div>
                  <div>
                    <strong>Estimated Value:</strong>{' '}
                    {lead.estimated_value
                      ? `$${Number(lead.estimated_value).toLocaleString()}`
                      : '—'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}