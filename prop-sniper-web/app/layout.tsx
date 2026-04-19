import './globals.css'
import type { Metadata } from 'next'
import "mapbox-gl/dist/mapbox-gl.css";

export const metadata: Metadata = {
  title: 'PropSniper',
  description: 'Map-based wholesaling CRM',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f7f8] text-[#111111] antialiased">
        {children}
      </body>
    </html>
  )
}