import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
<AppShell>
  <div className="max-w-3xl rounded-2xl border bg-white p-6">
    <h1 className="text-2xl font-semibold">Billing</h1>
    <p className="mt-2 text-sm text-gray-600">
      Upgrade when you’re ready to unlock unlimited leads.
    </p>

    <ul className="mt-5 space-y-2 text-sm text-gray-600">
      <li>Unlimited leads</li>
      <li>Map lead capture</li>
      <li>Lead filtering</li>
      <li>Notes and follow-ups</li>
    </ul>
  </div>
</AppShell>
  )
}
