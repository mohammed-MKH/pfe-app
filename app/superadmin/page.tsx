"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { getAllAdmins } from "@/lib/firestore"
import { createAdminAccount } from "@/lib/auth"
import type { Admin } from "@/types"

function SuperAdminContent() {
  const { appUser }             = useAuth()
  const { t }                   = useLang()
  const router                  = useRouter()
  const [admins,   setAdmins]   = useState<Admin[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error,    setError]    = useState("")
  const [success,  setSuccess]  = useState("")

  const [form, setForm] = useState({
    displayName:      "",
    email:            "",
    password:         "",
    organizationName: "",
  })

  useEffect(() => {
    getAllAdmins().then(data => {
      setAdmins(data)
      setLoading(false)
    })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!appUser) return
    if (!form.displayName || !form.email || !form.password || !form.organizationName) {
      setError("Tous les champs sont requis")
      return
    }
    setCreating(true)
    setError("")
    try {
      const { admin } = await createAdminAccount({
        email:            form.email,
        password:         form.password,
        displayName:      form.displayName,
        organizationName: form.organizationName,
        createdBy:        appUser.uid,
      })
      setAdmins(prev => [...prev, admin])
      setForm({ displayName: "", email: "", password: "", organizationName: "" })
      setShowForm(false)
      setSuccess(`Admin ${form.displayName} créé avec succès`)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: any) {
      setError(err.message || t.common.error)
    } finally {
      setCreating(false)
    }
  }

  const inputStyle = {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>
            {t.superAdmin.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
            {admins.length} {t.superAdmin.admins}
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
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
          + {t.superAdmin.createAdmin}
        </button>
      </div>

      {/* SUCCESS */}
      {success && (
        <div style={{
          background:   "var(--ok-bg)",
          border:       "0.5px solid var(--ok-border)",
          borderRadius: 8,
          padding:      "10px 14px",
          fontSize:     12,
          color:        "var(--ok-text)",
        }}>
          ✓ {success}
        </div>
      )}

      {/* CREATE FORM */}
      {showForm && (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          padding:      "24px",
        }}>
          <div style={{
            fontSize:     14,
            fontWeight:   500,
            color:        "var(--text)",
            marginBottom: 20,
          }}>
            {t.superAdmin.createAdmin}
          </div>

          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 14,
            }}>
              <div>
                <label style={labelStyle}>{t.admin.displayName}</label>
                <input
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  placeholder="Nom de l'admin"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>

              <div>
                <label style={labelStyle}>{t.superAdmin.orgName}</label>
                <input
                  value={form.organizationName}
                  onChange={e => setForm(f => ({ ...f, organizationName: e.target.value }))}
                  placeholder="Nom de l'organisation"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>

              <div>
                <label style={labelStyle}>{t.superAdmin.adminEmail}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@organisation.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>

              <div>
                <label style={labelStyle}>{t.superAdmin.adminPassword}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 caractères"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>
            </div>

            {error && (
              <div style={{
                background:   "var(--reject-bg)",
                border:       "0.5px solid var(--reject-border)",
                borderRadius: 7,
                padding:      "9px 12px",
                fontSize:     12,
                color:        "var(--reject-text)",
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError("") }}
                style={{
                  flex:         1,
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 8,
                  color:        "var(--text-sub)",
                  padding:      "10px 0",
                  fontSize:     13,
                  cursor:       "pointer",
                  fontFamily:   "inherit",
                }}
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  flex:         2,
                  background:   "var(--accent)",
                  color:        "#fff",
                  border:       "0.5px solid var(--border-focus)",
                  borderRadius: 8,
                  padding:      "10px 0",
                  fontSize:     13,
                  fontWeight:   500,
                  cursor:       creating ? "not-allowed" : "pointer",
                  fontFamily:   "inherit",
                  opacity:      creating ? 0.7 : 1,
                }}
              >
                {creating ? t.superAdmin.creating : t.common.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STATS */}
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "Total admins",        value: admins.length },
          { label: "Admins actifs",        value: admins.filter(a => a.isActive).length },
          { label: "Total membres",        value: admins.reduce((s, a) => s + a.memberCount, 0) },
        ].map(s => (
          <div
            key={s.label}
            style={{
              flex:         1,
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 10,
              padding:      "16px 18px",
            }}
          >
            <div style={{
              fontSize:   24,
              fontWeight: 600,
              color:      "var(--text)",
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

      {/* ADMINS LIST */}
      {loading ? (
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        40,
        }}>
          <div className="spinner" />
        </div>
      ) : admins.length === 0 ? (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 10,
          padding:      32,
          textAlign:    "center",
          color:        "var(--text-muted)",
          fontSize:     13,
        }}>
          {t.superAdmin.noAdmins}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {admins.map(admin => (
            <div
              key={admin.adminId}
              style={{
                background:   "var(--card)",
                border:       "0.5px solid var(--border)",
                borderRadius: 10,
                padding:      "16px 20px",
                display:      "flex",
                alignItems:   "center",
                gap:          14,
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
                {admin.displayName.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize:   13,
                  fontWeight: 500,
                  color:      "var(--text)",
                }}>
                  {admin.displayName}
                </div>
                <div style={{
                  fontSize:  11,
                  color:     "var(--text-muted)",
                  marginTop: 3,
                }}>
                  {admin.email}
                </div>
              </div>

              {/* Org name */}
              <div style={{
                fontSize:   12,
                color:      "var(--text-sub)",
                flexShrink: 0,
                maxWidth:   160,
                overflow:   "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {admin.organizationName}
              </div>

              {/* Member count */}
              <div style={{
                background:   "var(--surface)",
                border:       "0.5px solid var(--border)",
                borderRadius: 6,
                padding:      "4px 10px",
                fontSize:     11,
                color:        "var(--text-sub)",
                flexShrink:   0,
              }}>
                {admin.memberCount} {t.superAdmin.members}
              </div>

              {/* Status */}
              <div style={{
                background:   admin.isActive ? "var(--ok-bg)"     : "var(--reject-bg)",
                color:        admin.isActive ? "var(--ok-text)"   : "var(--reject-text)",
                border:       `0.5px solid ${admin.isActive ? "var(--ok-border)" : "var(--reject-border)"}`,
                borderRadius: 4,
                padding:      "2px 8px",
                fontSize:     10,
                fontWeight:   500,
                flexShrink:   0,
              }}>
                {admin.isActive ? "Actif" : "Inactif"}
              </div>

              {/* View stats */}
              <button
                onClick={() => router.push(`/superadmin/admins?id=${admin.adminId}`)}
                style={{
                  background:   "var(--btn-primary-bg)",
                  color:        "var(--btn-primary-text)",
                  border:       "0.5px solid var(--btn-primary-border)",
                  borderRadius: 6,
                  padding:      "5px 12px",
                  fontSize:     11,
                  cursor:       "pointer",
                  fontFamily:   "inherit",
                  flexShrink:   0,
                }}
              >
                {t.superAdmin.viewStats}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SuperAdminPage() {
  return (
    <RoleGuard allowedRoles={["superadmin"]}>
      <AppLayout title="Super Admin">
        <SuperAdminContent />
      </AppLayout>
    </RoleGuard>
  )
}