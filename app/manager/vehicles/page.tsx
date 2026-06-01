"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useVehicles } from "@/hooks/useVehicles"
import type { VehicleTrip, VehicleDemand } from "@/types"

type Tab = "fleet" | "trips" | "demands"

const paymentLabels: Record<string, string> = {
  cash:      "Espèces",
  card:      "Carte",
  jawaz:     "Jawaz",
  autoroute: "Autoroute",
}

function StatusBadge({ status }: { status: string }) {
  const s = {
    pending:  { bg: "var(--pending-bg)",  text: "var(--pending-text)",  border: "var(--pending-border)",  label: "En attente" },
    approved: { bg: "var(--ok-bg)",       text: "var(--ok-text)",       border: "var(--ok-border)",       label: "Approuvé"   },
    rejected: { bg: "var(--reject-bg)",   text: "var(--reject-text)",   border: "var(--reject-border)",   label: "Rejeté"     },
    available:   { bg: "var(--ok-bg)",    text: "var(--ok-text)",       border: "var(--ok-border)",       label: "Disponible" },
    assigned:    { bg: "var(--accent-bg)",text: "var(--accent)",        border: "var(--border-focus)",    label: "Assigné"    },
    maintenance: { bg: "var(--pending-bg)", text: "var(--pending-text)", border: "var(--pending-border)", label: "Maintenance"},
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

function ManagerVehiclesContent() {
  const { appUser }                                    = useAuth()
  const { vehicles, trips, demands, loading,
          reviewTrip, reviewDemand }                   = useVehicles()
  const [tab,       setTab]                            = useState<Tab>("fleet")
  const [reviewing, setReviewing]                      = useState<string | null>(null)

  const totalTrips   = trips.length
  const totalFuel    = trips.reduce((s, t) => s + t.fuelCost, 0)
  const totalToll    = trips.reduce((s, t) => s + t.tollCost, 0)
  const totalCost    = trips.reduce((s, t) => s + t.fuelCost + t.tollCost + t.otherCost, 0)
  const pendingTrips = trips.filter(t => t.status === "pending").length
  const pendingDems  = demands.filter(d => d.status === "pending").length

  async function handleReviewTrip(
    tripId: string,
    status: "approved" | "rejected"
  ) {
    if (!appUser) return
    setReviewing(tripId)
    await reviewTrip(tripId, status, appUser.uid)
    setReviewing(null)
  }

  async function handleReviewDemand(
    demandId: string,
    status: "approved" | "rejected"
  ) {
    if (!appUser) return
    setReviewing(demandId)
    await reviewDemand(demandId, status, appUser.uid)
    setReviewing(null)
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

      {/* Stats */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap:                 10,
      }}>
        {[
          { label: "Véhicules",        value: vehicles.length,  color: "var(--text)"         },
          { label: "Déplacements",     value: totalTrips,       color: "var(--text)"         },
          { label: "En attente",       value: pendingTrips + pendingDems, color: "var(--pending-text)" },
          { label: "Carburant total",  value: `${totalFuel} DA`, color: "var(--ok-text)"     },
          { label: "Péages total",     value: `${totalToll} DA`, color: "var(--accent)"      },
          { label: "Coût total",       value: `${totalCost} DA`, color: "var(--text)"        },
        ].map(s => (
          <div key={s.label} style={{
            background:   "var(--card)",
            border:       "0.5px solid var(--border)",
            borderRadius: 10,
            padding:      "14px 16px",
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{
              fontSize:      10,
              color:         "var(--text-muted)",
              marginTop:     5,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {([
          { key: "fleet",   label: `Flotte (${vehicles.length})`         },
          { key: "trips",   label: `Déplacements (${pendingTrips} 🔴)`   },
          { key: "demands", label: `Demandes (${pendingDems} 🔴)`        },
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

      {/* FLEET TAB */}
      {tab === "fleet" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {vehicles.length === 0 ? (
            <div style={{
              background: "var(--card)", border: "0.5px solid var(--border)",
              borderRadius: 10, padding: 32, textAlign: "center",
              color: "var(--text-muted)", fontSize: 13,
            }}>
              Aucun véhicule — l'admin doit ajouter des véhicules
            </div>
          ) : (
            vehicles.map(v => (
              <div key={v.vehicleId} style={{
                background:   "var(--card)",
                border:       "0.5px solid var(--border)",
                borderRadius: 10,
                padding:      "14px 18px",
                display:      "flex",
                alignItems:   "center",
                gap:          14,
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>🚗</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {v.brand} {v.model} · {v.plate} · {v.year}
                  </div>
                  {v.assignedTo && (
                    <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>
                      👤 {v.assignedName}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    📍 {v.location || "—"}
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))
          )}
        </div>
      )}

      {/* TRIPS TAB */}
      {tab === "trips" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {trips.length === 0 ? (
            <div style={{
              background: "var(--card)", border: "0.5px solid var(--border)",
              borderRadius: 10, padding: 24, textAlign: "center",
              color: "var(--text-muted)", fontSize: 13,
            }}>
              Aucun déplacement déclaré
            </div>
          ) : (
            trips.map(trip => {
              const vehicle = vehicles.find(v => v.vehicleId === trip.vehicleId)
              const total   = trip.fuelCost + trip.tollCost + trip.otherCost
              const isRev   = reviewing === trip.tripId
              return (
                <div key={trip.tripId} style={{
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderLeft:   `3px solid ${trip.status === "approved" ? "var(--ok-border)" : trip.status === "rejected" ? "var(--reject-border)" : "var(--pending-border)"}`,
                  borderRadius: 9,
                  padding:      "14px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>🚗</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                        {trip.departure || "—"} → {trip.destination}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {trip.driverName} · {vehicle?.name || "—"} · {new Date(trip.date).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>

                  <div style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap:                 8,
                    marginBottom:        10,
                  }}>
                    {[
                      { label: "Distance",  value: `${trip.distanceKm} km` },
                      { label: "Carburant", value: `${trip.fuelCost} DA`   },
                      { label: "Péage",     value: `${trip.tollCost} DA`   },
                      { label: "Total",     value: `${total} DA`            },
                    ].map(f => (
                      <div key={f.label} style={{
                        background: "var(--surface)", borderRadius: 6,
                        padding: "6px 8px", textAlign: "center",
                      }}>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" }}>
                          {f.label}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", marginTop: 2 }}>
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                    Paiement: {paymentLabels[trip.paymentMethod]}
                    {trip.cardRef ? ` · Réf: ${trip.cardRef}` : ""}
                    {trip.notes ? ` · ${trip.notes}` : ""}
                  </div>

                  {trip.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleReviewTrip(trip.tripId, "rejected")}
                        disabled={!!isRev}
                        style={{
                          flex: 1, padding: "8px 0",
                          background:   "var(--btn-danger-bg)",
                          color:        "var(--btn-danger-text)",
                          border:       "0.5px solid var(--btn-danger-border)",
                          borderRadius: 7, cursor: isRev ? "not-allowed" : "pointer",
                          fontSize: 12, fontFamily: "inherit",
                        }}
                      >
                        ✕ Rejeter
                      </button>
                      <button
                        onClick={() => handleReviewTrip(trip.tripId, "approved")}
                        disabled={!!isRev}
                        style={{
                          flex: 2, padding: "8px 0",
                          background:   "var(--btn-green-bg)",
                          color:        "var(--btn-green-text)",
                          border:       "0.5px solid var(--btn-green-border)",
                          borderRadius: 7, cursor: isRev ? "not-allowed" : "pointer",
                          fontSize: 12, fontFamily: "inherit",
                        }}
                      >
                        {isRev ? "..." : "✓ Approuver"}
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* DEMANDS TAB */}
      {tab === "demands" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {demands.length === 0 ? (
            <div style={{
              background: "var(--card)", border: "0.5px solid var(--border)",
              borderRadius: 10, padding: 24, textAlign: "center",
              color: "var(--text-muted)", fontSize: 13,
            }}>
              Aucune demande de véhicule
            </div>
          ) : (
            demands.map(d => {
              const vehicle = vehicles.find(v => v.vehicleId === d.vehicleId)
              const isRev   = reviewing === d.demandId
              return (
                <div key={d.demandId} style={{
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderLeft:   `3px solid ${d.status === "approved" ? "var(--ok-border)" : d.status === "rejected" ? "var(--reject-border)" : "var(--pending-border)"}`,
                  borderRadius: 9,
                  padding:      "14px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>🚗</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                        {vehicle?.name || "—"} → {d.destination}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {d.requesterName} · {new Date(d.date).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Motif: {d.reason}
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>

                  {d.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleReviewDemand(d.demandId, "rejected")}
                        disabled={!!isRev}
                        style={{
                          flex: 1, padding: "8px 0",
                          background: "var(--btn-danger-bg)",
                          color: "var(--btn-danger-text)",
                          border: "0.5px solid var(--btn-danger-border)",
                          borderRadius: 7, cursor: isRev ? "not-allowed" : "pointer",
                          fontSize: 12, fontFamily: "inherit",
                        }}
                      >
                        ✕ Refuser
                      </button>
                      <button
                        onClick={() => handleReviewDemand(d.demandId, "approved")}
                        disabled={!!isRev}
                        style={{
                          flex: 2, padding: "8px 0",
                          background: "var(--btn-green-bg)",
                          color: "var(--btn-green-text)",
                          border: "0.5px solid var(--btn-green-border)",
                          borderRadius: 7, cursor: isRev ? "not-allowed" : "pointer",
                          fontSize: 12, fontFamily: "inherit",
                        }}
                      >
                        {isRev ? "..." : "✓ Approuver"}
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function ManagerVehiclesPage() {
  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <AppLayout title="Véhicules — Manager">
        <ManagerVehiclesContent />
      </AppLayout>
    </RoleGuard>
  )
}