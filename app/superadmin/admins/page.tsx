"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import AppLayout from "../../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useLang } from "@/hooks/useLang"
import { getAdmin, getUsersByAdmin, getProductsByAdmin } from "@/lib/firestore"
import type { Admin, AppUser, Product } from "@/types"

function AdminStatsContent() {
  const { t }                   = useLang()
  const router                  = useRouter()
  const searchParams            = useSearchParams()
  const adminId                 = searchParams.get("id")
  const [admin,    setAdmin]    = useState<Admin | null>(null)
  const [users,    setUsers]    = useState<AppUser[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!adminId) return
    Promise.all([
      getAdmin(adminId),
      getUsersByAdmin(adminId),
      getProductsByAdmin(adminId),
    ]).then(([a, u, p]) => {
      setAdmin(a)
      setUsers(u)
      setProducts(p)
      setLoading(false)
    })
  }, [adminId])

  if (!adminId) {
    return (
      <div style={{
        color:     "var(--text-muted)",
        fontSize:  13,
        textAlign: "center",
        padding:   40,
      }}>
        Aucun admin sélectionné
      </div>
    )
  }

  const pending  = products.filter(p => p.status === "pending").length
  const approved = products.filter(p => p.status === "approved").length
  const rejected = products.filter(p => p.status === "rejected").length
  const workers  = users.filter(u => u.role === "worker").length
  const managers = users.filter(u => u.role === "manager").length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Back */}
      <button
        onClick={() => router.push("/superadmin")}
        style={{
          background: "none",
          border:     "none",
          color:      "var(--text-muted)",
          fontSize:   12,
          cursor:     "pointer",
          padding:    0,
          fontFamily: "inherit",
          display:    "flex",
          alignItems: "center",
          gap:        6,
          width:      "fit-content",
        }}
      >
        ← {t.common.back}
      </button>

      {loading ? (
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        60,
        }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Admin info */}
          {admin && (
            <div style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 12,
              padding:      "20px 24px",
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
                fontSize:       18,
                fontWeight:     500,
                color:          "var(--accent)",
              }}>
                {admin.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{
                  fontSize:   16,
                  fontWeight: 600,
                  color:      "var(--text)",
                }}>
                  {admin.displayName}
                </div>
                <div style={{
                  fontSize:  12,
                  color:     "var(--text-muted)",
                  marginTop: 3,
                }}>
                  {admin.organizationName} · {admin.email}
                </div>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap:                 10,
          }}>
            {[
              { label: t.admin.totalUsers,      value: users.length,      color: "var(--text)"          },
              { label: t.admin.totalWorkers,    value: workers,           color: "var(--ok-text)"       },
              { label: t.admin.totalManagers,   value: managers,          color: "var(--accent)"        },
              { label: t.dashboard.submissions, value: products.length,   color: "var(--text)"          },
              { label: t.dashboard.pending,     value: pending,           color: "var(--pending-text)"  },
              { label: t.dashboard.approved,    value: approved,          color: "var(--ok-text)"       },
              { label: t.dashboard.rejected,    value: rejected,          color: "var(--reject-text)"   },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 10,
                  padding:      "16px 18px",
                }}
              >
                <div style={{
                  fontSize:   24,
                  fontWeight: 600,
                  color:      s.color,
                  lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize:      11,
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

          {/* Members list */}
          <div>
            <div style={{
              fontSize:      11,
              color:         "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight:    500,
              marginBottom:  10,
            }}>
              Membres
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {users.map(u => (
                <div
                  key={u.uid}
                  style={{
                    background:   "var(--card)",
                    border:       "0.5px solid var(--border)",
                    borderRadius: 8,
                    padding:      "10px 14px",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          12,
                  }}
                >
                  <div style={{
                    width:          30,
                    height:         30,
                    borderRadius:   7,
                    background:     "var(--accent-bg)",
                    border:         "0.5px solid var(--border-focus)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       11,
                    fontWeight:     500,
                    color:          "var(--accent)",
                    flexShrink:     0,
                  }}>
                    {u.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
                      {u.displayName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {u.email}
                    </div>
                  </div>
                  <div style={{
                    background:   u.role === "manager" ? "var(--accent-bg)" : "var(--ok-bg)",
                    color:        u.role === "manager" ? "var(--accent)"    : "var(--ok-text)",
                    border:       `0.5px solid ${u.role === "manager" ? "var(--border-focus)" : "var(--ok-border)"}`,
                    borderRadius: 4,
                    padding:      "2px 8px",
                    fontSize:     10,
                    fontWeight:   500,
                  }}>
                    {u.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function SuperAdminAdminsPage() {
  return (
    <RoleGuard allowedRoles={["superadmin"]}>
      <AppLayout title="Admin Stats">
        <AdminStatsContent />
      </AppLayout>
    </RoleGuard>
  )
}