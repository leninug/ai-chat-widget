import { ChatWidget } from '@/components/chat-widget'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
          Live demo
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          AI Chat Widget
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Drop-in chat component for any Next.js site. Streaming responses,
          prompt caching, and proper error handling out of the box.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Feature
            title="Real-time streaming"
            body="Tokens render as they arrive — sub-second time-to-first-token via ReadableStream."
          />
          <Feature
            title="Prompt caching"
            body="System prompt cache_control is set — caches automatically once your context grows past 4K tokens."
          />
          <Feature
            title="Typed error handling"
            body="Rate limits, auth failures, and API errors surface as friendly messages, not stack traces."
          />
          <Feature
            title="Mobile responsive"
            body="Full-screen on phones, floating panel on desktop. Keyboard-friendly."
          />
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Try it</h2>
          <p className="mt-1 text-sm text-gray-600">
            Click the chat bubble at the bottom right. Suggested prompts:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            <li>· What can you help me with?</li>
            <li>· Explain prompt caching in 2 sentences.</li>
            <li>· Write a TypeScript function that debounces a callback.</li>
          </ul>
        </div>

        <footer className="mt-16 border-t border-gray-200 pt-6 text-sm text-gray-500">
          Powered by{' '}
          <a
            href="https://docs.anthropic.com"
            className="font-medium text-brand-700 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Claude
          </a>{' '}
          · Next.js 14 · TypeScript · Tailwind
        </footer>
      </div>

      <ChatWidget />
    </main>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{body}</p>
    </div>
  )
}
