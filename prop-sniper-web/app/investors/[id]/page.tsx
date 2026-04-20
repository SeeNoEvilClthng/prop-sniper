import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { getBuyerMatch } from '@/lib/buyer-matching'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ id: string }>
}

function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(Number(value))) return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function getBuyerTypeClasses(type?: string | null) {
  const value = (type || '').toLowerCase()

  if (value.includes('cash')) return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30'
  if (value.includes('flipper')) return 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30'
  if (value.includes('landlord')) return 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
  if (value.includes('hedge')) return 'bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30'
  return 'bg-white/10 text-slate-200 ring-1 ring-white/10'
}

function getLeadRatingClasses(rating?: string | null) {
  switch (rating) {
    case 'Hot':
      return 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
    case 'Strong':
      return 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30'
    case 'Good':
      return 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
    case 'Fair':
      return 'bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30'
    default:
      return 'bg-white/10 text-slate-200 ring-1 ring-white/10'
  }
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

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('lead_score', { ascending: false, nullsFirst: false })
    .limit(25)

  const matchedLeads = (leads || [])
    .map((lead) => ({
      lead,
      match: getBuyerMatch(lead, investor),
    }))
    .filter((item) => item.match.score >= 35)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 10)

  return (
    <main className="text-white">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.30)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Link
                href="/investors"
                className="text-sm font-medium text-[#ead9a8] transition hover:text-white"
              >
                Back to Investors
              </Link>

              <p className="mt-4 text-[11px] uppercase tracking-[0.34em] text-[#d7bf7c]">
                Buyer Profile
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">
                {investor.company_name || investor.contact_name || 'Unnamed investor'}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getBuyerTypeClasses(
                    investor.buyer_type
                  )}`}
                >
                  {investor.buyer_type || 'Buyer'}
                </span>
                {investor.has_contact ? (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                    Contactable buyer
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-500/15 px-3 py-1 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-400/30">
                    Market-only profile
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/investors/${investor.id}/edit`}
                className="rounded-2xl bg-[linear-gradient(135deg,#e9d39a,#d7b56f)] px-5 py-3 text-sm font-semibold text-[#10151f] transition hover:translate-y-[-1px]"
              >
                Edit Investor
              </Link>
              <Link
                href="/leads"
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Open Queue
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <section className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">Investor Info</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Contact</p>
                  <p className="mt-2 font-medium text-white">{investor.contact_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">State</p>
                  <p className="mt-2 font-medium text-white">{investor.state || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                  <p className="mt-2 font-medium text-white">{investor.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</p>
                  <p className="mt-2 font-medium text-white">{investor.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Markets</p>
                  <p className="mt-2 font-medium text-white">{investor.markets || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Max Price</p>
                  <p className="mt-2 font-medium text-white">{formatMoney(investor.max_price)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Buy Box</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {investor.buy_box || 'No buy box listed.'}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Notes</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {investor.notes || 'No notes saved.'}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">Best Lead Matches</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              These are the best current deals for this buyer based on market, price, and profile fit.
            </p>

            <div className="mt-5 space-y-4">
              {matchedLeads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1727] p-5 text-sm text-slate-400">
                  No strong lead matches found yet.
                </div>
              ) : (
                matchedLeads.map(({ lead, match }) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/${lead.id}`}
                    className="block rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] p-5 transition hover:bg-[#101b2d]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{lead.address}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {lead.city}, {lead.state}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getLeadRatingClasses(
                            lead.lead_rating
                          )}`}
                        >
                          {lead.lead_rating || 'Unrated'}
                        </span>
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                          Match {match.score}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <strong>Lead Score:</strong> {lead.lead_score ?? '—'}
                      </div>
                      <div>
                        <strong>Estimated Value:</strong> {formatMoney(lead.estimated_value)}
                      </div>
                      <div>
                        <strong>Target Offer:</strong> {formatMoney(lead.target_offer)}
                      </div>
                    </div>

                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {match.label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {match.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
