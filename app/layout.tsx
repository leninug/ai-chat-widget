import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Chat Widget — Drop-in Claude-powered chat',
  description:
    'Production-grade AI chat widget with streaming, prompt caching, and full TypeScript safety. Powered by Claude.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  )
}
