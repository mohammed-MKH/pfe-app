"use client"

import { useEffect, useState } from "react"
import AppLayout from "../../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { getUsersByAdmin } from "@/lib/firestore"
import type { AppUser } from "@/types"

function TeamContent() {
  const { appUser }         = useAuth()
  const { t }               = useLang()
  const [members, setMembers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appUser) return
    getUsersByAdmin(appUser.adminId).then(data => {
      setMembers(data.filter(u => u.uid !== appUser.uid))
      setLoading(false)
    })
  }, [appUser])

  const roleColor = (role: string) => ({
    worker:  { bg: "var(--ok-bg)",      text: "var(--ok-text)",      border: "var(--ok-border)"      },
    manager: { bg: "var(--accent-bg)",  text: "var(--accent)",       border: "var(--border-focus)"   },
    admin:   { bg: "var(--pending-bg)", text: "var(--pending-text)", border: "var(--pending-border)" },
  }[role] || { bg: "var(--card)", text: "var(--text-sub)", border: "var(--border)" })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{
        fontSize:   16,
        fontWeight: 600,
        color:      "var(--text)",
      }}>
        {t.manager.teamTitle}
        <span style={{
          fontSize:    12,
          fontWeight:  400,
          color:       "var(--text-muted)",
          marginLeft:  10,
        }}>
          {members.length} {t.common.rows}
        </span>
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
      ) : members.length === 0 ? (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 10,
          padding:      32,
          textAlign:    "center",
          color:        "var(--text-muted)",
          fontSize:     13,
        }}>
          {t.manager.noTeam}
        </div>
      ) : (
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap:                 10,
        }}>
          {members.map(m => {
            const rc = roleColor(m.role)
            return (
              <div
                key={m.uid}
                style={{
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 10,
                  padding:      "16px 18px",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          12,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width:          40,
                  height:         40,
                  borderRadius:   10,
                  background:     "var(--accent-bg)",
                  border:         "0.5px solid var(--border-focus)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       14,
                  fontWeight:     500,
                  color:          "var(--accent)",
                  flexShrink:     0,
                }}>
                  {m.displayName.slice(0, 2).toUpperCase()}
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
                    {m.displayName}
                  </div>
                  <div style={{
                    fontSize:     11,
                    color:        "var(--text-muted)",
                    marginTop:    3,
                    whiteSpace:   "nowrap",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {m.email}
                  </div>
                </div>

                {/* Role badge */}
                <div style={{
                  background:   rc.bg,
                  color:        rc.text,
                  border:       `0.5px solid ${rc.border}`,
                  borderRadius: 4,
                  padding:      "2px 8px",
                  fontSize:     10,
                  fontWeight:   500,
                  flexShrink:   0,
                }}>
                  {m.role}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TeamPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <AppLayout title="Équipe">
        <TeamContent />
      </AppLayout>
    </RoleGuard>
  )
}