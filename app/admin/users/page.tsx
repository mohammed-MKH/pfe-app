"use client"

import { useState, useEffect } from "react"
import AppLayout from "../../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { getUsersByAdmin, updateUser } from "@/lib/firestore"
import { createMember } from "@/lib/auth"
import type { AppUser } from "@/types"

function AdminUsersContent() {
  const { appUser }           = useAuth()
  const { t }                 = useLang()
  const [users,    setUsers]  = useState<AppUser[]>([])
  const [loading,  setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error,    setError]   = useState("")
  const [success,  setSuccess] = useState("")

  const [form, setForm] = useState({
    displayName: "",
    email:       "",
    password:    "",
    role:        "worker" as "worker" | "manager",
  })

  useEffect(() => {
    if (!appUser) return
    getUsersByAdmin(appUser.adminId).then(data => {
      setUsers(data.filter(u => u.uid !== appUser.uid))
      setLoading(false)
    })
  }, [appUser])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!appUser) return
    if (!form.displayName || !form.email || !form.password) {
      setError("Tous les champs sont requis")
      return
    }
    setCreating(true)
    setError("")
    try {
      const newUser = await createMember({
        email:       form.email,
        password:    form.password,
        displayName: form.displayName,
        role:        form.role,
        adminId:     appUser.adminId,
        createdBy:   appUser.uid,
      })
      setUsers(prev => [...prev, newUser])
      setForm({ displayName: "", email: "", password: "", role: "worker" })
      setShowForm(false)
      setSuccess(`${form.displayName} créé avec succès`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || t.common.error)
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(user: AppUser) {
    await updateUser(user.uid, { isActive: !user.isActive })
    setUsers(prev => prev.map(u =>
      u.uid === user.uid ? { ...u, isActive: !u.isActive } : u
    ))
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

  const workers  = users.filter(u => u.role === "worker")
  const managers = users.filter(u => u.role === "manager")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
            {t.admin.createUser}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
            {users.length} {t.common.rows}
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
          + {t.admin.createUser}
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
            {t.admin.createUser}
          </div>

          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>{t.admin.displayName}</label>
                <input
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  placeholder="Nom complet"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>

              {/* Role */}
              <div>
                <label style={labelStyle}>{t.admin.role}</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({
                    ...f,
                    role: e.target.value as "worker" | "manager"
                  }))}
                  style={{ ...inputStyle, appearance: "none" as any }}
                >
                  <option value="worker">{t.admin.roles.worker}</option>
                  <option value="manager">{t.admin.roles.manager}</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>{t.admin.email}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemple.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                  onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>{t.admin.password}</label>
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

            {/* Error */}
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

            {/* Buttons */}
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
                {creating ? t.admin.creating : t.common.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STATS */}
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: t.admin.totalUsers,    value: users.length,    color: "var(--text)"          },
          { label: t.admin.totalManagers, value: managers.length, color: "var(--accent)"        },
          { label: t.admin.totalWorkers,  value: workers.length,  color: "var(--ok-text)"       },
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

      {/* USER LIST */}
      {loading ? (
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        40,
        }}>
          <div className="spinner" />
        </div>
      ) : users.length === 0 ? (
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 10,
          padding:      32,
          textAlign:    "center",
          color:        "var(--text-muted)",
          fontSize:     13,
        }}>
          {t.admin.noUsers} — cliquez sur "+ Créer" pour commencer
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {users.map(u => {
            const roleStyle = u.role === "manager"
              ? { bg: "var(--accent-bg)", text: "var(--accent)", border: "var(--border-focus)" }
              : { bg: "var(--ok-bg)",     text: "var(--ok-text)", border: "var(--ok-border)"  }

            return (
              <div
                key={u.uid}
                style={{
                  background:   "var(--card)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 9,
                  padding:      "12px 16px",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          12,
                  opacity:      u.isActive ? 1 : 0.5,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width:          36,
                  height:         36,
                  borderRadius:   9,
                  background:     "var(--accent-bg)",
                  border:         "0.5px solid var(--border-focus)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       13,
                  fontWeight:     500,
                  color:          "var(--accent)",
                  flexShrink:     0,
                }}>
                  {u.displayName.slice(0, 2).toUpperCase()}
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
                    {u.displayName}
                  </div>
                  <div style={{
                    fontSize:  11,
                    color:     "var(--text-muted)",
                    marginTop: 2,
                  }}>
                    {u.email}
                  </div>
                </div>

                {/* Role badge */}
                <div style={{
                  background:   roleStyle.bg,
                  color:        roleStyle.text,
                  border:       `0.5px solid ${roleStyle.border}`,
                  borderRadius: 4,
                  padding:      "2px 8px",
                  fontSize:     10,
                  fontWeight:   500,
                  flexShrink:   0,
                }}>
                  {u.role}
                </div>

                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(u)}
                  style={{
                    background:   u.isActive ? "var(--btn-danger-bg)" : "var(--btn-green-bg)",
                    color:        u.isActive ? "var(--btn-danger-text)" : "var(--btn-green-text)",
                    border:       `0.5px solid ${u.isActive ? "var(--btn-danger-border)" : "var(--btn-green-border)"}`,
                    borderRadius: 6,
                    padding:      "5px 12px",
                    fontSize:     11,
                    cursor:       "pointer",
                    fontFamily:   "inherit",
                    flexShrink:   0,
                  }}
                >
                  {u.isActive ? t.admin.deactivate : t.admin.activate}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AppLayout title="Utilisateurs">
        <AdminUsersContent />
      </AppLayout>
    </RoleGuard>
  )
}