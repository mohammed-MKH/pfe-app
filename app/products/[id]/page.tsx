"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AppLayout from "../../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useLang } from "@/hooks/useLang"
import { useAuth } from "@/hooks/useAuth"
import { useProducts } from "@/hooks/useProducts"
import type { Product } from "@/types"

function ProductDetailContent() {
  const { t }              = useLang()
  const { appUser }        = useAuth()
  const { products, review } = useProducts()
  const params             = useParams()
  const router             = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [comment, setComment] = useState("")
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    const found = products.find(p => p.productId === params.id)
    if (found) setProduct(found)
  }, [products, params.id])

  async function handleReview(status: "approved" | "rejected") {
    if (!product || !appUser) return
    setReviewing(true)
    await review({
      productId:      product.productId,
      status,
      managerComment: comment,
      reviewedBy:     appUser.uid,
    })
    setReviewing(false)
    router.push("/manager")
  }

  const statusStyle = product ? {
    pending:  { bg: "var(--pending-bg)",  text: "var(--pending-text)",  border: "var(--pending-border)"  },
    approved: { bg: "var(--ok-bg)",       text: "var(--ok-text)",       border: "var(--ok-border)"       },
    rejected: { bg: "var(--reject-bg)",   text: "var(--reject-text)",   border: "var(--reject-border)"   },
  }[product.status] : null

  if (!product) {
    return (
      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        60,
      }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>

      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          background: "none", border: "none",
          color: "var(--text-muted)", fontSize: 12,
          cursor: "pointer", padding: "0 0 20px",
          fontFamily: "inherit",
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
              {product.name}
            </div>
            <div style={{
              fontSize:  11,
              color:     "var(--text-muted)",
              marginTop: 4,
            }}>
              {t.products.submittedBy} {product.submittedByName} ·{" "}
              {new Date(product.createdAt).toLocaleDateString()}
            </div>
          </div>
          {statusStyle && (
            <div style={{
              background:   statusStyle.bg,
              color:        statusStyle.text,
              border:       `0.5px solid ${statusStyle.border}`,
              borderRadius: 5,
              padding:      "4px 10px",
              fontSize:     11,
              fontWeight:   500,
            }}>
              {product.status === "pending"  ? t.status.pending  :
               product.status === "approved" ? t.status.approved : t.status.rejected}
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>

          {[
            { label: t.products.quantity,  value: String(product.quantity)  },
            { label: t.products.condition, value: product.condition || "—"  },
            { label: t.products.notes,     value: product.notes    || "—"  },
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
              <div style={{
                fontSize: 13,
                color:    "var(--text)",
              }}>
                {f.value}
              </div>
            </div>
          ))}

          {/* Manager comment if exists */}
          {product.managerComment && (
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
                {product.managerComment}
              </div>
            </div>
          )}
        </div>

        {/* Manager actions */}
        {appUser?.role === "manager" && product.status === "pending" && (
          <div style={{
            padding:   "16px 24px",
            borderTop: "0.5px solid var(--border)",
            display:   "flex",
            flexDirection: "column",
            gap:       12,
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
                  padding:      "10px 0",
                  fontSize:     13,
                  fontWeight:   500,
                  cursor:       reviewing ? "not-allowed" : "pointer",
                  fontFamily:   "inherit",
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
                  padding:      "10px 0",
                  fontSize:     13,
                  fontWeight:   500,
                  cursor:       reviewing ? "not-allowed" : "pointer",
                  fontFamily:   "inherit",
                }}
              >
                {t.manager.approve}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <RoleGuard allowedRoles={["worker", "manager", "admin"]}>
      <AppLayout title="Produit">
        <ProductDetailContent />
      </AppLayout>
    </RoleGuard>
  )
}