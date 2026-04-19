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
    <AppShell>
      <div>
        <h1>City Deal Finder</h1>
        <p>Search a city and find properties worth looking at.</p>
        <CityFinder />
      </div>
    </AppShell>
  )
}