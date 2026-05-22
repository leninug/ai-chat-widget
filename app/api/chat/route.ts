import Anthropic from '@anthropic-ai/sdk'
import { getAnthropicClient } from '@/lib/anthropic'
import type { ChatMessage, ChatRequestBody } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are a helpful AI assistant embedded as a chat widget on a website.

Guidelines:
- Keep responses brief and to the point (2-4 sentences for most queries)
- Use markdown formatting (bold, lists, code blocks) when it improves clarity
- If you don't know something, say so honestly — don't invent facts
- Don't repeat the user's question back to them
- For technical questions, give the direct answer first, then expand only if useful
- Use a friendly but professional tone

You are powered by Claude (Anthropic's AI model). You can mention this if asked.`

const MAX_HISTORY_TURNS = 20

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const m = value as Record<string, unknown>
  return (
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string' &&
    m.content.length > 0
  )
}

function errorMessageFor(err: unknown): string {
  if (err instanceof Anthropic.RateLimitError) {
    return 'Rate limited. Please wait a moment and try again.'
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return 'Authentication failed. Check the server API key.'
  }
  if (err instanceof Anthropic.BadRequestError) {
    return 'Bad request — your message may be too long.'
  }
  if (err instanceof Anthropic.APIError) {
    return `Service error (${err.status}). Please try again.`
  }
  if (err instanceof Error && err.message.includes('ANTHROPIC_API_KEY')) {
    return 'Server is not configured. Set ANTHROPIC_API_KEY.'
  }
  return 'Connection error. Please try again.'
}

export async function POST(req: Request): Promise<Response> {
  let body: ChatRequestBody
  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const incoming = Array.isArray(body.messages) ? body.messages : []
  const sanitized = incoming
    .filter(isChatMessage)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }))
    .slice(-MAX_HISTORY_TURNS)

  if (sanitized.length === 0 || sanitized[0].role !== 'user') {
    return new Response('First message must be from user', { status: 400 })
  }

  let client: Anthropic
  try {
    client = getAnthropicClient()
  } catch (err) {
    return new Response(errorMessageFor(err), { status: 500 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const aiStream = client.messages.stream({
          model: 'claude-opus-4-7',
          max_tokens: 2048,
          // Prompt caching: cache_control on the system prompt causes the
          // prefix to be cached after the first request. Below the model's
          // minimum cacheable prefix (~4096 tokens on Opus 4.7) the marker
          // is a no-op — caching kicks in once you grow the prompt with
          // company docs / FAQ / etc.
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: sanitized,
        })

        for await (const event of aiStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        controller.close()
      } catch (err) {
        const message = errorMessageFor(err)
        controller.enqueue(encoder.encode(`\n\n_${message}_`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, no-transform',
    },
  })
}
