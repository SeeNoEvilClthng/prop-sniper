import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
      <div className="max-w-3xl rounded-2xl border bg-white p-6">
        <NewInvestorForm />
      </div>
  )
}
