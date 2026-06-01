"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { useRequests } from "@/hooks/useRequests"
import type { MaterialRequest } from "@/types"

function StatusBadge({ status }: { status: MaterialRequest["status"] }) {
  const s = {
    pending:   { bg: "var(--pending-bg)",  text: "var(--pending-text)",  border: "var(--pending-border)",  label: "En attente"  },
    fulfilled: { bg: "var(--accent-bg)",   text: "var(--accent)",        border: "var(--border-focus)",    label: "Envoyé"      },
    validated: { bg: "var(--ok-bg)",       text: "var(--ok-text)",       border: "var(--ok-border)",       label: "Validé"      },
    rejected:  { bg: "var(--reject-bg)",   text: "var(--reject-text)",   border: "var(--reject-border)",   label: "Rejeté"      },
  }[status]
  return (
    <span style={{
      background:   s.bg,
      color:        s.text,
      border:       `0.5px solid ${s.border}`,
      borderRadius: 4,
      padding:      "2px 8px",
      fontSize:     10,
      fontWeight:   500,
    }}>
      {s.label}
    </span>
  )
}

function WorkerRequestsContent() {
  const { appUser }                    = useAuth()
  const { t }                          = useLang()
  const { requests, loading, fulfill } = useRequests()
  const router                         = useRouter()
  const [activeId,   setActiveId]      = useState<string | null>(null)
  const [notes,      setNotes]         = useState("")
  const [sending,    setSending]       = useState(false)

  const active = requests.find(r => r.requestId === activeId)

  async function handleFulfill() {
    if (!active) return
    setSending(true)
    await fulfill(active.requestId, notes)
    setNotes("")
    setActiveId(null)
    setSending(false)
  }

  if (active) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
        <button
          onClick={() => setActiveId(null)}
          style={{
            background: "none", border: "none",
            color: "var(--text-muted)", fontSize: 12,
            cursor: "pointer", padding: 0,
            fontFamily: "inherit", display: "flex",
            alignItems: "center", gap: 6, width: "fit-content",
          }}
        >
          ← {t.common.back}
        </button>

        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          overflow:     "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding:      "18px 22px",
            borderBottom: "0.5px solid var(--border)",
            display:      "flex",
            alignItems:   "flex-start",
            gap:          12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "var(--surface)", border: "0.5px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              📋
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                {active.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                Demandé par {active.createdByName} · {new Date(active.createdAt).toLocaleDateString()}
              </div>
            </div>
            <StatusBadge status={active.status} />
          </div>

          {/* Fields */}
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Quantité",  value: `${active.quantity} ${active.unite}` },
              { label: "Échéance",  value: active.deadline ? new Date(active.deadline).toLocaleDateString() : "—" },
              { label: "Instructions", value: active.notes || "—" },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--text)" }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* Fulfill action — only for pending */}
          {active.status === "pending" && (
            <div style={{
              padding:       "14px 22px",
              borderTop:     "0.5px solid var(--border)",
              display:       "flex",
              flexDirection: "column",
              gap:           10,
            }}>
              <div style={{ fontSize: 12, color: "var(--text-sub)", marginBottom: 4 }}>
                Ajoutez une note avant de marquer comme accompli :
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Matériau récupéré au dépôt, livré au chantier..."
                rows={2}
                style={{
                  background:   "var(--input-bg)",
                  border:       "0.5px solid var(--input-border)",
                  borderRadius: 8,
                  color:        "var(--input-text)",
                  padding:      "9px 12px",
                  fontSize:     13,
                  fontFamily:   "inherit",
                  outline:      "none",
                  width:        "100%",
                  resize:       "none",
                }}
                onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
              />
              <button
                onClick={handleFulfill}
                disabled={sending}
                style={{
                  padding:      "12px 0",
                  background:   "var(--btn-green-bg)",
                  color:        "var(--btn-green-text)",
                  border:       "0.5px solid var(--btn-green-border)",
                  borderRadius: 8,
                  cursor:       sending ? "not-allowed" : "pointer",
                  fontSize:     13,
                  fontWeight:   500,
                  fontFamily:   "inherit",
                  width:        "100%",
                  opacity:      sending ? 0.7 : 1,
                }}
              >
                {sending ? "Envoi..." : "✓ Marquer comme accompli"}
              </button>
            </div>
          )}

          {/* Already fulfilled message */}
          {active.status === "fulfilled" && (
            <div style={{
              padding:   "14px 22px",
              borderTop: "0.5px solid var(--border)",
              background: "var(--accent-bg)",
            }}>
              <div style={{ fontSize: 12, color: "var(--accent)" }}>
                ✓ Accompli — en attente de validation du manager
              </div>
              {active.fulfilledNotes && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Votre note : {active.fulfilledNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
        Mes demandes
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 10,
          padding:      32,
          textAlign:    "center",
          color:        "var(--text-muted)",
          fontSize:     13,
        }}>
          Aucune demande assignée pour le moment
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {requests.map(r => (
            <div
              key={r.requestId}
              onClick={() => setActiveId(r.requestId)}
              style={{
                background:   "var(--card)",
                border:       "0.5px solid var(--border)",
                borderLeft:   `3px solid ${
                  r.status === "validated" ? "var(--ok-border)" :
                  r.status === "fulfilled" ? "var(--border-focus)" :
                  r.status === "rejected"  ? "var(--reject-border)" :
                  "var(--pending-border)"}`,
                borderRadius: 9,
                padding:      "12px 16px",
                display:      "flex",
                alignItems:   "center",
                gap:          12,
                cursor:       "pointer",
                transition:   "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
            >
              <div style={{ fontSize: 20, flexShrink: 0 }}>📋</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize:     13,
                  fontWeight:   500,
                  color:        "var(--text)",
                  whiteSpace:   "nowrap",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {r.quantity} {r.unite} · De : {r.createdByName}
                  {r.deadline ? ` · Échéance: ${new Date(r.deadline).toLocaleDateString()}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <StatusBadge status={r.status} />
                <span style={{ color: "var(--text-muted)", fontSize: 16 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WorkerRequestsPage() {
  return (
    <RoleGuard allowedRoles={["worker"]}>
      <AppLayout title="Mes demandes">
        <WorkerRequestsContent />
      </AppLayout>
    </RoleGuard>
  )
}