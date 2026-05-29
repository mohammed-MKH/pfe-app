"use client"

import { useState } from "react"
import AppLayout   from "@/components/layout/AppLayout"
import RoleGuard   from "@/components/guards/RoleGuard"
import AnnexeTable from "@/components/annexe/AnnexeTable"
import { useAnnexe } from "@/hooks/useAnnexe"
import { useLang }   from "@/hooks/useLang"

function AdminAnnexeContent() {
  const { t }                                          = useLang()
  const { annexes, loading, createAnnexe, removeAnnexe } = useAnnexe(null)
  const [activeId,     setActiveId]                    = useState<string | null>(null)
  const [newTitle,     setNewTitle]                    = useState("")
  const [creating,     setCreating]                    = useState(false)
  const [showForm,     setShowForm]                    = useState(false)
  const [showConfirm,  setShowConfirm]                 = useState<string | null>(null)
  const [deleting,     setDeleting]                    = useState(false)

  async function handleCreate() {
    if (!newTitle.trim()) return
    setCreating(true)
    const id = await createAnnexe(newTitle.trim())
    setActiveId(id)
    setNewTitle("")
    setShowForm(false)
    setCreating(false)
  }

  async function handleDelete(annexeId: string) {
    setDeleting(true)
    await removeAnnexe(annexeId)
    if (activeId === annexeId) setActiveId(null)
    setShowConfirm(null)
    setDeleting(false)
  }

  const active = activeId || annexes[0]?.annexeId

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Delete confirm modal */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(null)}
          style={{
            position:       "fixed",
            inset:          0,
            background:     "rgba(0,0,0,0.55)",
            zIndex:         999,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 12,
              padding:      24,
              width:        320,
              boxShadow:    "var(--shadow-md)",
            }}
          >
            <div style={{
              fontSize:     14,
              fontWeight:   600,
              color:        "var(--text)",
              marginBottom: 8,
            }}>
              Supprimer cette annexe ?
            </div>
            <div style={{
              fontSize:     12,
              color:        "var(--text-muted)",
              marginBottom: 20,
              lineHeight:   1.6,
            }}>
              Toutes les lignes de cette annexe seront supprimées définitivement.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowConfirm(null)}
                style={{
                  flex:         1,
                  padding:      "9px 0",
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 8,
                  color:        "var(--text-sub)",
                  cursor:       "pointer",
                  fontSize:     12,
                  fontFamily:   "inherit",
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showConfirm)}
                disabled={deleting}
                style={{
                  flex:         1,
                  padding:      "9px 0",
                  background:   "var(--btn-danger-bg)",
                  border:       "0.5px solid var(--btn-danger-border)",
                  borderRadius: 8,
                  color:        "var(--btn-danger-text)",
                  cursor:       deleting ? "not-allowed" : "pointer",
                  fontSize:     12,
                  fontFamily:   "inherit",
                  opacity:      deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
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
            placeholder="Titre (ex: Annexe N°01 — Éclairage)"
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            autoFocus
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
            onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
            onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newTitle.trim()}
            className="btn btn-green"
          >
            {creating ? "..." : t.common.save}
          </button>
          <button
            onClick={() => { setShowForm(false); setNewTitle("") }}
            className="btn btn-primary"
          >
            {t.common.cancel}
          </button>
        </div>
      )}

      {/* Annexe tabs with delete button */}
      {annexes.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {annexes.map((a: any) => (
            <div
              key={a.annexeId}
              style={{ display: "flex", alignItems: "center" }}
            >
              <button
                onClick={() => setActiveId(a.annexeId)}
                style={{
                  background:   active === a.annexeId ? "var(--accent-bg)" : "var(--card)",
                  color:        active === a.annexeId ? "var(--accent)"    : "var(--text-sub)",
                  border:       `0.5px solid ${active === a.annexeId ? "var(--border-focus)" : "var(--border)"}`,
                  borderRight:  "none",
                  borderRadius: "7px 0 0 7px",
                  padding:      "7px 16px",
                  fontSize:     12,
                  fontWeight:   active === a.annexeId ? 500 : 400,
                  cursor:       "pointer",
                  fontFamily:   "inherit",
                }}
              >
                {a.title}
              </button>
              <button
                onClick={() => setShowConfirm(a.annexeId)}
                title="Supprimer cette annexe"
                style={{
                  background:   "var(--btn-danger-bg)",
                  color:        "var(--btn-danger-text)",
                  border:       `0.5px solid var(--btn-danger-border)`,
                  borderRadius: "0 7px 7px 0",
                  padding:      "7px 9px",
                  fontSize:     11,
                  cursor:       "pointer",
                  fontFamily:   "inherit",
                  lineHeight:   1,
                }}
              >
                ✕
              </button>
            </div>
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
        <AnnexeTable annexeId={active} isAdmin={true} />
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