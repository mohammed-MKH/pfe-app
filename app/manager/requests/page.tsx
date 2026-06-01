"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { useRequests } from "@/hooks/useRequests"
import { getUsersByAdmin } from "@/lib/firestore"
import type { AppUser, MaterialRequest } from "@/types"

function StatusBadge({ status }: { status: MaterialRequest["status"] }) {
  const s = {
    pending:   { bg: "var(--pending-bg)",  text: "var(--pending-text)",  border: "var(--pending-border)",  label: "En attente"  },
    fulfilled: { bg: "var(--accent-bg)",   text: "var(--accent)",        border: "var(--border-focus)",    label: "Accompli"    },
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

function ManagerRequestsContent() {
  const { appUser }                              = useAuth()
  const { t }                                    = useLang()
  const { requests, loading, create, validate, remove } = useRequests()
  const [workers,    setWorkers]                 = useState<AppUser[]>([])
  const [showForm,   setShowForm]                = useState(false)
  const [activeId,   setActiveId]                = useState<string | null>(null)
  const [filter,     setFilter]                  = useState<"all"|"pending"|"fulfilled"|"validated"|"rejected">("all")
  const [creating,   setCreating]                = useState(false)
  const [reviewing,  setReviewing]               = useState(false)

  const [form, setForm] = useState({
    assignedTo:     "",
    assignedToName: "",
    name:           "",
    quantity:       1,
    unite:          "U",
    deadline:       "",
    notes:          "",
  })

  useEffect(() => {
    if (!appUser) return
    getUsersByAdmin(appUser.adminId).then(users => {
      setWorkers(users.filter(u => u.role === "worker"))
    })
  }, [appUser])

  const filtered = requests.filter(r =>
    filter === "all" ? true : r.status === filter
  )
  const active = requests.find(r => r.requestId === activeId)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.assignedTo) return
    setCreating(true)
    await create({
      assignedTo:     form.assignedTo,
      assignedToName: form.assignedToName,
      name:           form.name,
      quantity:       form.quantity,
      unite:          form.unite,
      deadline:       form.deadline ? new Date(form.deadline).getTime() : null,
      notes:          form.notes,
    })
    setForm({ assignedTo: "", assignedToName: "", name: "", quantity: 1, unite: "U", deadline: "", notes: "" })
    setShowForm(false)
    setCreating(false)
  }

  async function handleValidate(status: "validated" | "rejected") {
    if (!active || !appUser) return
    setReviewing(true)
    await validate(active.requestId, status, appUser.uid)
    setActiveId(null)
    setReviewing(false)
  }

  const inputStyle: React.CSSProperties = {
    background:   "var(--input-bg)",
    border:       "0.5px solid var(--input-border)",
    borderRadius: 8,
    color:        "var(--input-text)",
    padding:      "9px 14px",
    fontSize:     13,
    fontFamily:   "inherit",
    outline:      "none",
    width:        "100%",
  }

  const labelStyle: React.CSSProperties = {
    fontSize:      11,
    color:         "var(--text-sub)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontWeight:    500,
    marginBottom:  5,
    display:       "block",
  }

  const filters = [
    { key: "all",       label: "Toutes",      count: requests.length },
    { key: "pending",   label: "En attente",  count: requests.filter(r => r.status === "pending").length   },
    { key: "fulfilled", label: "Accomplis",   count: requests.filter(r => r.status === "fulfilled").length },
    { key: "validated", label: "Validés",     count: requests.filter(r => r.status === "validated").length },
    { key: "rejected",  label: "Rejetés",     count: requests.filter(r => r.status === "rejected").length  },
  ] as const

  // Detail view
  if (active) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
        <button
          onClick={() => setActiveId(null)}
          style={{
            background: "none", border: "none",
            color: "var(--text-muted)", fontSize: 12,
            cursor: "pointer", padding: 0, fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6, width: "fit-content",
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
              width:          40, height: 40, borderRadius: 10,
              background:     "var(--surface)", border: "0.5px solid var(--border)",
              display:        "flex", alignItems: "center", justifyContent: "center",
              fontSize:       18, flexShrink: 0,
            }}>
              📋
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                {active.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                Assigné à {active.assignedToName} · {new Date(active.createdAt).toLocaleDateString()}
              </div>
            </div>
            <StatusBadge status={active.status} />
          </div>

          {/* Fields */}
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Quantité",    value: `${active.quantity} ${active.unite}` },
              { label: "Assigné à",  value: active.assignedToName },
              { label: "Créé par",   value: active.createdByName },
              { label: "Échéance",   value: active.deadline ? new Date(active.deadline).toLocaleDateString() : "—" },
              { label: "Notes",      value: active.notes || "—" },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--text)" }}>{f.value}</div>
              </div>
            ))}

            {active.fulfilledNotes && (
              <div style={{
                background: "var(--accent-bg)", border: "0.5px solid var(--border-focus)",
                borderRadius: 8, padding: "10px 14px",
              }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                  Note du worker
                </div>
                <div style={{ fontSize: 13, color: "var(--text)" }}>{active.fulfilledNotes}</div>
              </div>
            )}
          </div>

          {/* Validate / reject — only for fulfilled */}
          {active.status === "fulfilled" && (
            <div style={{
              padding:   "14px 22px",
              borderTop: "0.5px solid var(--border)",
              display:   "flex",
              gap:       10,
            }}>
              <button
                onClick={() => handleValidate("rejected")}
                disabled={reviewing}
                style={{
                  flex: 1, padding: "11px 0",
                  background:   "var(--btn-danger-bg)",
                  color:        "var(--btn-danger-text)",
                  border:       "0.5px solid var(--btn-danger-border)",
                  borderRadius: 8, cursor: reviewing ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                  opacity: reviewing ? 0.6 : 1,
                }}
              >
                ✕ Rejeter
              </button>
              <button
                onClick={() => handleValidate("validated")}
                disabled={reviewing}
                style={{
                  flex: 2, padding: "11px 0",
                  background:   "var(--btn-green-bg)",
                  color:        "var(--btn-green-text)",
                  border:       "0.5px solid var(--btn-green-border)",
                  borderRadius: 8, cursor: reviewing ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                  opacity: reviewing ? 0.6 : 1,
                }}
              >
                {reviewing ? "..." : "✓ Valider"}
              </button>
            </div>
          )}

          {/* Delete button */}
          <div style={{ padding: "10px 22px", borderTop: "0.5px solid var(--border)" }}>
            <button
              onClick={() => { remove(active.requestId); setActiveId(null) }}
              style={{
                background:   "none",
                border:       "none",
                color:        "var(--reject-text)",
                cursor:       "pointer",
                fontSize:     12,
                fontFamily:   "inherit",
                padding:      0,
              }}
            >
              ✕ Supprimer cette demande
            </button>
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
            Demandes de matériaux
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {requests.length} demande{requests.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
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
          + Nouvelle demande
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          padding:      "22px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 18 }}>
            Nouvelle demande de matériau
          </div>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Assign to worker */}
            <div>
              <label style={labelStyle}>Assigner à</label>
              <select
                value={form.assignedTo}
                onChange={e => {
                  const worker = workers.find(w => w.uid === e.target.value)
                  setForm(f => ({
                    ...f,
                    assignedTo:     e.target.value,
                    assignedToName: worker?.displayName || "",
                  }))
                }}
                style={{ ...inputStyle, appearance: "none" as any }}
                required
              >
                <option value="">— Sélectionner un worker —</option>
                {workers.map(w => (
                  <option key={w.uid} value={w.uid}>{w.displayName}</option>
                ))}
              </select>
            </div>

            {/* Material name */}
            <div>
              <label style={labelStyle}>Matériau / Article</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Câble 50mm², Disjoncteur 32A..."
                style={inputStyle}
                required
                onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
              />
            </div>

            {/* Quantity + Unite */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12 }}>
              <div>
                <label style={labelStyle}>Quantité</label>
                <input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>
              <div>
                <label style={labelStyle}>Unité</label>
                <select
                  value={form.unite}
                  onChange={e => setForm(f => ({ ...f, unite: e.target.value }))}
                  style={{ ...inputStyle, appearance: "none" as any }}
                >
                  <option value="U">U — Unité</option>
                  <option value="m">m — Mètre</option>
                  <option value="kg">kg</option>
                  <option value="L">L — Litre</option>
                  <option value="boite">Boîte</option>
                  <option value="rouleau">Rouleau</option>
                  <option value="lot">Lot</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label style={labelStyle}>Date limite (optionnel)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes / Instructions</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Instructions additionnelles..."
                rows={2}
                style={{ ...inputStyle, resize: "vertical" as any, minHeight: 70 }}
                onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1, padding: "10px 0",
                  background: "var(--card)", border: "0.5px solid var(--border)",
                  borderRadius: 8, color: "var(--text-sub)",
                  cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                }}
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  flex: 2, padding: "10px 0",
                  background: "var(--accent)", color: "#fff",
                  border: "0.5px solid var(--border-focus)",
                  borderRadius: 8, cursor: creating ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                  opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? "Envoi..." : "Envoyer la demande"}
              </button>
            </div>
          </form>
        </div>
      )}

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
              borderRadius: 6, padding: "6px 12px", fontSize: 11,
              cursor: "pointer", fontFamily: "inherit",
              fontWeight: filter === f.key ? 500 : 400,
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {f.label}
            <span style={{
              background:   filter === f.key ? "var(--accent)" : "var(--surface)",
              color:        filter === f.key ? "#fff"          : "var(--text-muted)",
              borderRadius: 10, padding: "0 6px", fontSize: 10,
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "var(--card)", border: "0.5px solid var(--border)",
          borderRadius: 10, padding: 32, textAlign: "center",
          color: "var(--text-muted)", fontSize: 13,
        }}>
          Aucune demande
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(r => (
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
                borderRadius: 9, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
            >
              <div style={{ fontSize: 20, flexShrink: 0 }}>📋</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: "var(--text)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  → {r.assignedToName} · {r.quantity} {r.unite}
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

export default function ManagerRequestsPage() {
  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <AppLayout title="Demandes matériaux">
        <ManagerRequestsContent />
      </AppLayout>
    </RoleGuard>
  )
}