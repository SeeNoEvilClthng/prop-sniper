import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditLeadForm from '@/components/EditLeadForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditLeadPage({ params }: Props) {
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
    .single()

  if (error || !lead) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold">Edit Lead</h1>
      <EditLeadForm lead={lead} />
    </main>
  )
}