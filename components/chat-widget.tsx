'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { cn } from '@/lib/utils'
import type { UIMessage } from '@/lib/types'

const SUGGESTED_PROMPTS = [
  'What can you help me with?',
  'Explain prompt caching in 2 sentences.',
  'Write a TypeScript debounce function.',
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      const userMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      }
      const assistantMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
      }

      const historyForApi = messages.map(({ role, content }) => ({
        role,
        content,
      }))
      historyForApi.push({ role: 'user', content: trimmed })

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setInput('')
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyForApi }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          const errText = (await response.text().catch(() => '')) || 'Request failed'
          throw new Error(errText)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: accumulated }
            }
            return next
          })
        }
      } catch (err) {
        const wasAborted = err instanceof Error && err.name === 'AbortError'
        if (!wasAborted) {
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last && last.role === 'assistant' && last.content.length === 0) {
              next[next.length - 1] = {
                ...last,
                content:
                  '_Failed to reach the server. Check your connection and try again._',
              }
            }
            return next
          })
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [isStreaming, messages]
  )

  function handleStop() {
    abortRef.current?.abort()
  }

  function handleReset() {
    if (isStreaming) abortRef.current?.abort()
    setMessages([])
    setInput('')
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
          isOpen
            ? 'bg-gray-900 text-white scale-90'
            : 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105'
        )}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-40 animate-fade-in',
            // Mobile: full-screen below the launcher
            'inset-x-0 bottom-0 top-0 sm:inset-auto',
            // Desktop: floating panel
            'sm:bottom-24 sm:right-5 sm:h-[600px] sm:w-[400px]',
            'flex flex-col overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                AI
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Chat Assistant
                </p>
                <p className="text-xs text-gray-500">
                  {isStreaming ? 'Typing…' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                  aria-label="New conversation"
                >
                  New
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 sm:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-6 w-6 text-brand-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    How can I help?
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Ask anything. Responses stream in real time.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void send(prompt)}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-700 hover:border-brand-300 hover:bg-brand-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, idx) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    isStreaming={
                      isStreaming &&
                      idx === messages.length - 1 &&
                      m.role === 'assistant'
                    }
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => void send(input)}
            onStop={handleStop}
            isStreaming={isStreaming}
          />
        </div>
      )}
    </>
  )
}
