import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewLeadForm from '@/components/NewLeadForm'

export default async function NewLeadPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-2xl font-bold">Add Lead</h1>
      <NewLeadForm />
    </main>
  )
}