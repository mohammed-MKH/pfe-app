"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { useVehicles } from "@/hooks/useVehicles"
import { getUsersByAdmin } from "@/lib/firestore"
import type { AppUser } from "@/types"

function AdminVehiclesContent() {
  const { appUser }                                      = useAuth()
  const { t }                                            = useLang()
  const { vehicles, loading, addVehicle,
          assignVehicle, unassignVehicle, removeVehicle } = useVehicles()
  const [workers,     setWorkers]                        = useState<AppUser[]>([])
  const [showForm,    setShowForm]                       = useState(false)
  const [creating,    setCreating]                       = useState(false)
  const [showConfirm, setShowConfirm]                    = useState<string | null>(null)

  const [form, setForm] = useState({
    name:     "",
    plate:    "",
    type:     "company" as "company" | "personal",
    brand:    "",
    model:    "",
    year:     "",
    location: "",
    notes:    "",
  })

  useEffect(() => {
    if (!appUser) return
    getUsersByAdmin(appUser.adminId).then(users => {
      setWorkers(users.filter(u => u.role === "worker" || u.role === "manager"))
    })
  }, [appUser])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    await addVehicle(form)
    setForm({ name: "", plate: "", type: "company", brand: "", model: "", year: "", location: "", notes: "" })
    setShowForm(false)
    setCreating(false)
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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Delete confirm */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--card)", border: "0.5px solid var(--border)",
              borderRadius: 12, padding: 24, width: 300, boxShadow: "var(--shadow-md)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              Supprimer ce véhicule ?
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
              Tous les trajets associés restent dans l'historique.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowConfirm(null)}
                style={{
                  flex: 1, padding: "9px 0",
                  background: "var(--card)", border: "0.5px solid var(--border)",
                  borderRadius: 8, color: "var(--text-sub)",
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => { removeVehicle(showConfirm); setShowConfirm(null) }}
                style={{
                  flex: 1, padding: "9px 0",
                  background: "var(--btn-danger-bg)", color: "var(--btn-danger-text)",
                  border: "0.5px solid var(--btn-danger-border)",
                  borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
            Gestion de la flotte
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {vehicles.length} véhicule{vehicles.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: "var(--accent)", color: "#fff",
            border: "0.5px solid var(--border-focus)",
            borderRadius: 8, padding: "9px 18px",
            fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + Ajouter un véhicule
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background: "var(--card)", border: "0.5px solid var(--border)",
          borderRadius: 12, padding: "22px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 18 }}>
            Nouveau véhicule
          </div>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Name + plate */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Nom du véhicule</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Véhicule 01"
                  style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>
              <div>
                <label style={labelStyle}>Immatriculation</label>
                <input
                  value={form.plate}
                  onChange={e => setForm(f => ({ ...f, plate: e.target.value }))}
                  placeholder="Ex: 123456-A-45"
                  style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>
            </div>

            {/* Brand + Model + Year */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 12 }}>
              <div>
                <label style={labelStyle}>Marque</label>
                <input
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="Renault, Peugeot..."
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>
              <div>
                <label style={labelStyle}>Modèle</label>
                <input
                  value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="Kangoo, Partner..."
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>
              <div>
                <label style={labelStyle}>Année</label>
                <input
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  placeholder="2022"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>
            </div>

            {/* Type + Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                  style={{ ...inputStyle, appearance: "none" as any }}
                >
                  <option value="company">Véhicule de société</option>
                  <option value="personal">Véhicule personnel</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Localisation actuelle</label>
                <input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Dépôt, Chantier Nord..."
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Informations supplémentaires..."
                rows={2}
                style={{ ...inputStyle, resize: "vertical" as any }}
                onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
              />
            </div>

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
                {creating ? "..." : t.common.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles list */}
      {vehicles.length === 0 ? (
        <div style={{
          background: "var(--card)", border: "0.5px solid var(--border)",
          borderRadius: 10, padding: 40, textAlign: "center",
          color: "var(--text-muted)", fontSize: 13,
        }}>
          Aucun véhicule — cliquez sur "+ Ajouter" pour commencer
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vehicles.map(v => (
            <div key={v.vehicleId} style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 12,
              padding:      "16px 20px",
              display:      "flex",
              flexDirection: "column",
              gap:           12,
            }}>
              {/* Vehicle info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>🚗</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {v.brand} {v.model} · {v.plate} · {v.year} · {v.type === "company" ? "Société" : "Personnel"}
                  </div>
                  {v.location && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                      📍 {v.location}
                    </div>
                  )}
                </div>
                <div style={{
                  background:   v.status === "available" ? "var(--ok-bg)" : "var(--accent-bg)",
                  color:        v.status === "available" ? "var(--ok-text)" : "var(--accent)",
                  border:       `0.5px solid ${v.status === "available" ? "var(--ok-border)" : "var(--border-focus)"}`,
                  borderRadius: 5,
                  padding:      "3px 10px",
                  fontSize:     11,
                  fontWeight:   500,
                }}>
                  {v.status === "available" ? "Disponible" : `Assigné à ${v.assignedName}`}
                </div>
              </div>

              {/* Assign / unassign */}
              <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          10,
                paddingTop:   10,
                borderTop:    "0.5px solid var(--border)",
              }}>
                {v.assignedTo ? (
                  <button
                    onClick={() => unassignVehicle(v.vehicleId)}
                    style={{
                      flex: 1, padding: "8px 0",
                      background: "var(--btn-danger-bg)",
                      color: "var(--btn-danger-text)",
                      border: "0.5px solid var(--btn-danger-border)",
                      borderRadius: 7, cursor: "pointer",
                      fontSize: 12, fontFamily: "inherit",
                    }}
                  >
                    Désassigner {v.assignedName}
                  </button>
                ) : (
                  <select
                    defaultValue=""
                    onChange={e => {
                      const w = workers.find(w => w.uid === e.target.value)
                      if (w) assignVehicle(v.vehicleId, w.uid, w.displayName)
                      e.target.value = ""
                    }}
                    style={{
                      flex: 1,
                      background:   "var(--input-bg)",
                      border:       "0.5px solid var(--input-border)",
                      borderRadius: 7,
                      color:        "var(--input-text)",
                      padding:      "8px 12px",
                      fontSize:     12,
                      fontFamily:   "inherit",
                      outline:      "none",
                      appearance:   "none" as any,
                    }}
                  >
                    <option value="" disabled>Assigner à un membre...</option>
                    {workers.map(w => (
                      <option key={w.uid} value={w.uid}>{w.displayName}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => setShowConfirm(v.vehicleId)}
                  style={{
                    background:   "var(--btn-danger-bg)",
                    color:        "var(--btn-danger-text)",
                    border:       "0.5px solid var(--btn-danger-border)",
                    borderRadius: 7,
                    padding:      "8px 12px",
                    fontSize:     12,
                    cursor:       "pointer",
                    fontFamily:   "inherit",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminVehiclesPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AppLayout title="Flotte — Admin">
        <AdminVehiclesContent />
      </AppLayout>
    </RoleGuard>
  )
}