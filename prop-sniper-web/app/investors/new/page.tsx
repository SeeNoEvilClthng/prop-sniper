import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import NewInvestorForm from '@/components/NewInvestorForm'

export default async function NewInvestorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AppShell
      title="Add Investor"
      subtitle="Save a buyer or company to your investor database."
    >
      <div className="max-w-3xl rounded-2xl border bg-white p-6">
        <NewInvestorForm />
      </div>
    </AppShell>
  )
}