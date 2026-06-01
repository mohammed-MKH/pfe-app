export interface Message {
  messageId:      string
  adminId:        string
  conversationId: string
  senderId:       string
  senderName:     string
  senderRole:     string
  text:           string | null
  photoURL:       string | null
  type:           "text" | "photo" | "system"
  edited?:        boolean
  createdAt:      number
}