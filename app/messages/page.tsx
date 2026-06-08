"use client"

import { useState, useEffect, useRef } from "react"
import AppLayout   from "@/components/layout/AppLayout"
import RoleGuard   from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { useConversations } from "@/hooks/useConversations"
import { getUsersByAdmin }   from "@/lib/firestore"
import type { AppUser, Conversation, Message } from "@/types"

function dateDivider(ts: number, lang: string): string {
  const d    = new Date(ts)
  const now  = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return lang === "fr" ? "Aujourd'hui" : "Today"
  if (diff === 1) return lang === "fr" ? "Hier"        : "Yesterday"
  return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric", month: "long",
  })
}

function MessageBubble({
  msg, isMe, onDelete, onEdit,
}: {
  msg:      Message
  isMe:     boolean
  onDelete: () => void
  onEdit:   (text: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState(msg.text || "")
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  })

  return (
    <div style={{
      display:       "flex",
      flexDirection: isMe ? "row-reverse" : "row",
      alignItems:    "flex-end",
      gap:           8,
      marginBottom:  6,
    }}>
      {!isMe && (
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "var(--surface)", border: "0.5px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 500, color: "var(--text-sub)", flexShrink: 0,
        }}>
          {msg.senderName.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: isMe ? "flex-end" : "flex-start",
        maxWidth: "70%", gap: 3,
      }}>
        {!isMe && (
          <div style={{ fontSize: 10, color: "var(--text-muted)", paddingLeft: 4 }}>
            {msg.senderName}
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "flex-end", gap: 4,
          flexDirection: isMe ? "row-reverse" : "row",
        }}>
          {editMode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <input
                autoFocus
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter")  { onEdit(editText.trim()); setEditMode(false) }
                  if (e.key === "Escape") { setEditMode(false); setEditText(msg.text || "") }
                }}
                style={{
                  background: "var(--input-bg)", border: "1px solid var(--border-focus)",
                  borderRadius: 8, color: "var(--input-text)", padding: "7px 10px",
                  fontSize: 13, fontFamily: "inherit", outline: "none", minWidth: 180,
                }}
              />
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={() => { onEdit(editText.trim()); setEditMode(false) }}
                  style={{
                    background: "var(--accent)", color: "#fff", border: "none",
                    borderRadius: 6, padding: "4px 10px", fontSize: 11,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >Sauv.</button>
                <button
                  onClick={() => { setEditMode(false); setEditText(msg.text || "") }}
                  style={{
                    background: "var(--card)", border: "0.5px solid var(--border)",
                    borderRadius: 6, padding: "4px 10px", fontSize: 11,
                    cursor: "pointer", fontFamily: "inherit", color: "var(--text-sub)",
                  }}
                >Ann.</button>
              </div>
            </div>
          ) : (
            <>
              {msg.type === "photo" && msg.photoURL ? (
                <div style={{
                  background: isMe ? "var(--accent-bg)" : "var(--card)",
                  border: `0.5px solid ${isMe ? "var(--border-focus)" : "var(--border)"}`,
                  borderRadius: isMe ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  overflow: "hidden",
                }}>
                  <img src={msg.photoURL} alt="photo"
                    style={{ maxWidth: 220, maxHeight: 220, display: "block", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{
                  background: isMe ? "var(--accent-bg)" : "var(--card)",
                  border: `0.5px solid ${isMe ? "var(--border-focus)" : "var(--border)"}`,
                  borderRadius: isMe ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  padding: "8px 12px", fontSize: 13,
                  color: isMe ? "var(--accent)" : "var(--text)",
                  lineHeight: 1.5, wordBreak: "break-word" as any,
                }}>
                  {msg.text}
                  {msg.edited && (
                    <span style={{ fontSize: 9, color: "var(--text-muted)", marginLeft: 6, fontStyle: "italic" }}>
                      modifié
                    </span>
                  )}
                </div>
              )}

              {isMe && msg.type !== "photo" && (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowMenu(v => !v)}
                    style={{
                      background: "none", border: "none", color: "var(--text-muted)",
                      cursor: "pointer", fontSize: 16, padding: "2px 4px", lineHeight: 1, borderRadius: 4,
                    }}
                  >⋮</button>
                  {showMenu && (
                    <div style={{
                      position: "absolute", bottom: "100%", right: 0,
                      background: "var(--card)", border: "0.5px solid var(--border)",
                      borderRadius: 8, overflow: "hidden", zIndex: 10,
                      boxShadow: "var(--shadow-md)", minWidth: 130,
                    }}>
                      <button
                        onClick={() => { setEditMode(true); setShowMenu(false) }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "9px 14px", background: "none", border: "none",
                          color: "var(--text)", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >✎ Modifier</button>
                      <button
                        onClick={() => { onDelete(); setShowMenu(false) }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "9px 14px", background: "none", border: "none",
                          borderTop: "0.5px solid var(--border)",
                          color: "var(--reject-text)", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--reject-bg)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >✕ Supprimer</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{
          fontSize: 10, color: "var(--text-muted)",
          paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0,
        }}>
          {time}
        </div>
      </div>
    </div>
  )
}

function MessagesContent() {
  const { appUser }  = useAuth()
  const { lang }     = useLang()
  const {
    conversations, activeId, setActiveId,
    messages, loading, msgLoading,
    createGroup, createDirect,
    removeConversation, send, sendPhoto,
    removeMessage, editMsg,
  } = useConversations()

  const [text,         setText]         = useState("")
  const [sending,      setSending]      = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showNewDM,    setShowNewDM]    = useState(false)
  const [allUsers,     setAllUsers]     = useState<AppUser[]>([])
  const [groupName,    setGroupName]    = useState("")
  const [selectedUids, setSelectedUids] = useState<string[]>([])
  const [mobileSide,   setMobileSide]   = useState(true)
  const bottomRef                       = useRef<HTMLDivElement>(null)
  const fileRef                         = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!appUser) return
    getUsersByAdmin(appUser.adminId).then(users => {
      setAllUsers(users.filter(u => u.uid !== appUser.uid))
    })
  }, [appUser])

  // Hide sidebar on mobile when conversation is selected
  useEffect(() => {
    if (activeId) setMobileSide(false)
  }, [activeId])

  async function handleSend() {
    if (!text.trim() || sending) return
    setSending(true)
    await send(text)
    setText("")
    setSending(false)
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSending(true)
    await sendPhoto(file)
    setSending(false)
    e.target.value = ""
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!groupName.trim() || selectedUids.length === 0) return
    const names = selectedUids.map(uid => allUsers.find(u => u.uid === uid)?.displayName || uid)
    await createGroup(groupName, selectedUids, names)
    setGroupName("")
    setSelectedUids([])
    setShowNewGroup(false)
    setMobileSide(false)
  }

  async function handleDM(uid: string, name: string) {
    await createDirect(uid, name)
    setShowNewDM(false)
    setMobileSide(false)
  }

  const activeConv  = conversations.find(c => c.conversationId === activeId)
  const isManager   = appUser?.role === "manager" || appUser?.role === "admin"
  const convIcon    = (type: Conversation["type"]) =>
    type === "general" ? "◉" : type === "group" ? "◈" : "◎"

  const convDisplayName = (conv: Conversation) =>
    conv.type === "direct"
      ? conv.memberNames.find((_, i) => conv.members[i] !== appUser?.uid) || conv.name
      : conv.name

  let lastDate = ""

  const inputStyle: React.CSSProperties = {
    background: "var(--input-bg)", border: "0.5px solid var(--input-border)",
    borderRadius: 8, color: "var(--input-text)", padding: "9px 14px",
    fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%",
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 52px)", overflow: "hidden" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <div style={{
        width:         280,
        flexShrink:    0,
        borderRight:   "0.5px solid var(--border)",
        display:       "flex",
        flexDirection: "column",
        background:    "var(--surface)",
        height:        "100%",
        overflow:      "hidden",
        // Mobile: show/hide
        position:      "relative",
      }}
        className={mobileSide ? "msg-sidebar show" : "msg-sidebar hide"}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px", borderBottom: "0.5px solid var(--border)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            Messages
          </div>
          {isManager && (
            <button
              onClick={() => { setShowNewGroup(v => !v); setShowNewDM(false) }}
              style={{
                background: showNewGroup ? "var(--accent)" : "var(--accent-bg)",
                color: showNewGroup ? "#fff" : "var(--accent)",
                border: "0.5px solid var(--border-focus)",
                borderRadius: 6, padding: "5px 10px", fontSize: 11,
                cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
              }}
            >
              + Groupe
            </button>
          )}
          <button
            onClick={() => { setShowNewDM(v => !v); setShowNewGroup(false) }}
            style={{
              background: showNewDM ? "var(--accent)" : "var(--card)",
              color: showNewDM ? "#fff" : "var(--text-sub)",
              border: "0.5px solid var(--border)",
              borderRadius: 6, padding: "5px 10px", fontSize: 11,
              cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
            }}
          >
            + DM
          </button>
        </div>

        {/* New group form */}
        {showNewGroup && (
          <div style={{
            padding: "14px 16px", borderBottom: "0.5px solid var(--border)",
            display: "flex", flexDirection: "column", gap: 10,
            background: "var(--card)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
              Nouveau groupe
            </div>
            <form onSubmit={handleCreateGroup} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Nom du groupe..."
                style={{ ...inputStyle, padding: "7px 10px", fontSize: 12 }}
                required
              />
              <div style={{ maxHeight: 130, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                {allUsers.map(u => (
                  <label key={u.uid} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 4px", cursor: "pointer", fontSize: 12,
                    color: "var(--text)", borderRadius: 5,
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedUids.includes(u.uid)}
                      onChange={e => setSelectedUids(prev =>
                        e.target.checked ? [...prev, u.uid] : prev.filter(id => id !== u.uid)
                      )}
                    />
                    {u.displayName}
                    <span style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      {u.role}
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => { setShowNewGroup(false); setGroupName(""); setSelectedUids([]) }}
                  style={{
                    flex: 1, padding: "7px 0", background: "none",
                    border: "0.5px solid var(--border)", borderRadius: 6,
                    color: "var(--text-sub)", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                  }}
                >Annuler</button>
                <button
                  type="submit"
                  style={{
                    flex: 2, padding: "7px 0", background: "var(--accent)", color: "#fff",
                    border: "none", borderRadius: 6,
                    cursor: "pointer", fontSize: 11, fontWeight: 500, fontFamily: "inherit",
                  }}
                >Créer</button>
              </div>
            </form>
          </div>
        )}

        {/* New DM list */}
        {showNewDM && (
          <div style={{
            padding: "14px 16px", borderBottom: "0.5px solid var(--border)",
            display: "flex", flexDirection: "column", gap: 6,
            background: "var(--card)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
                Message direct
              </div>
              <button
                onClick={() => setShowNewDM(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}
              >✕</button>
            </div>
            {allUsers.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "8px 0" }}>
                Aucun autre utilisateur trouvé
              </div>
            ) : allUsers.map(u => (
              <button
                key={u.uid}
                onClick={() => handleDM(u.uid, u.displayName)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", background: "var(--surface)",
                  border: "0.5px solid var(--border)", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: "var(--accent-bg)", border: "0.5px solid var(--border-focus)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 500, color: "var(--accent)",
                }}>
                  {u.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
                    {u.displayName}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {u.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Conversations list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
              <div className="spinner" />
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
              Aucune conversation
            </div>
          ) : (
            [...conversations]
              .sort((a, b) => {
                if (a.type === "general") return -1
                if (b.type === "general") return 1
                return (b.lastMessageAt || 0) - (a.lastMessageAt || 0)
              })
              .map(conv => {
                const isActive = conv.conversationId === activeId
                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => {
                      setActiveId(conv.conversationId)
                      setShowNewGroup(false)
                      setShowNewDM(false)
                      setMobileSide(false)
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 10px", borderRadius: 8, cursor: "pointer",
                      background: isActive ? "var(--sidebar-active-bg)" : "transparent",
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--sidebar-hover-bg)" }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: isActive ? "var(--accent)" : "var(--card)",
                      border: `0.5px solid ${isActive ? "var(--border-focus)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {convIcon(conv.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: isActive ? 500 : 400,
                        color: isActive ? "var(--sidebar-active-text)" : "var(--text)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {convDisplayName(conv)}
                      </div>
                      {conv.lastMessage && (
                        <div style={{
                          fontSize: 10, color: "var(--text-muted)",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2,
                        }}>
                          {conv.lastMessage}
                        </div>
                      )}
                    </div>
                    {isManager && conv.type !== "general" && isActive && (
                      <button
                        onClick={e => { e.stopPropagation(); removeConversation(conv.conversationId) }}
                        style={{
                          background: "none", border: "none", color: "var(--text-muted)",
                          cursor: "pointer", fontSize: 12, padding: "2px 4px", flexShrink: 0,
                        }}
                      >✕</button>
                    )}
                  </div>
                )
              })
          )}
        </div>
      </div>

      {/* ── CHAT AREA ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        height: "100%", overflow: "hidden", minWidth: 0,
      }}
        className={!mobileSide ? "msg-chat show" : "msg-chat hide"}
      >
        {/* Chat header */}
        <div style={{
          padding: "12px 20px", background: "var(--surface)",
          borderBottom: "0.5px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={() => setMobileSide(true)}
            style={{
              background: "none", border: "none", color: "var(--text-muted)",
              cursor: "pointer", fontSize: 20, padding: "2px 6px",
              lineHeight: 1,
            }}
            className="msg-back-btn"
          >
            ←
          </button>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--card)", border: "0.5px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>
            {activeConv ? convIcon(activeConv.type) : "◉"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
              {activeConv ? convDisplayName(activeConv) : "Messages"}
            </div>
            {activeConv && (
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {activeConv.type === "general"
                  ? "Groupe de l'organisation"
                  : activeConv.type === "group"
                  ? `${activeConv.members.length} membres`
                  : "Message direct"}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {!activeId ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              flex: 1, color: "var(--text-muted)", fontSize: 13,
            }}>
              Sélectionnez une conversation
            </div>
          ) : msgLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <div className="spinner" />
            </div>
          ) : messages.length === 0 ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              flex: 1, color: "var(--text-muted)", fontSize: 13,
            }}>
              Aucun message — soyez le premier !
            </div>
          ) : (
            messages.map(msg => {
              const msgDate = dateDivider(msg.createdAt, lang)
              const showDiv = msgDate !== lastDate
              lastDate      = msgDate
              const isMe    = msg.senderId === appUser?.uid
              return (
                <div key={msg.messageId}>
                  {showDiv && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, margin: "12px 0 8px",
                    }}>
                      <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
                      <div style={{
                        fontSize: 10, color: "var(--text-muted)",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {msgDate}
                      </div>
                      <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
                    </div>
                  )}
                  <MessageBubble
                    msg={msg}
                    isMe={isMe}
                    onDelete={() => removeMessage(msg.messageId)}
                    onEdit={text  => editMsg(msg.messageId, text)}
                  />
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {activeId && (
          <div style={{
            padding: "10px 16px", background: "var(--surface)",
            borderTop: "0.5px solid var(--border)",
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={sending}
              style={{
                background: "var(--card)", border: "0.5px solid var(--border)",
                borderRadius: 8, color: "var(--text-sub)", padding: "8px 10px",
                cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0,
              }}
            >📷</button>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Écrire un message..."
              disabled={sending}
              style={{
                flex: 1, background: "var(--input-bg)",
                border: "0.5px solid var(--input-border)",
                borderRadius: 8, color: "var(--input-text)", padding: "9px 14px",
                fontSize: 13, fontFamily: "inherit", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              style={{
                background:   text.trim() && !sending ? "var(--accent)" : "var(--card)",
                color:        text.trim() && !sending ? "#fff"          : "var(--text-muted)",
                border:       "0.5px solid var(--border)",
                borderRadius: 8, padding: "9px 16px", fontSize: 12,
                fontWeight: 500, cursor: text.trim() && !sending ? "pointer" : "not-allowed",
                fontFamily: "inherit", flexShrink: 0,
              }}
            >
              {sending ? "..." : "Envoyer"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .msg-sidebar { display: flex !important; }
          .msg-chat    { display: flex !important; }
          .msg-back-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .msg-sidebar.show { display: flex; width: 100% !important; }
          .msg-sidebar.hide { display: none; }
          .msg-chat.show    { display: flex; }
          .msg-chat.hide    { display: none; }
          .msg-back-btn     { display: block !important; }
        }
      `}</style>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <RoleGuard allowedRoles={["worker", "manager", "admin"]}>
      <AppLayout title="Messages">
        <MessagesContent />
      </AppLayout>
    </RoleGuard>
  )
}