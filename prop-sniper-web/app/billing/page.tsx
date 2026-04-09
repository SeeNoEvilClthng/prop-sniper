import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import UpgradeButton from '@/components/UpgradeButton'

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <AppShell
      title="Billing"
      subtitle="Upgrade when you’re ready to unlock unlimited leads."
    >
      <div className="max-w-3xl rounded-2xl border bg-white p-6">
        <h2 className="text-2xl font-semibold">PropSniper Pro</h2>
        <p className="mt-2 text-gray-600">$29/month</p>

        <ul className="mt-5 space-y-2 text-sm text-gray-700">
          <li>Unlimited leads</li>
          <li>Map lead capture</li>
          <li>Lead filtering</li>
          <li>Notes and follow-ups</li>
        </ul>

        <div className="mt-6 text-sm">
          <p>Status: {subscription?.status || 'inactive'}</p>
          <p>Plan: {subscription?.plan || 'free'}</p>
        </div>

        <div className="mt-6">
          <UpgradeButton />
        </div>
      </div>
    </AppShell>
  )
}