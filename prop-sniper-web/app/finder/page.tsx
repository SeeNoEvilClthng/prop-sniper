import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeadDiscoveryWorkspace from '@/components/LeadDiscoveryWorkspace'

export default async function FinderPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <LeadDiscoveryWorkspace
      title="Finder Workspace"
      subtitle="Pull data fast, compare leads side by side, and keep the map in view while you decide what to save."
    />
  )
}
