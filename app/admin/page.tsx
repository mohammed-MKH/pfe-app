"use client"

import { useRouter } from "next/navigation"
import AppLayout from "../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"

export default function AdminPage() {
  const { appUser } = useAuth()
  const { t } = useLang()
  const router = useRouter()

  const cards = [
    {
      label: t.nav.users,
      path:  "/admin/users",
      icon:  "◎",
      desc:  "Créer et gérer les membres",
    },
    {
      label: t.nav.annexe,
      path:  "/admin/annexe",
      icon:  "≡",
      desc:  "Gérer les annexes de suivi",
    },
    {
      label: t.nav.stats,
      path:  "/admin/stats",
      icon:  "◫",
      desc:  "Statistiques de l'organisation",
    },
  ]

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AppLayout title={t.admin.title}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>
              {t.admin.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {appUser?.displayName} · {appUser?.email}
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10,
          }}>
            {cards.map(card => (
              <button
                key={card.path}
                onClick={() => router.push(card.path)}
                style={{
                  background:    "var(--card)",
                  border:        "0.5px solid var(--border)",
                  borderRadius:  10,
                  padding:       "20px",
                  cursor:        "pointer",
                  textAlign:     "left",
                  fontFamily:    "inherit",
                  display:       "flex",
                  flexDirection: "column",
                  gap:           8,
                }}
              >
                <div style={{ fontSize: 24 }}>{card.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {card.desc}
                </div>
              </button>
            ))}
          </div>

        </div>
      </AppLayout>
    </RoleGuard>
  )
}