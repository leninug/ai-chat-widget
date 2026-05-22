'use client'

import { useRef, useEffect, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming && value.trim()) onSend()
    }
  }

  const canSend = !isStreaming && value.trim().length > 0 && !disabled

  return (
    <div className="flex items-end gap-2 border-t border-gray-200 bg-white p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isStreaming ? 'Streaming...' : 'Type a message…'}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
          'disabled:cursor-not-allowed disabled:bg-gray-50'
        )}
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <rect x="5" y="5" width="10" height="10" rx="1.5" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send"
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition',
            canSend
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M3.105 3.105a.75.75 0 01.832-.166l13.5 5.625a.75.75 0 010 1.384l-13.5 5.625a.75.75 0 01-.998-.92l1.79-5.473H10a.75.75 0 000-1.5H4.229L2.939 4.025a.75.75 0 01.166-.92z" />
          </svg>
        </button>
      )}
    </div>
  )
}
