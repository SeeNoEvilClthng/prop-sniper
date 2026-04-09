import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

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

export default async function LeadDetailsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) notFound()

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lead Details</h1>

        <div className="flex gap-3">
          <Link
            href={`/dashboard/${lead.id}/edit`}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            Edit
          </Link>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2">
            Back
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-xl border p-6">
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium">{lead.address}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div><p className="text-sm text-gray-500">City</p><p>{lead.city || '—'}</p></div>
          <div><p className="text-sm text-gray-500">State</p><p>{lead.state || '—'}</p></div>
          <div><p className="text-sm text-gray-500">Status</p><p>{lead.status || 'New'}</p></div>
          <div><p className="text-sm text-gray-500">Follow Up Date</p><p>{lead.follow_up_date || 'None'}</p></div>
          <div><p className="text-sm text-gray-500">Motivation Score</p><p>{lead.motivation_score ?? '—'}</p></div>
          <div><p className="text-sm text-gray-500">Motivation Label</p><p>{lead.motivation_label || '—'}</p></div>
          <div><p className="text-sm text-gray-500">Years Owned</p><p>{lead.years_owned ?? '—'}</p></div>
          <div><p className="text-sm text-gray-500">Property Age</p><p>{lead.property_age ?? '—'}</p></div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500">Motivation Signals</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {lead.is_absentee_owner && badge('Absentee Owner', 'bg-blue-100 text-blue-700')}
            {lead.owner_occupied && badge('Owner Occupied', 'bg-green-100 text-green-700')}
            {lead.long_term_owner && badge('Long-Term Owner', 'bg-gray-100 text-gray-700')}
            {lead.senior_owner_likely && badge('Senior Owner Likely', 'bg-orange-100 text-orange-700')}
            {lead.likely_distressed && badge('Possible Distress', 'bg-red-100 text-red-700')}
            {lead.preforeclosure && badge('Preforeclosure', 'bg-red-200 text-red-800')}
            {(lead.property_age || 0) >= 40 && badge('Older Property', 'bg-purple-100 text-purple-700')}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500">Why it scored this way</p>
          <p className="mt-2 whitespace-pre-wrap">
            {lead.motivation_reasons || 'No motivation reasons stored yet'}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="mt-2 whitespace-pre-wrap">{lead.notes || 'No notes yet'}</p>
        </div>
      </div>
    </main>
  )
}