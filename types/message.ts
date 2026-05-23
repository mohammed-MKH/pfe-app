export type MessageType = "text" | "photo" | "system"

export interface Message {
  messageId:  string
  adminId:    string
  senderId:   string
  senderName: string
  senderRole: string
  text:       string | null
  photoURL:   string | null
  type:       MessageType
  createdAt:  number
}