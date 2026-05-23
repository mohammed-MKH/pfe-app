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
  const styles = {
    pending:  { bg: "var(--pending-bg)",  text: "var(--pending-text)",  border: "var(--pending-border)",  label: "En attente" },
    approved: { bg: "var(--ok-bg)",       text: "var(--ok-text)",       border: "var(--ok-border)",       label: "Approuvé"   },
    rejected: { bg: "var(--reject-bg)",   text: "var(--reject-text)",   border: "var(--reject-border)",   label: "Rejeté"     },
  }[status]

  return (
    <span style={{
      background:  styles.bg,
      color:       styles.text,
      border:      `0.5px solid ${styles.border}`,
      borderRadius: 4,
      padding:     "2px 8px",
      fontSize:    10,
      fontWeight:  500,
    }}>
      {styles.label}
    </span>
  )
}

function ProductsContent() {
  const { appUser }            = useAuth()
  const { t }                  = useLang()
  const { products, loading }  = useProducts()
  const router                 = useRouter()
  const [filter, setFilter]    = useState<"all"|"pending"|"approved"|"rejected">("all")

  const filtered = products.filter(p =>
    filter === "all" ? true : p.status === filter
  )

  const filters: { key: "all"|"pending"|"approved"|"rejected"; label: string }[] = [
    { key: "all",      label: t.status.all      },
    { key: "pending",  label: t.status.pending  },
    { key: "approved", label: t.status.approved },
    { key: "rejected", label: t.status.rejected },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
            {t.products.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {products.length} {t.common.rows}
          </div>
        </div>
        {appUser?.role === "worker" && (
          <button
            onClick={() => router.push("/products/new")}
            style={{
              background:   "var(--accent)",
              color:        "#fff",
              border:       "0.5px solid var(--border-focus)",
              borderRadius: 8,
              padding:      "9px 18px",
              fontSize:     12,
              fontWeight:   500,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            + {t.products.new}
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              background:   filter === f.key ? "var(--accent-bg)" : "var(--card)",
              color:        filter === f.key ? "var(--accent)"    : "var(--text-sub)",
              border:       `0.5px solid ${filter === f.key ? "var(--border-focus)" : "var(--border)"}`,
              borderRadius: 6,
              padding:      "6px 14px",
              fontSize:     12,
              cursor:       "pointer",
              fontFamily:   "inherit",
              fontWeight:   filter === f.key ? 500 : 400,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 10,
          padding:      32,
          textAlign:    "center",
          color:        "var(--text-muted)",
          fontSize:     13,
        }}>
          {t.products.noProducts}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(p => (
            <div
              key={p.productId}
              onClick={() => router.push(`/products/${p.productId}`)}
              style={{
                background:   "var(--card)",
                border:       "0.5px solid var(--border)",
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
              {/* Icon */}
              <div style={{
                width:          36,
                height:         36,
                borderRadius:   8,
                background:     "var(--surface)",
                border:         "0.5px solid var(--border)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       16,
                flexShrink:     0,
              }}>
                ▦
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize:     13,
                  fontWeight:   500,
                  color:        "var(--text)",
                  whiteSpace:   "nowrap",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {p.name}
                </div>
                <div style={{
                  fontSize:  11,
                  color:     "var(--text-muted)",
                  marginTop: 3,
                }}>
                  {t.products.submittedBy} {p.submittedByName} ·{" "}
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Qty */}
              <div style={{
                fontSize:   12,
                color:      "var(--text-sub)",
                flexShrink: 0,
              }}>
                ×{p.quantity}
              </div>

              {/* Status */}
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <RoleGuard allowedRoles={["worker", "manager", "admin"]}>
      <AppLayout title="Produits">
        <ProductsContent />
      </AppLayout>
    </RoleGuard>
  )
}