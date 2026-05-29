"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth }     from "@/hooks/useAuth"
import { useLang }     from "@/hooks/useLang"
import { useMessages } from "@/hooks/useMessages"
import { deleteMessage, editMessage } from "@/lib/firestore"
import type { Message } from "@/types"

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
  msg,
  isMe,
  onDelete,
  onEdit,
}: {
  msg:      Message
  isMe:     boolean
  onDelete: () => void
  onEdit:   (text: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState(msg.text || "")
  const menuRef                 = useRef<HTMLDivElement>(null)

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  })

  function handleEditSave() {
    if (editText.trim()) {
      onEdit(editText.trim())
      setEditMode(false)
    }
  }

  return (
    <div style={{
      display:       "flex",
      flexDirection: isMe ? "row-reverse" : "row",
      alignItems:    "flex-end",
      gap:           8,
      marginBottom:  4,
    }}>

      {/* Avatar — only for others */}
      {!isMe && (
        <div style={{
          width:          28,
          height:         28,
          borderRadius:   7,
          background:     "var(--surface)",
          border:         "0.5px solid var(--border)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       10,
          fontWeight:     500,
          color:          "var(--text-sub)",
          flexShrink:     0,
        }}>
          {msg.senderName.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    isMe ? "flex-end" : "flex-start",
        maxWidth:      "70%",
        gap:           3,
      }}>

        {/* Sender name */}
        {!isMe && (
          <div style={{ fontSize: 10, color: "var(--text-muted)", paddingLeft: 4 }}>
            {msg.senderName}
          </div>
        )}

        {/* Bubble row */}
        <div style={{
          display:    "flex",
          alignItems: "flex-end",
          gap:        4,
          flexDirection: isMe ? "row-reverse" : "row",
        }}>

          {editMode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <input
                autoFocus
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter")  handleEditSave()
                  if (e.key === "Escape") { setEditMode(false); setEditText(msg.text || "") }
                }}
                style={{
                  background:   "var(--input-bg)",
                  border:       "1px solid var(--border-focus)",
                  borderRadius: 8,
                  color:        "var(--input-text)",
                  padding:      "7px 10px",
                  fontSize:     13,
                  fontFamily:   "inherit",
                  outline:      "none",
                  minWidth:     180,
                }}
              />
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={handleEditSave}
                  style={{
                    background:   "var(--accent)",
                    color:        "#fff",
                    border:       "none",
                    borderRadius: 6,
                    padding:      "4px 10px",
                    fontSize:     11,
                    cursor:       "pointer",
                    fontFamily:   "inherit",
                  }}
                >
                  Sauv.
                </button>
                <button
                  onClick={() => { setEditMode(false); setEditText(msg.text || "") }}
                  style={{
                    background:   "var(--card)",
                    border:       "0.5px solid var(--border)",
                    borderRadius: 6,
                    padding:      "4px 10px",
                    fontSize:     11,
                    cursor:       "pointer",
                    fontFamily:   "inherit",
                    color:        "var(--text-sub)",
                  }}
                >
                  Ann.
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Bubble */}
              {msg.type === "photo" && msg.photoURL ? (
                <div style={{
                  background:   isMe ? "var(--accent-bg)" : "var(--card)",
                  border:       `0.5px solid ${isMe ? "var(--border-focus)" : "var(--border)"}`,
                  borderRadius: isMe ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  overflow:     "hidden",
                }}>
                  <img
                    src={msg.photoURL}
                    alt="photo"
                    style={{
                      maxWidth:  220,
                      maxHeight: 220,
                      display:   "block",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  background:   isMe ? "var(--accent-bg)" : "var(--card)",
                  border:       `0.5px solid ${isMe ? "var(--border-focus)" : "var(--border)"}`,
                  borderRadius: isMe ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  padding:      "8px 12px",
                  fontSize:     13,
                  color:        isMe ? "var(--accent)" : "var(--text)",
                  lineHeight:   1.5,
                  wordBreak:    "break-word" as any,
                }}>
                  {msg.text}
                  {(msg as any).edited && (
                    <span style={{
                      fontSize:   9,
                      color:      "var(--text-muted)",
                      marginLeft: 6,
                      fontStyle:  "italic",
                    }}>
                      modifié
                    </span>
                  )}
                </div>
              )}

              {/* Options — only for own text messages */}
              {isMe && msg.type !== "photo" && (
                <div style={{ position: "relative" }} ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(v => !v)}
                    style={{
                      background: "none",
                      border:     "none",
                      color:      "var(--text-muted)",
                      cursor:     "pointer",
                      fontSize:   16,
                      padding:    "2px 4px",
                      lineHeight: 1,
                      borderRadius: 4,
                    }}
                  >
                    ⋮
                  </button>
                  {showMenu && (
                    <div style={{
                      position:   "absolute",
                      bottom:     "100%",
                      right:      0,
                      background: "var(--card)",
                      border:     "0.5px solid var(--border)",
                      borderRadius: 8,
                      overflow:   "hidden",
                      zIndex:     10,
                      boxShadow:  "var(--shadow-md)",
                      minWidth:   130,
                    }}>
                      <button
                        onClick={() => { setEditMode(true); setShowMenu(false) }}
                        style={{
                          display:    "block",
                          width:      "100%",
                          textAlign:  "left",
                          padding:    "9px 14px",
                          background: "none",
                          border:     "none",
                          color:      "var(--text)",
                          fontSize:   12,
                          cursor:     "pointer",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        ✎ Modifier
                      </button>
                      <button
                        onClick={() => { onDelete(); setShowMenu(false) }}
                        style={{
                          display:     "block",
                          width:       "100%",
                          textAlign:   "left",
                          padding:     "9px 14px",
                          background:  "none",
                          border:      "none",
                          borderTop:   "0.5px solid var(--border)",
                          color:       "var(--reject-text)",
                          fontSize:    12,
                          cursor:      "pointer",
                          fontFamily:  "inherit",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--reject-bg)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        ✕ Supprimer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Time */}
        <div style={{
          fontSize:    10,
          color:       "var(--text-muted)",
          paddingLeft: isMe ? 0 : 4,
          paddingRight: isMe ? 4 : 0,
        }}>
          {time}
        </div>
      </div>
    </div>
  )
}

export default function ChatWindow() {
  const { appUser }                            = useAuth()
  const { t, lang }                            = useLang()
  const { messages, loading, send, sendPhoto } = useMessages()
  const [text,    setText]                     = useState("")
  const [sending, setSending]                  = useState(false)
  const bottomRef                              = useRef<HTMLDivElement>(null)
  const fileRef                                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  async function handleDelete(messageId: string) {
    await deleteMessage(messageId)
  }

  async function handleEdit(messageId: string, newText: string) {
    await editMessage(messageId, newText)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!appUser) return null

  let lastDate = ""

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "calc(100vh - 52px - 48px)",
      background:    "var(--bg)",
    }}>

      {/* Header */}
      <div style={{
        padding:      "12px 20px",
        background:   "var(--surface)",
        borderBottom: "0.5px solid var(--border)",
        display:      "flex",
        alignItems:   "center",
        gap:          10,
      }}>
        <div style={{
          width:          32,
          height:         32,
          borderRadius:   8,
          background:     "var(--card)",
          border:         "0.5px solid var(--border)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       14,
        }}>
          ◉
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
            {t.messages.title}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {lang === "fr" ? "Groupe de l'organisation" : "Organization group"}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex:          1,
        overflowY:     "auto",
        padding:       "16px 20px",
        display:       "flex",
        flexDirection: "column",
        gap:           2,
      }}>
        {loading ? (
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flex:           1,
          }}>
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flex:           1,
            color:          "var(--text-muted)",
            fontSize:       13,
          }}>
            {t.messages.noMessages}
          </div>
        ) : (
          messages.map(msg => {
            const msgDate  = dateDivider(msg.createdAt, lang)
            const showDiv  = msgDate !== lastDate
            lastDate       = msgDate
            const isMe     = msg.senderId === appUser.uid

            return (
              <div key={msg.messageId}>
                {showDiv && (
                  <div style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        10,
                    margin:     "12px 0 8px",
                  }}>
                    <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
                    <div style={{
                      fontSize:      10,
                      color:         "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}>
                      {msgDate}
                    </div>
                    <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
                  </div>
                )}
                <MessageBubble
                  msg={msg}
                  isMe={isMe}
                  onDelete={() => handleDelete(msg.messageId)}
                  onEdit={text  => handleEdit(msg.messageId, text)}
                />
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding:    "10px 16px",
        background: "var(--surface)",
        borderTop:  "0.5px solid var(--border)",
        display:    "flex",
        alignItems: "center",
        gap:        8,
      }}>
        {/* Photo button */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={sending}
          title={t.messages.sendPhoto}
          style={{
            background:   "var(--card)",
            border:       "0.5px solid var(--border)",
            borderRadius: 8,
            color:        "var(--text-sub)",
            padding:      "8px 10px",
            cursor:       "pointer",
            fontSize:     16,
            lineHeight:   1,
            flexShrink:   0,
          }}
        >
          📷
        </button>

        {/* Text input */}
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t.messages.placeholder}
          disabled={sending}
          style={{
            flex:         1,
            background:   "var(--input-bg)",
            border:       "0.5px solid var(--input-border)",
            borderRadius: 8,
            color:        "var(--input-text)",
            padding:      "9px 14px",
            fontSize:     13,
            fontFamily:   "inherit",
            outline:      "none",
          }}
          onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
          onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            background:   text.trim() && !sending ? "var(--accent)" : "var(--card)",
            color:        text.trim() && !sending ? "#fff"          : "var(--text-muted)",
            border:       "0.5px solid var(--border)",
            borderRadius: 8,
            padding:      "9px 16px",
            fontSize:     12,
            fontWeight:   500,
            cursor:       text.trim() && !sending ? "pointer" : "not-allowed",
            fontFamily:   "inherit",
            flexShrink:   0,
          }}
        >
          {sending ? "..." : t.messages.send}
        </button>
      </div>
    </div>
  )
}