import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { getBuyerMatch } from '@/lib/buyer-matching'

type Props = {
  params: Promise<{ id: string }>
}

function badge(text: string, className: string) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {text}
    </span>
  )
}

function ratingBadgeClass(rating: string | null) {
  if (rating === 'Hot') return 'bg-red-600 text-white'
  if (rating === 'Strong') return 'bg-orange-500 text-white'
  if (rating === 'Good') return 'bg-blue-600 text-white'
  if (rating === 'Fair') return 'bg-gray-600 text-white'
  return 'bg-black text-white'
}

function matchBadgeClass(label: string) {
  if (label === 'Best Buyer Match') return 'bg-red-100 text-red-700'
  if (label === 'Strong Fit') return 'bg-orange-100 text-orange-700'
  if (label === 'Likely Fit') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

export default async function LeadDetailsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !lead) {
    notFound()
  }

  const { data: investors } = await supabase
    .from('investors')
    .select('*')
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false })

  const buyerMatches =
    (investors || [])
      .map((investor) => ({
        investor,
        match: getBuyerMatch(lead, investor),
      }))
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 8)

  return (
    <AppShell
      title="Lead Details"
      subtitle="Review property intelligence, motivation, and best buyer matches."
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/${lead.id}/edit`}
          className="rounded-xl bg-black px-4 py-2 font-semibold shadow-md"
          style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
        >
          Edit Lead
        </Link>

        <Link href="/dashboard" className="rounded-xl border px-4 py-2">
          Back
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border bg-white p-6">
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{lead.address}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div><p className="text-sm text-gray-500">City</p><p>{lead.city || '—'}</p></div>
            <div><p className="text-sm text-gray-500">State</p><p>{lead.state || '—'}</p></div>
            <div><p className="text-sm text-gray-500">ZIP Code</p><p>{lead.zip_code || '—'}</p></div>
            <div><p className="text-sm text-gray-500">Status</p><p>{lead.status || 'New'}</p></div>
            <div><p className="text-sm text-gray-500">Follow Up Date</p><p>{lead.follow_up_date || 'None'}</p></div>
            <div><p className="text-sm text-gray-500">Estimated Value</p><p>{lead.estimated_value ? `$${Number(lead.estimated_value).toLocaleString()}` : 'Not available'}</p></div>
            <div><p className="text-sm text-gray-500">Bedrooms</p><p>{lead.bedrooms ?? '—'}</p></div>
            <div><p className="text-sm text-gray-500">Bathrooms</p><p>{lead.bathrooms ?? '—'}</p></div>
          </div>

          <div className="mt-6 rounded-xl border bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Lead Score</p>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl font-bold">{lead.lead_score ?? '—'}</span>

              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ratingBadgeClass(lead.lead_rating)}`}>
                {lead.lead_rating || 'Unrated'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {lead.lead_signals
                ?.split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
                .map((signal: string) => (
                  <span
                    key={signal}
                    className="rounded-full border px-3 py-1 text-xs"
                  >
                    {signal}
                  </span>
                ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500">Motivation Signals</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.is_absentee_owner &&
                badge('Absentee Owner', 'bg-blue-100 text-blue-700')}
              {lead.owner_occupied &&
                badge('Owner Occupied', 'bg-green-100 text-green-700')}
              {lead.long_term_owner &&
                badge('Long-Term Owner', 'bg-gray-100 text-gray-700')}
              {lead.senior_owner_likely &&
                badge('Senior Owner Likely', 'bg-orange-100 text-orange-700')}
              {lead.likely_distressed &&
                badge('Possible Distress', 'bg-red-100 text-red-700')}
              {(lead.property_age || 0) >= 40 &&
                badge('Older Property', 'bg-purple-100 text-purple-700')}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="mt-2 whitespace-pre-wrap">{lead.notes || 'No notes yet'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-semibold">Property Intelligence</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p>{lead.owner_name || 'Not available'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Owner Type</p>
                <p>{lead.owner_type || 'Not available'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Years Owned</p>
                <p>{lead.years_owned ?? 'Not available'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Last Sale Date</p>
                <p>{lead.last_sale_date || 'Not available'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Property Age</p>
                <p>{lead.property_age ?? 'Not available'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-semibold">Contact Panel</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ready for owner outreach data.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{lead.owner_phone || 'Not available yet'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{lead.owner_email || 'Not available yet'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                disabled={!lead.owner_phone}
                className="rounded-xl bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Call Owner
              </button>

              <button
                disabled={!lead.owner_phone}
                className="rounded-xl border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Text Owner
              </button>

              <button
                disabled={!lead.owner_email}
                className="rounded-xl border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Email Owner
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Best Buyer Matches</h2>
            <p className="mt-1 text-sm text-gray-600">
              Investors that best fit this lead based on market, price, and buy box.
            </p>
          </div>

          <Link
            href="/investors/new"
            className="rounded-xl bg-black px-4 py-2 font-semibold shadow-md"
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
          >
            Add Investor
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {buyerMatches.length === 0 && (
            <div className="rounded-xl border p-4">
              <p className="text-sm text-gray-600">No investors found yet.</p>
            </div>
          )}

          {buyerMatches.map(({ investor, match }) => (
            <Link
              key={investor.id}
              href={`/investors/${investor.id}`}
              className="block rounded-xl border p-5 hover:bg-gray-50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{investor.company_name}</h3>

                  {investor.has_contact === false && (
                    <span className="mt-1 inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold">
                      Market Buyer (No Contact)
                    </span>
                  )}

                  {investor.has_contact === true && (
                    <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Your Buyer
                    </span>
                  )}

                  <p className="mt-2 text-sm text-gray-600">
                    {investor.contact_name || 'No contact name'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${matchBadgeClass(match.label)}`}>
                    {match.label}
                  </span>
                  <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                    Match {match.score}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <strong>Phone:</strong> {investor.phone || '—'}
                </div>
                <div>
                  <strong>Email:</strong> {investor.email || '—'}
                </div>
                <div>
                  <strong>Max Price:</strong>{' '}
                  {investor.max_price != null
                    ? `$${Number(investor.max_price).toLocaleString()}`
                    : '—'}
                </div>
              </div>

              <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <strong>Markets:</strong> {investor.markets || '—'}
                </div>
                <div>
                  <strong>Property Types:</strong> {investor.property_types || '—'}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {match.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border px-3 py-1 text-xs"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}