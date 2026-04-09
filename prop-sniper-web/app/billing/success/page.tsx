import Link from 'next/link'

export default function BillingSuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-bold">Payment received</h1>
      <p className="mt-4 text-gray-600">
        Your subscription is being updated.
      </p>

      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-white"
      >
        Back to Dashboard
      </Link>
    </main>
  )
}