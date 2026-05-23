"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "../../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useLang } from "@/hooks/useLang"
import { useProducts } from "@/hooks/useProducts"

function NewProductContent() {
  const { t }      = useLang()
  const { submit } = useProducts()
  const router     = useRouter()

  const [name,      setName]      = useState("")
  const [quantity,  setQuantity]  = useState(1)
  const [condition, setCondition] = useState("")
  const [notes,     setNotes]     = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error,     setError]     = useState("")

  const inputStyle = {
    background:   "var(--input-bg)",
    border:       "0.5px solid var(--input-border)",
    borderRadius: 8,
    color:        "var(--input-text)",
    padding:      "10px 14px",
    fontSize:     13,
    fontFamily:   "inherit",
    outline:      "none",
    width:        "100%",
  }

  const labelStyle = {
    fontSize:      11,
    color:         "var(--text-sub)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    fontWeight:    500,
    marginBottom:  6,
    display:       "block",
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("Le nom est requis"); return }
    setSubmitting(true)
    setError("")
    try {
      await submit({
        name:      name.trim(),
        quantity,
        condition: condition.trim(),
        notes:     notes.trim(),
        photoURLs: [],
      })
      router.push("/products")
    } catch {
      setError(t.common.error)
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>

      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          background:   "none",
          border:       "none",
          color:        "var(--text-muted)",
          fontSize:     12,
          cursor:       "pointer",
          padding:      "0 0 20px",
          fontFamily:   "inherit",
          display:      "flex",
          alignItems:   "center",
          gap:          6,
        }}
      >
        ← {t.common.back}
      </button>

      <div style={{
        background:   "var(--card)",
        border:       "0.5px solid var(--border)",
        borderRadius: 12,
        padding:      "28px 28px",
      }}>
        <div style={{
          fontSize:   16,
          fontWeight: 600,
          color:      "var(--text)",
          marginBottom: 24,
        }}>
          {t.products.new}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          {/* Name */}
          <div>
            <label style={labelStyle}>{t.products.name}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Câble 50mm², Disjoncteur 32A..."
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
            />
          </div>

          {/* Quantity */}
          <div>
            <label style={labelStyle}>{t.products.quantity}</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
            />
          </div>

          {/* Condition */}
          <div>
            <label style={labelStyle}>{t.products.condition}</label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value)}
              style={{
                ...inputStyle,
                appearance: "none",
              }}
            >
              <option value="">— Sélectionner —</option>
              <option value="Neuf">Neuf / New</option>
              <option value="Bon état">Bon état / Good</option>
              <option value="Usé">Usé / Used</option>
              <option value="Endommagé">Endommagé / Damaged</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>{t.products.notes}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes additionnelles..."
              rows={3}
              style={{
                ...inputStyle,
                resize:    "vertical",
                minHeight: 80,
              }}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background:   "var(--reject-bg)",
              border:       "0.5px solid var(--reject-border)",
              borderRadius: 7,
              padding:      "9px 12px",
              fontSize:     12,
              color:        "var(--reject-text)",
            }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                flex:         1,
                background:   "var(--card)",
                border:       "0.5px solid var(--border)",
                borderRadius: 8,
                color:        "var(--text-sub)",
                padding:      "11px 0",
                fontSize:     13,
                cursor:       "pointer",
                fontFamily:   "inherit",
              }}
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex:         2,
                background:   "var(--accent)",
                color:        "#fff",
                border:       "0.5px solid var(--border-focus)",
                borderRadius: 8,
                padding:      "11px 0",
                fontSize:     13,
                fontWeight:   500,
                cursor:       submitting ? "not-allowed" : "pointer",
                fontFamily:   "inherit",
                opacity:      submitting ? 0.7 : 1,
              }}
            >
              {submitting ? t.products.submitting : t.products.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewProductPage() {
  return (
    <RoleGuard allowedRoles={["worker"]}>
      <AppLayout title="Nouveau produit">
        <NewProductContent />
      </AppLayout>
    </RoleGuard>
  )
}