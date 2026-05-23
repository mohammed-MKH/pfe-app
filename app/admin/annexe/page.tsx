"use client"

import { useState } from "react"
import AppLayout    from "../../../components/layout/AppLayout"
import RoleGuard    from "@/components/guards/RoleGuard"
import AnnexeTable  from "@/components/annexe/AnnexeTable"
import { useAnnexe } from "@/hooks/useAnnexe"
import { useLang }   from "@/hooks/useLang"

function AdminAnnexeContent() {
  const { t }                                        = useLang()
  const { annexes, loading, createAnnexe }           = useAnnexe(null)
  const [activeId,  setActiveId]                     = useState<string | null>(null)
  const [newTitle,  setNewTitle]                     = useState("")
  const [creating,  setCreating]                     = useState(false)
  const [showForm,  setShowForm]                     = useState(false)

  async function handleCreate() {
    if (!newTitle.trim()) return
    setCreating(true)
    const id = await createAnnexe(newTitle.trim())
    setActiveId(id)
    setNewTitle("")
    setShowForm(false)
    setCreating(false)
  }

  const active = activeId || annexes[0]?.annexeId

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          flex:       1,
          fontSize:   16,
          fontWeight: 600,
          color:      "var(--text)",
        }}>
          {t.annexe.title}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn btn-green"
        >
          + Nouvelle annexe
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 10,
          padding:      "16px 20px",
          display:      "flex",
          gap:          10,
          alignItems:   "center",
        }}>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Titre de l'annexe (ex: Annexe N°01)"
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            style={{
              flex:         1,
              background:   "var(--input-bg)",
              border:       "0.5px solid var(--input-border)",
              borderRadius: 7,
              color:        "var(--input-text)",
              padding:      "9px 14px",
              fontSize:     13,
              fontFamily:   "inherit",
              outline:      "none",
            }}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newTitle.trim()}
            className="btn btn-green"
          >
            {creating ? "..." : t.common.save}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="btn btn-primary"
          >
            {t.common.cancel}
          </button>
        </div>
      )}

      {/* Annexe tabs */}
      {annexes.length > 0 && (
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
      )}

      {/* Table */}
      {loading ? (
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        60,
        }}>
          <div className="spinner" />
        </div>
      ) : annexes.length === 0 ? (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 10,
          padding:      40,
          textAlign:    "center",
          color:        "var(--text-muted)",
          fontSize:     13,
        }}>
          Créez votre première annexe ci-dessus
        </div>
      ) : active ? (
        <AnnexeTable
          annexeId={active}
          isAdmin={true}
        />
      ) : null}
    </div>
  )
}

export default function AdminAnnexePage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AppLayout title="Annexe — Admin">
        <AdminAnnexeContent />
      </AppLayout>
    </RoleGuard>
  )
}