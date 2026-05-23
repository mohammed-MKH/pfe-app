"use client"

import { useState, useRef, useEffect } from "react"
import AppLayout from "../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useLang } from "@/hooks/useLang"

interface ChatMessage {
  role:    "user" | "assistant"
  content: string
}

const SUGGESTIONS_FR = [
  "Quelle norme pour câblage 400V triphasé ?",
  "Section minimale câble 32A monophasé ?",
  "Différence disjoncteur magnéto-thermique et différentiel ?",
  "Comment calculer la puissance d'une armoire électrique ?",
  "Norme IP65 — quand l'utiliser ?",
  "Disjoncteur moteur — comment le choisir ?",
]

const SUGGESTIONS_EN = [
  "What standard for 400V three-phase wiring?",
  "Minimum cable section for 32A single phase?",
  "Difference between MCB and RCD?",
  "How to calculate electrical panel power?",
  "IP65 rating — when to use it?",
  "Motor circuit breaker — how to choose?",
]

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user"

  return (
    <div style={{
      display:       "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems:    "flex-start",
      gap:           10,
      marginBottom:  12,
    }}>

      {/* Avatar */}
      <div style={{
        width:          30,
        height:         30,
        borderRadius:   8,
        background:     isUser ? "var(--accent-bg)" : "var(--surface)",
        border:         `0.5px solid ${isUser ? "var(--border-focus)" : "var(--border)"}`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       12,
        fontWeight:     500,
        color:          isUser ? "var(--accent)" : "var(--text-sub)",
        flexShrink:     0,
      }}>
        {isUser ? "U" : "AI"}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth:     "72%",
        background:   isUser ? "var(--accent-bg)" : "var(--card)",
        border:       `0.5px solid ${isUser ? "var(--border-focus)" : "var(--border)"}`,
        borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        padding:      "10px 14px",
        fontSize:     13,
        color:        isUser ? "var(--accent)" : "var(--text)",
        lineHeight:   1.6,
        whiteSpace:   "pre-wrap",
        wordBreak:    "break-word",
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function AIContent() {
  const { t, lang }                         = useLang()
  const [messages,  setMessages]            = useState<ChatMessage[]>([])
  const [input,     setInput]               = useState("")
  const [thinking,  setThinking]            = useState(false)
  const [error,     setError]               = useState("")
  const bottomRef                           = useRef<HTMLDivElement>(null)
  const inputRef                            = useRef<HTMLInputElement>(null)

  const suggestions = lang === "fr" ? SUGGESTIONS_FR : SUGGESTIONS_EN

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  async function sendMessage(text: string) {
    if (!text.trim() || thinking) return
    setError("")

    const userMsg: ChatMessage = { role: "user", content: text.trim() }
    const history = messages.slice(-10) // keep last 10 for context

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setThinking(true)

    try {
      const res = await fetch("/api/ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message: text.trim(),
          history: history.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      const aiMsg: ChatMessage = {
        role:    "assistant",
        content: data.reply || t.ai.noAnswer,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err: any) {
      setError(t.common.error)
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: t.ai.noAnswer,
      }])
    } finally {
      setThinking(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function clearChat() {
    setMessages([])
    setError("")
    inputRef.current?.focus()
  }

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "calc(100vh - 52px - 48px)",
    }}>

      {/* HEADER */}
      <div style={{
        padding:      "0 0 16px",
        borderBottom: "0.5px solid var(--border)",
        display:      "flex",
        alignItems:   "center",
        gap:          12,
      }}>
        <div style={{
          width:          40,
          height:         40,
          borderRadius:   10,
          background:     "var(--accent-bg)",
          border:         "0.5px solid var(--border-focus)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       18,
          flexShrink:     0,
        }}>
          ◬
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize:   14,
            fontWeight: 600,
            color:      "var(--text)",
          }}>
            {t.ai.title}
          </div>
          <div style={{
            fontSize:  11,
            color:     "var(--text-muted)",
            marginTop: 2,
          }}>
            {t.ai.subtitle}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 7,
              color:        "var(--text-muted)",
              padding:      "6px 12px",
              fontSize:     11,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            {lang === "fr" ? "Effacer" : "Clear"}
          </button>
        )}
      </div>

      {/* MESSAGES AREA */}
      <div style={{
        flex:      1,
        overflowY: "auto",
        padding:   "20px 0",
      }}>
        {messages.length === 0 ? (
          <div style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            height:         "100%",
            gap:            20,
          }}>

            {/* Empty state icon */}
            <div style={{
              width:          64,
              height:         64,
              borderRadius:   16,
              background:     "var(--accent-bg)",
              border:         "0.5px solid var(--border-focus)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       28,
            }}>
              ◬
            </div>

            <div style={{
              fontSize:  13,
              color:     "var(--text-muted)",
              textAlign: "center",
            }}>
              {lang === "fr"
                ? "Posez une question sur les normes, câblages, protections..."
                : "Ask about standards, wiring, protections..."}
            </div>

            {/* Suggestions */}
            <div style={{
              display:    "flex",
              flexWrap:   "wrap",
              gap:        8,
              maxWidth:   500,
              justifyContent: "center",
            }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    background:   "var(--card)",
                    border:       "0.5px solid var(--border)",
                    borderRadius: 20,
                    color:        "var(--text-sub)",
                    padding:      "6px 14px",
                    fontSize:     11,
                    cursor:       "pointer",
                    fontFamily:   "inherit",
                    transition:   "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: "0 4px" }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Thinking indicator */}
            {thinking && (
              <div style={{
                display:    "flex",
                alignItems: "flex-start",
                gap:        10,
                marginBottom: 12,
              }}>
                <div style={{
                  width:          30,
                  height:         30,
                  borderRadius:   8,
                  background:     "var(--surface)",
                  border:         "0.5px solid var(--border)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       12,
                  color:          "var(--text-sub)",
                  flexShrink:     0,
                }}>
                  AI
                </div>
                <div style={{
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: "12px 12px 12px 2px",
                  padding:      "12px 16px",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          8,
                }}>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {t.ai.thinking}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div style={{
          background:   "var(--reject-bg)",
          border:       "0.5px solid var(--reject-border)",
          borderRadius: 7,
          padding:      "8px 12px",
          fontSize:     11,
          color:        "var(--reject-text)",
          marginBottom: 8,
        }}>
          {error}
        </div>
      )}

      {/* INPUT BAR */}
      <div style={{
        borderTop:   "0.5px solid var(--border)",
        paddingTop:  12,
        display:     "flex",
        gap:         8,
        alignItems:  "center",
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t.ai.placeholder}
          disabled={thinking}
          style={{
            flex:         1,
            background:   "var(--input-bg)",
            border:       "0.5px solid var(--input-border)",
            borderRadius: 8,
            color:        "var(--input-text)",
            padding:      "10px 14px",
            fontSize:     13,
            fontFamily:   "inherit",
            outline:      "none",
          }}
          onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
          onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || thinking}
          style={{
            background:   input.trim() && !thinking ? "var(--accent)" : "var(--card)",
            color:        input.trim() && !thinking ? "#fff"          : "var(--text-muted)",
            border:       "0.5px solid var(--border)",
            borderRadius: 8,
            padding:      "10px 20px",
            fontSize:     12,
            fontWeight:   500,
            cursor:       input.trim() && !thinking ? "pointer" : "not-allowed",
            fontFamily:   "inherit",
            flexShrink:   0,
            transition:   "background 0.15s",
          }}
        >
          {thinking ? "..." : t.ai.send}
        </button>
      </div>
    </div>
  )
}

export default function AIToolsPage() {
  return (
    <RoleGuard allowedRoles={["worker", "manager", "admin", "superadmin"]}>
      <AppLayout title="AI Tools">
        <div style={{ margin: "-24px", padding: "24px" }}>
          <AIContent />
        </div>
      </AppLayout>
    </RoleGuard>
  )
}