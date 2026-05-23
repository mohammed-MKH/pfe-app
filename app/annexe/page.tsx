"use client"

import { useState } from "react"
import AppLayout    from "../../components/layout/AppLayout"
import RoleGuard    from "@/components/guards/RoleGuard"
import AnnexeTable  from "@/components/annexe/AnnexeTable"
import { useAnnexe } from "@/hooks/useAnnexe"
import { useLang }   from "@/hooks/useLang"

function AnnexeContent() {
  const { t }                       = useLang()
  const { annexes, loading, createAnnexe } = useAnnexe(null)
  const [activeId, setActiveId]     = useState<string | null>(null)

  if (loading) {
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

  if (annexes.length === 0) {
    return (
      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        60,
        flexDirection:  "column",
        gap:            12,
        color:          "var(--text-muted)",
        fontSize:       13,
      }}>
        <div>Aucune annexe disponible</div>
        <div style={{ fontSize: 11 }}>
          L'administrateur doit créer une annexe.
        </div>
      </div>
    )
  }

  const active = activeId || annexes[0]?.annexeId

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Annexe tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {annexes.map(a => (
          <button
            key={a.annexeId}
            onClick={() => setActiveId(a.annexeId)}
            style={{
              background:   active === a.annexeId
                ? "var(--accent-bg)"
                : "var(--card)",
              color:        active === a.annexeId
                ? "var(--accent)"
                : "var(--text-sub)",
              border:       `0.5px solid ${active === a.annexeId
                ? "var(--border-focus)"
                : "var(--border)"}`,
              borderRadius: 7,
              padding:      "7px 16px",
              fontSize:     12,
              fontWeight:   active === a.annexeId ? 500 : 400,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            {a.title}
          </button>
        ))}
      </div>

      {active && (
        <AnnexeTable
          annexeId={active}
          isAdmin={false}
        />
      )}
    </div>
  )
}

export default function AnnexePage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <AppLayout title="Annexe">
        <AnnexeContent />
      </AppLayout>
    </RoleGuard>
  )
}