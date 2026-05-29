"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useLang } from "@/hooks/useLang"
import { useAuth } from "@/hooks/useAuth"
import { useProducts } from "@/hooks/useProducts"
import type { Product } from "@/types"

function ProductDetailContent() {
  const { t }                              = useLang()
  const { appUser }                        = useAuth()
  const { products, review, remove, edit } = useProducts()
  const params                             = useParams()
  const router                             = useRouter()

  const [product, setProduct]            = useState<Product | null>(null)
  const [editing,  setEditing]           = useState(false)
  const [comment,  setComment]           = useState("")
  const [reviewing, setReviewing]        = useState(false)
  const [deleting,  setDeleting]         = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving,    setSaving]           = useState(false)

  // Edit fields
  const [editName,      setEditName]      = useState("")
  const [editQuantity,  setEditQuantity]  = useState(1)
  const [editUnite,     setEditUnite]     = useState("U")
  const [editCondition, setEditCondition] = useState("")
  const [editLocation,  setEditLocation]  = useState("")
  const [editLotNumber, setEditLotNumber] = useState("")
  const [editNotes,     setEditNotes]     = useState("")

  useEffect(() => {
    const found = products.find(p => p.productId === params.id)
    if (found) {
      setProduct(found)
      setEditName(found.name)
      setEditQuantity(found.quantity)
      setEditUnite(found.unite || "U")
      setEditCondition(found.condition)
      setEditLocation(found.location || "")
      setEditLotNumber(found.lotNumber || "")
      setEditNotes(found.notes)
    }
  }, [products, params.id])

  async function handleSaveEdit() {
    if (!product) return
    setSaving(true)
    const data = {
      name:      editName,
      quantity:  editQuantity,
      unite:     editUnite,
      condition: editCondition,
      location:  editLocation,
      lotNumber: editLotNumber,
      notes:     editNotes,
    }
    await edit(product.productId, data)
    setProduct(p => p ? { ...p, ...data } : p)
    setEditing(false)
    setSaving(false)
  }

  async function handleDelete() {
    if (!product) return
    setDeleting(true)
    await remove(product.productId)
    router.push("/products")
  }

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

  const canEdit =
    appUser?.role === "worker" &&
    product?.submittedBy === appUser?.uid &&
    product?.status === "pending"

  const inputStyle: React.CSSProperties = {
    background:   "var(--input-bg)",
    border:       "0.5px solid var(--input-border)",
    borderRadius: 8,
    color:        "var(--input-text)",
    padding:      "8px 12px",
    fontSize:     13,
    fontFamily:   "inherit",
    outline:      "none",
    width:        "100%",
  }

  const labelStyle: React.CSSProperties = {
    fontSize:      11,
    color:         "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom:  4,
    display:       "block",
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

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            position:       "fixed",
            inset:          0,
            background:     "rgba(0,0,0,0.5)",
            zIndex:         999,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 12,
              padding:      24,
              width:        300,
              boxShadow:    "var(--shadow-md)",
            }}
          >
            <div style={{
              fontSize:     14,
              fontWeight:   600,
              color:        "var(--text)",
              marginBottom: 8,
            }}>
              Supprimer ce produit ?
            </div>
            <div style={{
              fontSize:     12,
              color:        "var(--text-muted)",
              marginBottom: 20,
            }}>
              Cette action est irréversible.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex:         1,
                  padding:      "9px 0",
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 8,
                  color:        "var(--text-sub)",
                  cursor:       "pointer",
                  fontSize:     12,
                  fontFamily:   "inherit",
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex:         1,
                  padding:      "9px 0",
                  background:   "var(--btn-danger-bg)",
                  border:       "0.5px solid var(--btn-danger-border)",
                  borderRadius: 8,
                  color:        "var(--btn-danger-text)",
                  cursor:       "pointer",
                  fontSize:     12,
                  fontFamily:   "inherit",
                }}
              >
                {deleting ? "..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          background: "none",
          border:     "none",
          color:      "var(--text-muted)",
          fontSize:   12,
          cursor:     "pointer",
          padding:    "0 0 20px",
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
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
              {product.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
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
              flexShrink:   0,
            }}>
              {product.status === "pending"  ? t.status.pending  :
               product.status === "approved" ? t.status.approved : t.status.rejected}
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={{
          padding:       "20px 24px",
          display:       "flex",
          flexDirection: "column",
          gap:           14,
        }}>
          {editing ? (
            <>
              <div>
                <label style={labelStyle}>{t.products.name}</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
                <div>
                  <label style={labelStyle}>{t.products.quantity}</label>
                  <input
                    type="number"
                    min={1}
                    value={editQuantity}
                    onChange={e => setEditQuantity(Number(e.target.value))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                    onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Unité</label>
                  <select
                    value={editUnite}
                    onChange={e => setEditUnite(e.target.value)}
                    style={{ ...inputStyle, appearance: "none" as any }}
                  >
                    <option value="U">U</option>
                    <option value="m">m</option>
                    <option value="ml">ml</option>
                    <option value="m2">m²</option>
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="F">F</option>
                    <option value="boite">Boîte</option>
                    <option value="rouleau">Rouleau</option>
                    <option value="lot">Lot</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>N° Lot</label>
                  <input
                    value={editLotNumber}
                    onChange={e => setEditLotNumber(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                    onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Zone</label>
                  <input
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                    onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t.products.condition}</label>
                <select
                  value={editCondition}
                  onChange={e => setEditCondition(e.target.value)}
                  style={{ ...inputStyle, appearance: "none" as any }}
                >
                  <option value="">— Sélectionner —</option>
                  <option value="Neuf">Neuf</option>
                  <option value="Bon état">Bon état</option>
                  <option value="Usé">Usé</option>
                  <option value="Endommagé">Endommagé</option>
                  <option value="À vérifier">À vérifier</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>{t.products.notes}</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize:    "vertical" as any,
                    minHeight: 70,
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    flex:         1,
                    padding:      "10px 0",
                    background:   "var(--card)",
                    border:       "0.5px solid var(--border)",
                    borderRadius: 8,
                    color:        "var(--text-sub)",
                    cursor:       "pointer",
                    fontSize:     13,
                    fontFamily:   "inherit",
                  }}
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  style={{
                    flex:         2,
                    padding:      "10px 0",
                    background:   "var(--accent)",
                    color:        "#fff",
                    border:       "0.5px solid var(--border-focus)",
                    borderRadius: 8,
                    cursor:       saving ? "not-allowed" : "pointer",
                    fontSize:     13,
                    fontWeight:   500,
                    fontFamily:   "inherit",
                    opacity:      saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Sauvegarde..." : t.common.save}
                </button>
              </div>
            </>
          ) : (
            <>
              {[
                { label: t.products.quantity,  value: `${product.quantity} ${product.unite || "U"}` },
                { label: "N° Lot",             value: product.lotNumber  || "—" },
                { label: "Zone",               value: product.location   || "—" },
                { label: t.products.condition, value: product.condition  || "—" },
                { label: t.products.notes,     value: product.notes      || "—" },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>
                    {f.value}
                  </div>
                </div>
              ))}

              {product.managerComment && (
                <div style={{
                  background:   "var(--surface)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 8,
                  padding:      "12px 14px",
                }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                    {t.products.comment}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>
                    {product.managerComment}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Worker edit/delete actions */}
        {canEdit && !editing && (
          <div style={{
            padding:   "14px 24px",
            borderTop: "0.5px solid var(--border)",
            display:   "flex",
            gap:       10,
          }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                flex:         2,
                padding:      "10px 0",
                background:   "var(--btn-primary-bg)",
                color:        "var(--btn-primary-text)",
                border:       "0.5px solid var(--btn-primary-border)",
                borderRadius: 8,
                cursor:       "pointer",
                fontSize:     13,
                fontWeight:   500,
                fontFamily:   "inherit",
              }}
            >
              ✎ {t.common.edit}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                flex:         1,
                padding:      "10px 0",
                background:   "var(--btn-danger-bg)",
                color:        "var(--btn-danger-text)",
                border:       "0.5px solid var(--btn-danger-border)",
                borderRadius: 8,
                cursor:       "pointer",
                fontSize:     13,
                fontFamily:   "inherit",
              }}
            >
              {t.common.delete}
            </button>
          </div>
        )}

        {/* Manager approve/reject */}
        {appUser?.role === "manager" && product.status === "pending" && (
          <div style={{
            padding:       "16px 24px",
            borderTop:     "0.5px solid var(--border)",
            display:       "flex",
            flexDirection: "column",
            gap:           12,
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
                resize:       "vertical" as any,
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
                  padding:      "11px 0",
                  background:   "var(--btn-danger-bg)",
                  color:        "var(--btn-danger-text)",
                  border:       "0.5px solid var(--btn-danger-border)",
                  borderRadius: 8,
                  cursor:       reviewing ? "not-allowed" : "pointer",
                  fontSize:     13,
                  fontWeight:   500,
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
                  padding:      "11px 0",
                  background:   "var(--btn-green-bg)",
                  color:        "var(--btn-green-text)",
                  border:       "0.5px solid var(--btn-green-border)",
                  borderRadius: 8,
                  cursor:       reviewing ? "not-allowed" : "pointer",
                  fontSize:     13,
                  fontWeight:   500,
                  fontFamily:   "inherit",
                  opacity:      reviewing ? 0.6 : 1,
                }}
              >
                {reviewing ? "..." : t.manager.approve}
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