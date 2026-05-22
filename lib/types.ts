export type Role = 'user' | 'assistant'

export interface ChatMessage {
  role: Role
  content: string
}

export interface UIMessage extends ChatMessage {
  id: string
}

export interface ChatRequestBody {
  messages: ChatMessage[]
}
