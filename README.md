# AI Chat Widget

Production-grade chat widget for any Next.js site. Drop-in component, streaming responses, prompt caching, and proper error handling.

**Powered by:** Claude (Anthropic) · Next.js 14 App Router · TypeScript · Tailwind CSS

---

## Features

- **Real-time streaming** — Tokens render as they arrive via `ReadableStream`
- **Prompt caching** — `cache_control: ephemeral` set on the system prompt (caches once prompt > 4096 tokens on Opus 4.7)
- **Typed error handling** — `Anthropic.RateLimitError`, `AuthenticationError`, etc. surface as friendly UI messages
- **Mobile responsive** — Full-screen on phones, floating panel on desktop
- **Markdown rendering** — Code blocks, lists, links rendered via `react-markdown`
- **Abort support** — User can stop streaming mid-response
- **Conversation history capping** — Last 20 turns sent to API to control token cost
- **Input sanitization** — 8K-char limit per message, role validation, JSON parse guard

---

## Quick start

### 1. Install

```bash
npm install
```

### 2. Set your Anthropic API key

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get a key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click the chat bubble.

---

## Deploy to Vercel (free)

### Option A: CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked for environment variables, paste your `ANTHROPIC_API_KEY`.

### Option B: GitHub + Vercel dashboard

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin git@github.com:YOUR_USER/ai-chat-widget.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo
3. In **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from `console.anthropic.com`
4. Click **Deploy**

Your widget will be live at `https://your-project.vercel.app` in ~60 seconds.

---

## Project structure

```
ai-chat-widget/
├── app/
│   ├── api/chat/route.ts      # Streaming endpoint (Anthropic SDK + ReadableStream)
│   ├── globals.css            # Tailwind + markdown styles
│   ├── layout.tsx
│   └── page.tsx               # Landing page with embedded widget
├── components/
│   ├── chat-widget.tsx        # Main widget (launcher + panel + stream handling)
│   ├── chat-input.tsx         # Auto-resizing textarea with send/stop
│   └── message-bubble.tsx     # User/assistant bubbles + typing indicator
├── lib/
│   ├── anthropic.ts           # SDK client singleton
│   ├── types.ts               # ChatMessage, UIMessage types
│   └── utils.ts               # cn() helper
├── .env.example
└── README.md
```

---

## Customization

### Change the system prompt

Edit `SYSTEM_PROMPT` in `app/api/chat/route.ts`. To make prompt caching effective, expand it to 4096+ tokens (e.g., paste your product docs, FAQ, or knowledge base into the prompt).

### Change the model

In `app/api/chat/route.ts`:

```ts
model: 'claude-opus-4-7',   // most capable, default
// or:
model: 'claude-sonnet-4-6', // 3x cheaper, faster
// or:
model: 'claude-haiku-4-5',  // 5x cheaper, fastest
```

### Change the brand color

Edit `tailwind.config.ts` → `theme.extend.colors.brand`. The widget uses `brand-600` for primary, `brand-700` for hover.

### Embed on another site

Copy the `components/` and `lib/` folders into your existing Next.js project. Add the `<ChatWidget />` to any page. The API route at `/api/chat` works with any Next.js 14 App Router setup.

---

## How it works

### Streaming pipeline

1. Client `POST /api/chat` with full message history
2. API route validates input, instantiates `Anthropic` client, calls `client.messages.stream()`
3. Server iterates the SDK's async iterator, writing each `text_delta` to a `ReadableStream`
4. Client reads the stream with `getReader()`, decoding `Uint8Array` chunks and updating React state on each chunk
5. On completion, the controller closes and the connection ends

### Error handling

The API route catches typed Anthropic exceptions and writes a markdown-formatted error message into the stream. Errors land in the assistant bubble looking like normal text:

```
_Rate limited. Please wait a moment and try again._
```

Network errors (no response) are caught client-side in `chat-widget.tsx`.

### Why not Vercel AI SDK?

This widget uses the official `@anthropic-ai/sdk` directly. It's more verbose but:
- No extra abstraction layer
- Full access to Anthropic-specific features (`cache_control`, `thinking`, `output_config`)
- Easier to debug streaming issues
- One less dependency

If you prefer Vercel AI SDK's `useChat()` hook, you can swap it in — just replace the streaming logic in `app/api/chat/route.ts` with `streamText({ model: anthropic('claude-opus-4-7') })` from the `ai` package.

---

## Cost estimates

Per 1,000 messages (assuming ~500 input tokens / ~200 output tokens):

| Model | Cost / 1K msgs | Notes |
|---|---|---|
| Opus 4.7 | ~$3.50 | Most capable |
| Sonnet 4.6 | ~$2.10 | Best balance |
| Haiku 4.5 | ~$0.70 | Cheapest |

With prompt caching (system prompt > 4K tokens), cached reads cost ~0.1× the input rate.

---

## License

MIT — use it for any purpose, commercial or personal.

---

## Contact

Built as a portfolio piece — see Upwork/Fiverr profile for similar custom builds.
