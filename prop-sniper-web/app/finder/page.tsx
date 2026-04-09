import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import CityFinder from '@/components/CityFinder'

export default async function FinderPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AppShell
      title="City Deal Finder"
      subtitle="Search a city and find properties worth looking at."
    >
      <CityFinder />
    </AppShell>
  )
}