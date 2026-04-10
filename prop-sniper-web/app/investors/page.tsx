import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'

type Props = {
  searchParams?: Promise<{
    search?: string
    state?: string
    buyer_type?: string
  }>
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
      `company_name.ilike.%${params.search}%,contact_name.ilike.%${params.search}%,markets.ilike.%${params.search}%`
    )
  }

  if (params.state) {
    query = query.ilike('state', `%${params.state}%`)
  }

  if (params.buyer_type && params.buyer_type !== 'All') {
    query = query.eq('buyer_type', params.buyer_type)
  }

  const { data: investors } = await query

  return (
    <AppShell
      title="Investors"
      subtitle="Build and manage your buyers list."
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href="/investors/new"
          className="rounded-xl bg-black px-4 py-2 font-semibold shadow-md"
          style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
        >
          Add Investor
        </Link>
      </div>

      <form className="mt-6 grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Search</label>
          <input
            name="search"
            defaultValue={params.search || ''}
            placeholder="Company, contact, market"
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">State</label>
          <input
            name="state"
            defaultValue={params.state || ''}
            placeholder="AZ"
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Buyer Type</label>
          <select
            name="buyer_type"
            defaultValue={params.buyer_type || 'All'}
            className="w-full rounded-xl border p-3"
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

        <div className="md:col-span-3 flex gap-3">
          <button className="rounded-xl bg-black px-5 py-3 text-white">
            Apply Filters
          </button>
          <Link href="/investors" className="rounded-xl border px-5 py-3">
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {investors?.length === 0 && (
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-600">No investors saved yet.</p>
          </div>
        )}

        {investors?.map((investor) => (
          <Link
            key={investor.id}
            href={`/investors/${investor.id}`}
            className="block rounded-2xl border bg-white p-5 hover:bg-gray-50"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{investor.company_name}</h2>

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

              {investor.buyer_type && (
                <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                  {investor.buyer_type}
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <strong>Phone:</strong> {investor.phone || '—'}
              </div>
              <div>
                <strong>Email:</strong> {investor.email || '—'}
              </div>
              <div>
                <strong>State:</strong> {investor.state || '—'}
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-700">
              <strong>Markets:</strong> {investor.markets || 'No markets listed'}
            </p>

            <p className="mt-2 text-sm text-gray-700">
              <strong>Buy Box:</strong> {investor.buy_box || 'No buy box listed'}
            </p>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}