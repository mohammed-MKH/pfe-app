"use client"

import { useState, useEffect } from "react"
import { subscribeConversationMessages, sendMessage } from "@/lib/firestore"
import type { Message } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { uploadMessagePhoto } from "@/lib/storage"

export function useMessages(conversationId?: string) {
  const { appUser }                 = useAuth()
  const [messages, setMessages]     = useState<Message[]>([])
  const [loading,  setLoading]      = useState(true)

  useEffect(() => {
    if (!appUser || !conversationId) return
    setLoading(true)
    const unsub = subscribeConversationMessages(conversationId, msgs => {
      setMessages(msgs)
      setLoading(false)
    })
    return () => unsub()
  }, [appUser, conversationId])

  async function send(text: string) {
    if (!appUser || !conversationId) return
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const msg: Message = {
      messageId,
      adminId:        appUser.adminId,
      conversationId,
      senderId:       appUser.uid,
      senderName:     appUser.displayName,
      senderRole:     appUser.role,
      text,
      photoURL:       null,
      type:           "text",
      edited:         false,
      createdAt:      Date.now(),
    }
    await sendMessage(msg)
  }

  async function sendPhoto(file: File) {
    if (!appUser || !conversationId) return
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const url = await uploadMessagePhoto(appUser.adminId, messageId, file)
    const msg: Message = {
      messageId,
      adminId:        appUser.adminId,
      conversationId,
      senderId:       appUser.uid,
      senderName:     appUser.displayName,
      senderRole:     appUser.role,
      text:           null,
      photoURL:       url,
      type:           "photo",
      edited:         false,
      createdAt:      Date.now(),
    }
    await sendMessage(msg)
  }

  return { messages, loading, send, sendPhoto }
}