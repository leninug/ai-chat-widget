'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import type { UIMessage } from '@/lib/types'

interface Props {
  message: UIMessage
  isStreaming: boolean
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'
  const showTypingDots = !isUser && isStreaming && message.content.length === 0

  return (
    <div
      className={cn(
        'flex animate-slide-up gap-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          AI
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        )}
      >
        {showTypingDots ? (
          <TypingDots />
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gray-500" />
      <span
        className="block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gray-500"
        style={{ animationDelay: '160ms' }}
      />
      <span
        className="block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gray-500"
        style={{ animationDelay: '320ms' }}
      />
    </div>
  )
}
