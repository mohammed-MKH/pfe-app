"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { useVehicles } from "@/hooks/useVehicles"
import type { VehicleTrip, VehicleDemand } from "@/types"

type Tab = "trips" | "demands"

const paymentLabels: Record<string, string> = {
  cash:       "Espèces",
  card:       "Carte",
  jawaz:      "Jawaz",
  autoroute:  "Autoroute",
}

function StatusBadge({ status }: { status: string }) {
  const s = {
    pending:  { bg: "var(--pending-bg)",  text: "var(--pending-text)",  border: "var(--pending-border)",  label: "En attente" },
    approved: { bg: "var(--ok-bg)",       text: "var(--ok-text)",       border: "var(--ok-border)",       label: "Approuvé"   },
    rejected: { bg: "var(--reject-bg)",   text: "var(--reject-text)",   border: "var(--reject-border)",   label: "Rejeté"     },
  }[status] || { bg: "var(--card)", text: "var(--text-sub)", border: "var(--border)", label: status }
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

function WorkerVehiclesContent() {
  const { appUser }                              = useAuth()
  const { t }                                    = useLang()
  const { vehicles, trips, demands, loading,
          addTrip, addDemand }                   = useVehicles()
  const [tab,        setTab]                     = useState<Tab>("trips")
  const [showTrip,   setShowTrip]                = useState(false)
  const [showDemand, setShowDemand]              = useState(false)
  const [saving,     setSaving]                  = useState(false)

  // My assigned vehicle
  const myVehicle = vehicles.find(v => v.assignedTo === appUser?.uid)

  const [tripForm, setTripForm] = useState({
    vehicleId:     myVehicle?.vehicleId || "",
    date:          new Date().toISOString().slice(0, 10),
    departure:     "",
    destination:   "",
    distanceKm:    0,
    fuelCost:      0,
    tollCost:      0,
    otherCost:     0,
    paymentMethod: "cash" as "cash"|"card"|"jawaz"|"autoroute",
    cardRef:       "",
    notes:         "",
  })

  const [demandForm, setDemandForm] = useState({
    vehicleId:   "",
    date:        new Date().toISOString().slice(0, 10),
    destination: "",
    reason:      "",
  })

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

  async function handleAddTrip(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await addTrip({
      ...tripForm,
      date:       new Date(tripForm.date).getTime(),
      distanceKm: Number(tripForm.distanceKm),
      fuelCost:   Number(tripForm.fuelCost),
      tollCost:   Number(tripForm.tollCost),
      otherCost:  Number(tripForm.otherCost),
    })
    setShowTrip(false)
    setSaving(false)
  }

  async function handleAddDemand(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await addDemand({
      ...demandForm,
      date: new Date(demandForm.date).getTime(),
    })
    setShowDemand(false)
    setSaving(false)
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

      {/* My vehicle card */}
      <div>
        <div style={{
          fontSize:      11,
          color:         "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight:    500,
          marginBottom:  10,
        }}>
          Mon véhicule
        </div>
        {myVehicle ? (
          <div style={{
            background:   "var(--card)",
            border:       "0.5px solid var(--border)",
            borderRadius: 12,
            padding:      "18px 20px",
            display:      "flex",
            alignItems:   "center",
            gap:          16,
          }}>
            <div style={{
              width:          48,
              height:         48,
              borderRadius:   12,
              background:     "var(--accent-bg)",
              border:         "0.5px solid var(--border-focus)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       22,
              flexShrink:     0,
            }}>
              🚗
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                {myVehicle.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                {myVehicle.brand} {myVehicle.model} · {myVehicle.plate}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                📍 {myVehicle.location || "—"}
              </div>
            </div>
            <div style={{
              background:   "var(--ok-bg)",
              color:        "var(--ok-text)",
              border:       "0.5px solid var(--ok-border)",
              borderRadius: 6,
              padding:      "4px 10px",
              fontSize:     11,
              fontWeight:   500,
            }}>
              Assigné
            </div>
          </div>
        ) : (
          <div style={{
            background:   "var(--card)",
            border:       "0.5px solid var(--border)",
            borderRadius: 12,
            padding:      "24px",
            textAlign:    "center",
            color:        "var(--text-muted)",
            fontSize:     13,
          }}>
            Aucun véhicule assigné
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {([
          { key: "trips",   label: `Mes déplacements (${trips.length})`  },
          { key: "demands", label: `Mes demandes (${demands.length})`     },
        ] as const).map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            style={{
              background:   tab === tb.key ? "var(--accent-bg)" : "var(--card)",
              color:        tab === tb.key ? "var(--accent)"    : "var(--text-sub)",
              border:       `0.5px solid ${tab === tb.key ? "var(--border-focus)" : "var(--border)"}`,
              borderRadius: 7,
              padding:      "7px 16px",
              fontSize:     12,
              fontWeight:   tab === tb.key ? 500 : 400,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* TRIPS TAB */}
      {tab === "trips" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowTrip(v => !v)}
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
              + Nouveau déplacement
            </button>
          </div>

          {/* Trip form */}
          {showTrip && (
            <div style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 12,
              padding:      "22px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 18 }}>
                Déclarer un déplacement
              </div>
              <form onSubmit={handleAddTrip} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Vehicle select */}
                <div>
                  <label style={labelStyle}>Véhicule</label>
                  <select
                    value={tripForm.vehicleId}
                    onChange={e => setTripForm(f => ({ ...f, vehicleId: e.target.value }))}
                    style={{ ...inputStyle, appearance: "none" as any }}
                    required
                  >
                    <option value="">— Sélectionner —</option>
                    {vehicles.map(v => (
                      <option key={v.vehicleId} value={v.vehicleId}>
                        {v.name} — {v.plate}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={tripForm.date}
                    onChange={e => setTripForm(f => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Departure + Destination */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Départ</label>
                    <input
                      value={tripForm.departure}
                      onChange={e => setTripForm(f => ({ ...f, departure: e.target.value }))}
                      placeholder="Ville / Lieu de départ"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                      onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Destination</label>
                    <input
                      value={tripForm.destination}
                      onChange={e => setTripForm(f => ({ ...f, destination: e.target.value }))}
                      placeholder="Ville / Chantier"
                      style={inputStyle}
                      required
                      onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                      onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                    />
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <label style={labelStyle}>Distance (km)</label>
                  <input
                    type="number"
                    min={0}
                    value={tripForm.distanceKm}
                    onChange={e => setTripForm(f => ({ ...f, distanceKm: Number(e.target.value) }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                    onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                  />
                </div>

                {/* Costs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Carburant (DA)</label>
                    <input
                      type="number"
                      min={0}
                      value={tripForm.fuelCost}
                      onChange={e => setTripForm(f => ({ ...f, fuelCost: Number(e.target.value) }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                      onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Péage (DA)</label>
                    <input
                      type="number"
                      min={0}
                      value={tripForm.tollCost}
                      onChange={e => setTripForm(f => ({ ...f, tollCost: Number(e.target.value) }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                      onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Autres (DA)</label>
                    <input
                      type="number"
                      min={0}
                      value={tripForm.otherCost}
                      onChange={e => setTripForm(f => ({ ...f, otherCost: Number(e.target.value) }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                      onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                    />
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <label style={labelStyle}>Mode de paiement</label>
                  <select
                    value={tripForm.paymentMethod}
                    onChange={e => setTripForm(f => ({ ...f, paymentMethod: e.target.value as any }))}
                    style={{ ...inputStyle, appearance: "none" as any }}
                  >
                    <option value="cash">Espèces</option>
                    <option value="card">Carte bancaire</option>
                    <option value="jawaz">Jawaz</option>
                    <option value="autoroute">Autoroute (badge)</option>
                  </select>
                </div>

                {/* Card ref — show only if card */}
                {(tripForm.paymentMethod === "card" || tripForm.paymentMethod === "jawaz") && (
                  <div>
                    <label style={labelStyle}>Référence carte / badge</label>
                    <input
                      value={tripForm.cardRef}
                      onChange={e => setTripForm(f => ({ ...f, cardRef: e.target.value }))}
                      placeholder="N° carte ou badge"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                      onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea
                    value={tripForm.notes}
                    onChange={e => setTripForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Observations..."
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" as any }}
                    onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                    onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowTrip(false)}
                    style={{
                      flex: 1, padding: "10px 0",
                      background: "var(--card)", border: "0.5px solid var(--border)",
                      borderRadius: 8, color: "var(--text-sub)",
                      cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 2, padding: "10px 0",
                      background: "var(--accent)", color: "#fff",
                      border: "0.5px solid var(--border-focus)",
                      borderRadius: 8, cursor: saving ? "not-allowed" : "pointer",
                      fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Envoi..." : "Soumettre"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Trips list */}
          {trips.length === 0 ? (
            <div style={{
              background: "var(--card)", border: "0.5px solid var(--border)",
              borderRadius: 10, padding: 24, textAlign: "center",
              color: "var(--text-muted)", fontSize: 13,
            }}>
              Aucun déplacement déclaré
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {trips.map(trip => {
                const total = trip.fuelCost + trip.tollCost + trip.otherCost
                const vehicle = vehicles.find(v => v.vehicleId === trip.vehicleId)
                return (
                  <div key={trip.tripId} style={{
                    background:   "var(--card)",
                    border:       "0.5px solid var(--border)",
                    borderLeft:   `3px solid ${trip.status === "approved" ? "var(--ok-border)" : trip.status === "rejected" ? "var(--reject-border)" : "var(--pending-border)"}`,
                    borderRadius: 9,
                    padding:      "12px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>🚗</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                          {trip.departure || "—"} → {trip.destination}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          {vehicle?.name || "—"} · {new Date(trip.date).toLocaleDateString()}
                        </div>
                      </div>
                      <StatusBadge status={trip.status} />
                    </div>
                    <div style={{
                      display:             "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap:                 8,
                    }}>
                      {[
                        { label: "Distance",  value: `${trip.distanceKm} km` },
                        { label: "Carburant", value: `${trip.fuelCost} DA`   },
                        { label: "Péage",     value: `${trip.tollCost} DA`   },
                        { label: "Total",     value: `${total} DA`            },
                      ].map(f => (
                        <div
                          key={f.label}
                          style={{
                            background:   "var(--surface)",
                            borderRadius: 6,
                            padding:      "6px 8px",
                            textAlign:    "center",
                          }}
                        >
                          <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" }}>
                            {f.label}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", marginTop: 2 }}>
                            {f.value}
                          </div>
                        </div>
                      ))}
                    </div>
                    {trip.notes && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                        {trip.notes}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Paiement: {paymentLabels[trip.paymentMethod]}
                      {trip.cardRef ? ` · Réf: ${trip.cardRef}` : ""}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* DEMANDS TAB */}
      {tab === "demands" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowDemand(v => !v)}
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
              + Demander un véhicule
            </button>
          </div>

          {/* Demand form */}
          {showDemand && (
            <div style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 12,
              padding:      "22px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 18 }}>
                Demande de véhicule
              </div>
              <form onSubmit={handleAddDemand} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div>
                  <label style={labelStyle}>Véhicule souhaité</label>
                  <select
                    value={demandForm.vehicleId}
                    onChange={e => setDemandForm(f => ({ ...f, vehicleId: e.target.value }))}
                    style={{ ...inputStyle, appearance: "none" as any }}
                    required
                  >
                    <option value="">— Sélectionner —</option>
                    {vehicles.map(v => (
                      <option key={v.vehicleId} value={v.vehicleId}>
                        {v.name} — {v.plate} ({v.status === "available" ? "Disponible" : "Assigné"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Date souhaitée</label>
                  <input
                    type="date"
                    value={demandForm.date}
                    onChange={e => setDemandForm(f => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Destination</label>
                  <input
                    value={demandForm.destination}
                    onChange={e => setDemandForm(f => ({ ...f, destination: e.target.value }))}
                    placeholder="Où allez-vous ?"
                    style={inputStyle}
                    required
                    onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                    onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Motif</label>
                  <textarea
                    value={demandForm.reason}
                    onChange={e => setDemandForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder="Raison du déplacement..."
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" as any }}
                    required
                    onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                    onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowDemand(false)}
                    style={{
                      flex: 1, padding: "10px 0",
                      background: "var(--card)", border: "0.5px solid var(--border)",
                      borderRadius: 8, color: "var(--text-sub)",
                      cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 2, padding: "10px 0",
                      background: "var(--accent)", color: "#fff",
                      border: "0.5px solid var(--border-focus)",
                      borderRadius: 8, cursor: saving ? "not-allowed" : "pointer",
                      fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Envoi..." : "Envoyer la demande"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Demands list */}
          {demands.length === 0 ? (
            <div style={{
              background: "var(--card)", border: "0.5px solid var(--border)",
              borderRadius: 10, padding: 24, textAlign: "center",
              color: "var(--text-muted)", fontSize: 13,
            }}>
              Aucune demande
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {demands.map(d => {
                const vehicle = vehicles.find(v => v.vehicleId === d.vehicleId)
                return (
                  <div key={d.demandId} style={{
                    background:   "var(--card)",
                    border:       "0.5px solid var(--border)",
                    borderLeft:   `3px solid ${d.status === "approved" ? "var(--ok-border)" : d.status === "rejected" ? "var(--reject-border)" : "var(--pending-border)"}`,
                    borderRadius: 9,
                    padding:      "12px 16px",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          12,
                  }}>
                    <span style={{ fontSize: 20 }}>🚗</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                        {vehicle?.name || "—"} · {d.destination}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {new Date(d.date).toLocaleDateString()} · {d.reason}
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkerVehiclesPage() {
  return (
    <RoleGuard allowedRoles={["worker"]}>
      <AppLayout title="Véhicules">
        <WorkerVehiclesContent />
      </AppLayout>
    </RoleGuard>
  )
}