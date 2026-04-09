import Link from 'next/link'

type Props = {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function AppShell({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r bg-white p-6">
          <div>
            <Link href="/dashboard" className="text-2xl font-bold">
              PropSniper
            </Link>
            <p className="mt-1 text-sm text-gray-500">Wholesaling CRM</p>
          </div>

          <nav className="mt-8 space-y-2">
            <Link href="/dashboard" className="block rounded-xl px-4 py-3 text-sm hover:bg-gray-100">
              Dashboard
            </Link>
            <Link href="/map" className="block rounded-xl px-4 py-3 text-sm hover:bg-gray-100">
              Map
            </Link>
            <Link href="/finder" className="block rounded-xl px-4 py-3 text-sm hover:bg-gray-100">
              City Finder
            </Link>
            <Link href="/dashboard/new" className="block rounded-xl px-4 py-3 text-sm hover:bg-gray-100">
              Add Lead
            </Link>
            <Link href="/billing" className="block rounded-xl px-4 py-3 text-sm hover:bg-gray-100">
              Billing
            </Link>
          </nav>

          <form action="/auth/logout" method="post" className="mt-8">
            <button className="w-full rounded-xl border px-4 py-3 text-sm">
              Log out
            </button>
          </form>
        </aside>

        <main className="p-6 lg:p-8">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="text-3xl font-bold">{title}</h1>}
              {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  )
}