"use client"

import { useEffect, useState } from "react"
import AppLayout from "../../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { getUsersByAdmin, getProductsByAdmin } from "@/lib/firestore"
import type { AppUser, Product } from "@/types"

function AdminStatsContent() {
  const { appUser }             = useAuth()
  const { t }                   = useLang()
  const [users,    setUsers]    = useState<AppUser[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!appUser) return
    Promise.all([
      getUsersByAdmin(appUser.adminId),
      getProductsByAdmin(appUser.adminId),
    ]).then(([u, p]) => {
      setUsers(u)
      setProducts(p)
      setLoading(false)
    })
  }, [appUser])

  const pending  = products.filter(p => p.status === "pending").length
  const approved = products.filter(p => p.status === "approved").length
  const rejected = products.filter(p => p.status === "rejected").length
  const workers  = users.filter(u => u.role === "worker").length
  const managers = users.filter(u => u.role === "manager").length

  const stats = [
    { label: t.admin.totalUsers,    value: users.length,    color: "var(--text)"         },
    { label: t.admin.totalWorkers,  value: workers,         color: "var(--ok-text)"      },
    { label: t.admin.totalManagers, value: managers,        color: "var(--accent)"       },
    { label: t.dashboard.submissions, value: products.length, color: "var(--text)"       },
    { label: t.dashboard.pending,   value: pending,         color: "var(--pending-text)" },
    { label: t.dashboard.approved,  value: approved,        color: "var(--ok-text)"      },
    { label: t.dashboard.rejected,  value: rejected,        color: "var(--reject-text)"  },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
        {t.nav.stats}
      </div>

      {loading ? (
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        40,
        }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap:                 10,
          }}>
            {stats.map(s => (
              <div
                key={s.label}
                style={{
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 10,
                  padding:      "18px 20px",
                }}
              >
                <div style={{
                  fontSize:   28,
                  fontWeight: 600,
                  color:      s.color,
                  lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize:      11,
                  color:         "var(--text-muted)",
                  marginTop:     6,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Recent products */}
          <div>
            <div style={{
              fontSize:      11,
              color:         "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight:    500,
              marginBottom:  10,
            }}>
              {t.dashboard.recentActivity}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {products.slice(0, 10).map(p => {
                const s = {
                  pending:  { bg: "var(--pending-bg)", text: "var(--pending-text)", border: "var(--pending-border)" },
                  approved: { bg: "var(--ok-bg)",      text: "var(--ok-text)",      border: "var(--ok-border)"      },
                  rejected: { bg: "var(--reject-bg)",  text: "var(--reject-text)",  border: "var(--reject-border)"  },
                }[p.status]
                return (
                  <div
                    key={p.productId}
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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {p.submittedByName} · {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      background:   s.bg,
                      color:        s.text,
                      border:       `0.5px solid ${s.border}`,
                      borderRadius: 4,
                      padding:      "2px 8px",
                      fontSize:     10,
                      fontWeight:   500,
                    }}>
                      {p.status}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminStatsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AppLayout title="Statistiques">
        <AdminStatsContent />
      </AppLayout>
    </RoleGuard>
  )
}