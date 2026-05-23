"use client"

import { useState, useEffect } from "react"
import { subscribeMessages, sendMessage } from "@/lib/firestore"
import { uploadMessagePhoto } from "@/lib/storage"
import type { Message } from "@/types"
import { useAuth } from "@/hooks/useAuth"

export function useMessages() {
  const { appUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!appUser) return
    setLoading(true)
    const unsub = subscribeMessages(appUser.adminId, (msgs) => {
      setMessages(msgs)
      setLoading(false)
    })
    return () => unsub()
  }, [appUser])

  async function send(text: string) {
    if (!appUser || !text.trim()) return
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const msg: Message = {
      messageId,
      adminId:    appUser.adminId,
      senderId:   appUser.uid,
      senderName: appUser.displayName,
      senderRole: appUser.role,
      text:       text.trim(),
      photoURL:   null,
      type:       "text",
      createdAt:  Date.now(),
    }
    await sendMessage(msg)
  }

  async function sendPhoto(file: File) {
    if (!appUser) return
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
    try {
      const photoURL = await uploadMessagePhoto(appUser.adminId, messageId, file)
      const msg: Message = {
        messageId,
        adminId:    appUser.adminId,
        senderId:   appUser.uid,
        senderName: appUser.displayName,
        senderRole: appUser.role,
        text:       null,
        photoURL,
        type:       "photo",
        createdAt:  Date.now(),
      }
      await sendMessage(msg)
    } catch {
      console.error("Photo upload failed")
    }
  }

  return { messages, loading, send, sendPhoto }
}