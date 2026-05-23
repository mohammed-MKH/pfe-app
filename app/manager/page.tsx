"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { useProducts } from "@/hooks/useProducts"
import type { Product } from "@/types"

function StatusBadge({ status }: { status: Product["status"] }) {
  const s = {
    pending:  { bg: "var(--pending-bg)",  text: "var(--pending-text)",  border: "var(--pending-border)",  label: "En attente" },
    approved: { bg: "var(--ok-bg)",       text: "var(--ok-text)",       border: "var(--ok-border)",       label: "Approuvé"   },
    rejected: { bg: "var(--reject-bg)",   text: "var(--reject-text)",   border: "var(--reject-border)",   label: "Rejeté"     },
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

function ManagerContent() {
  const { appUser }              = useAuth()
  const { t }                    = useLang()
  const { products, loading, review } = useProducts()
  const router                   = useRouter()
  const [filter, setFilter]      = useState<"all"|"pending"|"approved"|"rejected">("pending")
  const [activeId, setActiveId]  = useState<string | null>(null)
  const [comment, setComment]    = useState("")
  const [reviewing, setReviewing] = useState(false)

  const filtered = products.filter(p =>
    filter === "all" ? true : p.status === filter
  )

  const activeProduct = products.find(p => p.productId === activeId)

  const filters = [
    { key: "all",      label: t.manager.filterAll,      count: products.length },
    { key: "pending",  label: t.manager.filterPending,  count: products.filter(p => p.status === "pending").length },
    { key: "approved", label: t.manager.filterApproved, count: products.filter(p => p.status === "approved").length },
    { key: "rejected", label: t.manager.filterRejected, count: products.filter(p => p.status === "rejected").length },
  ] as const

  async function handleReview(status: "approved" | "rejected") {
    if (!activeProduct || !appUser) return
    setReviewing(true)
    await review({
      productId:      activeProduct.productId,
      status,
      managerComment: comment,
      reviewedBy:     appUser.uid,
    })
    setComment("")
    setActiveId(null)
    setReviewing(false)
  }

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 52px - 48px)" }}>

      {/* LEFT — list */}
      <div style={{
        width:         340,
        flexShrink:    0,
        display:       "flex",
        flexDirection: "column",
        gap:           12,
      }}>

        {/* Title */}
        <div style={{
          fontSize:   16,
          fontWeight: 600,
          color:      "var(--text)",
        }}>
          {t.manager.title}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background:   filter === f.key ? "var(--accent-bg)" : "var(--card)",
                color:        filter === f.key ? "var(--accent)"    : "var(--text-sub)",
                border:       `0.5px solid ${filter === f.key ? "var(--border-focus)" : "var(--border)"}`,
                borderRadius: 6,
                padding:      "5px 10px",
                fontSize:     11,
                cursor:       "pointer",
                fontFamily:   "inherit",
                fontWeight:   filter === f.key ? 500 : 400,
                display:      "flex",
                alignItems:   "center",
                gap:          5,
              }}
            >
              {f.label}
              <span style={{
                background:   filter === f.key ? "var(--accent)" : "var(--surface)",
                color:        filter === f.key ? "#fff"          : "var(--text-muted)",
                borderRadius: 10,
                padding:      "0px 6px",
                fontSize:     10,
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{
          flex:      1,
          overflowY: "auto",
          display:   "flex",
          flexDirection: "column",
          gap:       5,
        }}>
          {loading ? (
            <div style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              padding:        40,
            }}>
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 10,
              padding:      24,
              textAlign:    "center",
              color:        "var(--text-muted)",
              fontSize:     12,
            }}>
              {t.manager.noSubmissions}
            </div>
          ) : (
            filtered.map(p => (
              <div
                key={p.productId}
                onClick={() => { setActiveId(p.productId); setComment("") }}
                style={{
                  background:   activeId === p.productId
                    ? "var(--accent-bg)"
                    : "var(--card)",
                  border:       `0.5px solid ${activeId === p.productId
                    ? "var(--border-focus)"
                    : "var(--border)"}`,
                  borderRadius: 8,
                  padding:      "10px 14px",
                  cursor:       "pointer",
                  display:      "flex",
                  flexDirection: "column",
                  gap:          5,
                  transition:   "background 0.1s",
                }}
                onMouseEnter={e => {
                  if (activeId !== p.productId)
                    e.currentTarget.style.background = "var(--card-hover)"
                }}
                onMouseLeave={e => {
                  if (activeId !== p.productId)
                    e.currentTarget.style.background = "var(--card)"
                }}
              >
                <div style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         8,
                  justifyContent: "space-between",
                }}>
                  <div style={{
                    fontSize:     12,
                    fontWeight:   500,
                    color:        "var(--text)",
                    flex:         1,
                    whiteSpace:   "nowrap",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {p.name}
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div style={{
                  fontSize: 11,
                  color:    "var(--text-muted)",
                }}>
                  {p.submittedByName} ·{" "}
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT — detail panel */}
      <div style={{
        flex:         1,
        background:   "var(--card)",
        border:       "0.5px solid var(--border)",
        borderRadius: 12,
        overflow:     "hidden",
        display:      "flex",
        flexDirection: "column",
      }}>
        {!activeProduct ? (
          <div style={{
            flex:           1,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            color:          "var(--text-muted)",
            fontSize:       13,
            flexDirection:  "column",
            gap:            8,
          }}>
            <div style={{ fontSize: 32 }}>▦</div>
            <div>Sélectionnez une soumission</div>
          </div>
        ) : (
          <>
            {/* Detail header */}
            <div style={{
              padding:      "20px 24px",
              borderBottom: "0.5px solid var(--border)",
              display:      "flex",
              alignItems:   "flex-start",
              gap:          14,
            }}>
              <div style={{
                width:          44,
                height:         44,
                borderRadius:   10,
                background:     "var(--surface)",
                border:         "0.5px solid var(--border)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       20,
                flexShrink:     0,
              }}>
                ▦
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize:   16,
                  fontWeight: 600,
                  color:      "var(--text)",
                }}>
                  {activeProduct.name}
                </div>
                <div style={{
                  fontSize:  11,
                  color:     "var(--text-muted)",
                  marginTop: 4,
                }}>
                  {t.products.submittedBy} {activeProduct.submittedByName} ·{" "}
                  {new Date(activeProduct.createdAt).toLocaleDateString()}
                </div>
              </div>
              <StatusBadge status={activeProduct.status} />
            </div>

            {/* Detail fields */}
            <div style={{
              flex:          1,
              padding:       "20px 24px",
              overflowY:     "auto",
              display:       "flex",
              flexDirection: "column",
              gap:           16,
            }}>
              {[
                { label: t.products.quantity,  value: String(activeProduct.quantity)   },
                { label: t.products.condition, value: activeProduct.condition || "—"   },
                { label: t.products.notes,     value: activeProduct.notes    || "—"   },
              ].map(f => (
                <div key={f.label}>
                  <div style={{
                    fontSize:      11,
                    color:         "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom:  4,
                  }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>
                    {f.value}
                  </div>
                </div>
              ))}

              {/* Existing comment */}
              {activeProduct.managerComment && (
                <div style={{
                  background:   "var(--surface)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 8,
                  padding:      "12px 14px",
                }}>
                  <div style={{
                    fontSize:      11,
                    color:         "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom:  6,
                  }}>
                    {t.products.comment}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>
                    {activeProduct.managerComment}
                  </div>
                </div>
              )}
            </div>

            {/* Action area — only for pending */}
            {activeProduct.status === "pending" && (
              <div style={{
                padding:   "16px 24px",
                borderTop: "0.5px solid var(--border)",
                display:   "flex",
                flexDirection: "column",
                gap:       10,
              }}>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t.manager.commentPlaceholder}
                  rows={2}
                  style={{
                    background:   "var(--input-bg)",
                    border:       "0.5px solid var(--input-border)",
                    borderRadius: 8,
                    color:        "var(--input-text)",
                    padding:      "10px 14px",
                    fontSize:     13,
                    fontFamily:   "inherit",
                    outline:      "none",
                    width:        "100%",
                    resize:       "vertical",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => handleReview("rejected")}
                    disabled={reviewing}
                    style={{
                      flex:         1,
                      background:   "var(--btn-danger-bg)",
                      color:        "var(--btn-danger-text)",
                      border:       "0.5px solid var(--btn-danger-border)",
                      borderRadius: 8,
                      padding:      "11px 0",
                      fontSize:     13,
                      fontWeight:   500,
                      cursor:       reviewing ? "not-allowed" : "pointer",
                      fontFamily:   "inherit",
                      opacity:      reviewing ? 0.6 : 1,
                    }}
                  >
                    {t.manager.reject}
                  </button>
                  <button
                    onClick={() => handleReview("approved")}
                    disabled={reviewing}
                    style={{
                      flex:         2,
                      background:   "var(--btn-green-bg)",
                      color:        "var(--btn-green-text)",
                      border:       "0.5px solid var(--btn-green-border)",
                      borderRadius: 8,
                      padding:      "11px 0",
                      fontSize:     13,
                      fontWeight:   500,
                      cursor:       reviewing ? "not-allowed" : "pointer",
                      fontFamily:   "inherit",
                      opacity:      reviewing ? 0.6 : 1,
                    }}
                  >
                    {reviewing ? "..." : t.manager.approve}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ManagerPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <AppLayout title="Validation">
        <div style={{ margin: "-24px", padding: "24px" }}>
          <ManagerContent />
        </div>
      </AppLayout>
    </RoleGuard>
  )
}