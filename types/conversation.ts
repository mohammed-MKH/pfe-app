export type ConversationType = "general" | "direct" | "group"

export interface Conversation {
  conversationId: string
  adminId:        string
  type:           ConversationType
  name:           string
  members:        string[]
  memberNames:    string[]
  createdBy:      string
  createdAt:      number
  lastMessage:    string | null
  lastMessageAt:  number | null
}