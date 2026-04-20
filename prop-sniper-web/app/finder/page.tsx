import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
    <main className="text-white">
      <div className="mx-auto max-w-7xl">
        <CityFinder />
      </div>
    </main>
  )
}
