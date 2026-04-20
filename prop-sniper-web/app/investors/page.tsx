import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

type Props = {
  searchParams?: Promise<{
    search?: string
    state?: string
    buyer_type?: string
    contact?: string
  }>
}

type InvestorRecord = {
  id: string
  company_name?: string | null
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  state?: string | null
  markets?: string | null
  buy_box?: string | null
  property_types?: string | null
  buyer_type?: string | null
  max_price?: number | null
  notes?: string | null
  has_contact?: boolean | null
  is_public?: boolean | null
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

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string
  value: string
  subtext: string
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{subtext}</p>
    </div>
  )
}

export default async function InvestorsPage({ searchParams }: Props) {
  const params = (await searchParams) || {}
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let query = supabase
    .from('investors')
    .select('*')
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.or(
      `company_name.ilike.%${params.search}%,contact_name.ilike.%${params.search}%,markets.ilike.%${params.search}%,buy_box.ilike.%${params.search}%`
    )
  }

  if (params.state) {
    query = query.ilike('state', `%${params.state}%`)
  }

  if (params.buyer_type && params.buyer_type !== 'All') {
    query = query.eq('buyer_type', params.buyer_type)
  }

  const { data } = await query

  const contactFilter = params.contact || 'All'

  const investors = ((data || []) as InvestorRecord[]).filter((investor) => {
    if (contactFilter === 'With Contact') return investor.has_contact === true
    if (contactFilter === 'Market Only') return investor.has_contact === false
    return true
  })

  const totalInvestors = investors.length
  const contactableBuyers = investors.filter((investor) => investor.has_contact).length
  const cashBuyers = investors.filter((investor) =>
    (investor.buyer_type || '').toLowerCase().includes('cash')
  ).length
  const publicMarketBuyers = investors.filter((investor) => investor.is_public).length

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_22%),linear-gradient(to_bottom,#08111c,#07111f,#050b14)]" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
                Buyer CRM
              </p>
              <h1 className="mt-2 text-3xl font-bold">Investor Database</h1>
              <p className="mt-2 max-w-3xl text-slate-300">
                Organize your buyer list, track who is contactable, and keep your
                dispo side ready when a deal is ready to move.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/investors/new"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Add Investor
              </Link>
              <Link
                href="/leads"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open Queue
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Visible Buyers"
            value={String(totalInvestors)}
            subtext="Current CRM view"
          />
          <StatCard
            label="Contactable"
            value={String(contactableBuyers)}
            subtext="Ready for dispo outreach"
          />
          <StatCard
            label="Cash Buyers"
            value={String(cashBuyers)}
            subtext="High-value dispo targets"
          />
          <StatCard
            label="Market Buyers"
            value={String(publicMarketBuyers)}
            subtext="Research or shared profiles"
          />
        </section>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">Buyer Filters</h2>
          <p className="mt-2 text-slate-300">
            Search by market, buyer type, or buy-box language.
          </p>

          <form className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_0.8fr_0.9fr_0.9fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Search</label>
              <input
                name="search"
                defaultValue={params.search || ''}
                placeholder="Company, contact, market, buy box"
                className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">State</label>
              <input
                name="state"
                defaultValue={params.state || ''}
                placeholder="AZ"
                className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Buyer Type</label>
              <select
                name="buyer_type"
                defaultValue={params.buyer_type || 'All'}
                className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-sky-400/40"
              >
                <option>All</option>
                <option>Cash Buyer</option>
                <option>Flipper</option>
                <option>Landlord</option>
                <option>Hedge Fund</option>
                <option>JV Buyer</option>
                <option>Lender</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Contact Status</label>
              <select
                name="contact"
                defaultValue={contactFilter}
                className="w-full rounded-2xl border border-white/10 bg-[#0d1727] px-4 py-3 text-white outline-none transition focus:border-sky-400/40"
              >
                <option>All</option>
                <option>With Contact</option>
                <option>Market Only</option>
              </select>
            </div>

            <div className="flex gap-3 lg:justify-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white lg:w-auto"
              >
                Apply
              </button>
              <Link
                href="/investors"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 lg:w-auto"
              >
                Reset
              </Link>
            </div>
          </form>
        </section>

        <section className="mt-6 space-y-4">
          {investors.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-white/10 bg-[#0d1727] p-10 text-center text-slate-400">
              No investors match the current filters.
            </div>
          ) : (
            investors.map((investor) => (
              <Link
                key={investor.id}
                href={`/investors/${investor.id}`}
                className="block rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:border-sky-400/20 hover:bg-white/[0.06]"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">
                        {investor.company_name || investor.contact_name || 'Unnamed investor'}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getBuyerTypeClasses(
                          investor.buyer_type
                        )}`}
                      >
                        {investor.buyer_type || 'Buyer'}
                      </span>

                      {investor.has_contact === true ? (
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                          Contactable
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-500/15 px-3 py-1 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-400/30">
                          Market Profile
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-slate-300">
                      {investor.contact_name || 'No contact name'} • {investor.state || 'No state'}
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Buy Box</p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {investor.buy_box || 'No buy box listed.'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#0d1727] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Notes</p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {investor.notes || 'No notes saved.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  )
}
