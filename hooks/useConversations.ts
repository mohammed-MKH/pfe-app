"use client"

import { useState, useEffect } from "react"
import {
  getConversationsByUser,
  setConversation,
  updateConversation,
  deleteConversation,
  subscribeConversationMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  getUsersByAdmin,
} from "@/lib/firestore"
import type { Conversation, Message } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { uploadMessagePhoto } from "@/lib/storage"

export function useConversations() {
  const { appUser }                               = useAuth()
  const [conversations, setConversations]         = useState<Conversation[]>([])
  const [activeId,      setActiveId]              = useState<string | null>(null)
  const [messages,      setMessages]              = useState<Message[]>([])
  const [loading,       setLoading]               = useState(true)
  const [msgLoading,    setMsgLoading]            = useState(false)

  // Load all conversations for current user
  useEffect(() => {
    if (!appUser) return
    async function load() {
      try {
        let convs = await getConversationsByUser(appUser!.uid, appUser!.adminId)

        // Create general group if it does not exist
        const hasGeneral = convs.find(c => c.type === "general")
        if (!hasGeneral) {
          const allUsers = await getUsersByAdmin(appUser!.adminId)
          const general: Conversation = {
            conversationId: `conv_general_${appUser!.adminId}`,
            adminId:        appUser!.adminId,
            type:           "general",
            name:           "Groupe général",
            members:        allUsers.map(u => u.uid),
            memberNames:    allUsers.map(u => u.displayName),
            createdBy:      appUser!.uid,
            createdAt:      Date.now(),
            lastMessage:    null,
            lastMessageAt:  null,
          }
          await setConversation(general)
          convs = [general, ...convs]
        }

        setConversations(convs)
        // Auto-select general
        if (!activeId) {
          const gen = convs.find(c => c.type === "general")
          if (gen) setActiveId(gen.conversationId)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [appUser])

  // Subscribe to messages when activeId changes
  useEffect(() => {
    if (!activeId) return
    setMsgLoading(true)
    const unsub = subscribeConversationMessages(activeId, msgs => {
      setMessages(msgs)
      setMsgLoading(false)
    })
    return () => unsub()
  }, [activeId])

  async function createGroup(
    name: string,
    memberUids: string[],
    memberNames: string[]
  ): Promise<string> {
    if (!appUser) throw new Error("Not logged in")
    // Always include the creator
    const allUids  = Array.from(new Set([appUser.uid, ...memberUids]))
    const allNames = allUids.map(uid => {
      if (uid === appUser.uid) return appUser.displayName
      const idx = memberUids.indexOf(uid)
      return memberNames[idx] || uid
    })
    const convId = `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const conv: Conversation = {
      conversationId: convId,
      adminId:        appUser.adminId,
      type:           "group",
      name,
      members:        allUids,
      memberNames:    allNames,
      createdBy:      appUser.uid,
      createdAt:      Date.now(),
      lastMessage:    null,
      lastMessageAt:  null,
    }
    await setConversation(conv)
    setConversations(prev => [...prev, conv])
    return convId
  }

  async function createDirect(
    otherUid: string,
    otherName: string
  ): Promise<string> {
    if (!appUser) throw new Error("Not logged in")
    // Check if DM already exists
    const existing = conversations.find(
      c => c.type === "direct" &&
        c.members.includes(appUser.uid) &&
        c.members.includes(otherUid)
    )
    if (existing) {
      setActiveId(existing.conversationId)
      return existing.conversationId
    }
    const convId = `conv_dm_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const conv: Conversation = {
      conversationId: convId,
      adminId:        appUser.adminId,
      type:           "direct",
      name:           otherName,
      members:        [appUser.uid, otherUid],
      memberNames:    [appUser.displayName, otherName],
      createdBy:      appUser.uid,
      createdAt:      Date.now(),
      lastMessage:    null,
      lastMessageAt:  null,
    }
    await setConversation(conv)
    setConversations(prev => [...prev, conv])
    setActiveId(convId)
    return convId
  }

  async function removeConversation(convId: string) {
    await deleteConversation(convId)
    setConversations(prev => prev.filter(c => c.conversationId !== convId))
    if (activeId === convId) {
      const gen = conversations.find(c => c.type === "general")
      setActiveId(gen?.conversationId || null)
    }
  }

  async function send(text: string) {
    if (!appUser || !activeId) return
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const msg: Message = {
      messageId,
      adminId:        appUser.adminId,
      conversationId: activeId,
      senderId:       appUser.uid,
      senderName:     appUser.displayName,
      senderRole:     appUser.role,
      text,
      photoURL:       null,
      type:           "text",
      createdAt:      Date.now(),
    } as any
    await sendMessage(msg)
    // Update conversation last message
    await updateConversation(activeId, {
      lastMessage:   text,
      lastMessageAt: Date.now(),
    })
    setConversations(prev =>
      prev.map(c =>
        c.conversationId === activeId
          ? { ...c, lastMessage: text, lastMessageAt: Date.now() }
          : c
      )
    )
  }

  async function sendPhoto(file: File) {
    if (!appUser || !activeId) return
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const url = await uploadMessagePhoto(appUser.adminId, messageId, file)
    const msg: Message = {
      messageId,
      adminId:        appUser.adminId,
      conversationId: activeId,
      senderId:       appUser.uid,
      senderName:     appUser.displayName,
      senderRole:     appUser.role,
      text:           null,
      photoURL:       url,
      type:           "photo",
      createdAt:      Date.now(),
    } as any
    await sendMessage(msg)
    await updateConversation(activeId, {
      lastMessage:   "📷 Photo",
      lastMessageAt: Date.now(),
    })
    setConversations(prev =>
      prev.map(c =>
        c.conversationId === activeId
          ? { ...c, lastMessage: "📷 Photo", lastMessageAt: Date.now() }
          : c
      )
    )
  }

  async function removeMessage(messageId: string) {
    await deleteMessage(messageId)
  }

  async function editMsg(messageId: string, text: string) {
    await editMessage(messageId, text)
  }

  return {
    conversations,
    activeId,
    setActiveId,
    messages,
    loading,
    msgLoading,
    createGroup,
    createDirect,
    removeConversation,
    send,
    sendPhoto,
    removeMessage,
    editMsg,
  }
}