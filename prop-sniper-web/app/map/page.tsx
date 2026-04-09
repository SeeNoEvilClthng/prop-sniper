import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import MapView from '@/components/MapView'

export default async function MapPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <AppShell
      title="Map"
      subtitle="Search addresses, save leads, and view pinned properties."
    >
      <MapView />
    </AppShell>
  )
}