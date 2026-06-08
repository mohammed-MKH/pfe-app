"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter }        from "next/navigation"
import AppLayout            from "@/components/layout/AppLayout"
import RoleGuard            from "@/components/guards/RoleGuard"
import { useAuth }          from "@/hooks/useAuth"
import { useLang }          from "@/hooks/useLang"
import { useTheme }         from "@/hooks/useTheme"
import { updateUser, updateAdmin, getAdmin } from "@/lib/firestore"
import { uploadAvatar, uploadLogo }          from "@/lib/storage"
import type { Lang, Theme } from "@/types"

function SettingsContent() {
  const { appUser, logout }  = useAuth()
  const { t, lang, setLang } = useLang()
  const { theme, setTheme }  = useTheme()
  const router               = useRouter()

  const [displayName,   setDisplayName]   = useState(appUser?.displayName || "")
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [error,         setError]         = useState("")
  const [avatarURL,     setAvatarURL]     = useState<string | null>(appUser?.photoURL || null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [logoURL,       setLogoURL]       = useState<string | null>(null)
  const [logoLoading,   setLogoLoading]   = useState(false)

  const avatarRef = useRef<HTMLInputElement>(null)
  const logoRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (appUser?.role === "admin") {
      getAdmin(appUser.adminId).then(admin => {
        if (admin?.logoURL) setLogoURL(admin.logoURL)
      })
    }
  }, [appUser])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !appUser) return
    setAvatarLoading(true)
    setError("")
    try {
      const url = await uploadAvatar(appUser.uid, file)
      await updateUser(appUser.uid, { photoURL: url })
      setAvatarURL(url)
    } catch {
      setError("Erreur lors du téléchargement de la photo")
    } finally {
      setAvatarLoading(false)
      e.target.value = ""
    }
  }

  async function handleRemoveAvatar() {
    if (!appUser) return
    await updateUser(appUser.uid, { photoURL: null })
    setAvatarURL(null)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !appUser) return
    setLogoLoading(true)
    setError("")
    try {
      const url = await uploadLogo(appUser.adminId, file)
      await updateAdmin(appUser.adminId, { logoURL: url })
      setLogoURL(url)
    } catch {
      setError("Erreur lors du téléchargement du logo")
    } finally {
      setLogoLoading(false)
      e.target.value = ""
    }
  }

  async function handleRemoveLogo() {
    if (!appUser) return
    await updateAdmin(appUser.adminId, { logoURL: null })
    setLogoURL(null)
  }

  async function handleSave() {
    if (!appUser) return
    if (!displayName.trim()) { setError("Le nom ne peut pas être vide"); return }
    setSaving(true)
    setError("")
    try {
      await updateUser(appUser.uid, {
        displayName: displayName.trim(),
        language:    lang,
        theme,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError(t.common.error)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    router.replace("/login")
  }

  if (!appUser) return null

  const inputStyle: React.CSSProperties = {
    background:   "var(--input-bg)",
    border:       "0.5px solid var(--input-border)",
    borderRadius: 8,
    color:        "var(--input-text)",
    padding:      "10px 14px",
    fontSize:     13,
    fontFamily:   "inherit",
    outline:      "none",
    width:        "100%",
  }

  const sectionTitle: React.CSSProperties = {
    fontSize:      11,
    color:         "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight:    500,
    marginBottom:  10,
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 520 }}>

      {/* PROFILE PHOTO — all users */}
      <div>
        <div style={sectionTitle}>Photo de profil</div>
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          padding:      "20px 24px",
          display:      "flex",
          alignItems:   "center",
          gap:          20,
        }}>
          <div style={{
            width:          80,
            height:         80,
            borderRadius:   "50%",
            background:     "var(--accent-bg)",
            border:         "2px solid var(--border-focus)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            overflow:       "hidden",
            flexShrink:     0,
          }}>
            {avatarLoading ? (
              <div className="spinner" />
            ) : avatarURL ? (
              <img src={avatarURL} alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 24, fontWeight: 600, color: "var(--accent)" }}>
                {appUser.displayName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
              {appUser.displayName}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Visible dans les messages et votre profil
            </div>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: "none" }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={avatarLoading}
                style={{
                  background:   "var(--accent)",
                  color:        "#fff",
                  border:       "none",
                  borderRadius: 7,
                  padding:      "8px 16px",
                  fontSize:     12,
                  fontWeight:   500,
                  cursor:       avatarLoading ? "not-allowed" : "pointer",
                  fontFamily:   "inherit",
                  opacity:      avatarLoading ? 0.7 : 1,
                }}
              >
                {avatarLoading ? "Téléchargement..." : avatarURL ? "Changer" : "Ajouter une photo"}
              </button>
              {avatarURL && (
                <button
                  onClick={handleRemoveAvatar}
                  style={{
                    background:   "var(--btn-danger-bg)",
                    color:        "var(--btn-danger-text)",
                    border:       "0.5px solid var(--btn-danger-border)",
                    borderRadius: 7,
                    padding:      "8px 14px",
                    fontSize:     12,
                    cursor:       "pointer",
                    fontFamily:   "inherit",
                  }}
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COMPANY LOGO — admin only */}
      {appUser.role === "admin" && (
        <div>
          <div style={sectionTitle}>Logo de l'entreprise</div>
          <div style={{
            background:   "var(--card)",
            border:       "0.5px solid var(--border)",
            borderRadius: 12,
            padding:      "20px 24px",
            display:      "flex",
            alignItems:   "center",
            gap:          20,
          }}>
            <div style={{
              width:          72,
              height:         72,
              borderRadius:   14,
              background:     "var(--surface)",
              border:         "0.5px solid var(--border)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              overflow:       "hidden",
              flexShrink:     0,
            }}>
              {logoLoading ? (
                <div className="spinner" />
              ) : logoURL ? (
                <img src={logoURL} alt="logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 28 }}>🏢</span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                Logo visible par toute votre organisation
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Affiché dans la barre latérale de tous vos membres
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: "none" }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => logoRef.current?.click()}
                  disabled={logoLoading}
                  style={{
                    background:   "var(--accent)",
                    color:        "#fff",
                    border:       "none",
                    borderRadius: 7,
                    padding:      "8px 16px",
                    fontSize:     12,
                    fontWeight:   500,
                    cursor:       logoLoading ? "not-allowed" : "pointer",
                    fontFamily:   "inherit",
                    opacity:      logoLoading ? 0.7 : 1,
                  }}
                >
                  {logoLoading ? "Téléchargement..." : logoURL ? "Changer le logo" : "Télécharger un logo"}
                </button>
                {logoURL && (
                  <button
                    onClick={handleRemoveLogo}
                    style={{
                      background:   "var(--btn-danger-bg)",
                      color:        "var(--btn-danger-text)",
                      border:       "0.5px solid var(--btn-danger-border)",
                      borderRadius: 7,
                      padding:      "8px 14px",
                      fontSize:     12,
                      cursor:       "pointer",
                      fontFamily:   "inherit",
                    }}
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                PNG, JPG, SVG · Recommandé: 200×200px
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISPLAY NAME */}
      <div>
        <div style={sectionTitle}>{t.settings.profile}</div>
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          padding:      "20px 24px",
        }}>
          <label style={{
            fontSize:      11,
            color:         "var(--text-sub)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight:    500,
            marginBottom:  6,
            display:       "block",
          }}>
            {t.settings.displayName}
          </label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
            onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
          />
        </div>
      </div>

      {/* LANGUAGE */}
      <div>
        <div style={sectionTitle}>{t.settings.language}</div>
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          padding:      "16px 20px",
          display:      "flex",
          gap:          10,
        }}>
          {(["fr", "en"] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                flex:           1,
                background:     lang === l ? "var(--accent-bg)" : "var(--surface)",
                color:          lang === l ? "var(--accent)"    : "var(--text-sub)",
                border:         `0.5px solid ${lang === l ? "var(--border-focus)" : "var(--border)"}`,
                borderRadius:   8,
                padding:        "12px 0",
                fontSize:       13,
                fontWeight:     lang === l ? 500 : 400,
                cursor:         "pointer",
                fontFamily:     "inherit",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            8,
              }}
            >
              <span style={{ fontSize: 18 }}>{l === "fr" ? "🇫🇷" : "🇬🇧"}</span>
              {l === "fr" ? t.settings.french : t.settings.english}
            </button>
          ))}
        </div>
      </div>

      {/* THEME */}
      <div>
        <div style={sectionTitle}>{t.settings.theme}</div>
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          padding:      "16px 20px",
          display:      "flex",
          gap:          10,
        }}>
          {(["dark", "light"] as Theme[]).map(th => (
            <button
              key={th}
              onClick={() => setTheme(th)}
              style={{
                flex:           1,
                background:     theme === th ? "var(--accent-bg)" : "var(--surface)",
                color:          theme === th ? "var(--accent)"    : "var(--text-sub)",
                border:         `0.5px solid ${theme === th ? "var(--border-focus)" : "var(--border)"}`,
                borderRadius:   8,
                padding:        "12px 0",
                fontSize:       13,
                fontWeight:     theme === th ? 500 : 400,
                cursor:         "pointer",
                fontFamily:     "inherit",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            8,
              }}
            >
              <span style={{ fontSize: 16 }}>{th === "dark" ? "☾" : "☀"}</span>
              {th === "dark" ? t.settings.dark : t.settings.light}
            </button>
          ))}
        </div>
      </div>

      {/* ACCOUNT */}
      <div>
        <div style={sectionTitle}>Compte</div>
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          overflow:     "hidden",
        }}>
          {[
            { label: t.settings.email, value: appUser.email },
            { label: "Rôle",           value: appUser.role  },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display:      "flex",
                alignItems:   "center",
                padding:      "13px 20px",
                borderBottom: i < arr.length - 1 ? "0.5px solid var(--border)" : "none",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-muted)", width: 100, flexShrink: 0 }}>
                {row.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--text)", flex: 1 }}>
                {row.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          background:   "var(--reject-bg)",
          border:       "0.5px solid var(--reject-border)",
          borderRadius: 8,
          padding:      "10px 14px",
          fontSize:     12,
          color:        "var(--reject-text)",
        }}>
          {error}
        </div>
      )}

      {saved && (
        <div style={{
          background:   "var(--ok-bg)",
          border:       "0.5px solid var(--ok-border)",
          borderRadius: 8,
          padding:      "10px 14px",
          fontSize:     12,
          color:        "var(--ok-text)",
        }}>
          ✓ {t.settings.saved}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background:   saving ? "var(--surface)" : "var(--accent)",
          color:        saving ? "var(--text-muted)" : "#fff",
          border:       "0.5px solid var(--border-focus)",
          borderRadius: 9,
          padding:      "12px 0",
          fontSize:     13,
          fontWeight:   500,
          cursor:       saving ? "not-allowed" : "pointer",
          fontFamily:   "inherit",
          width:        "100%",
          opacity:      saving ? 0.7 : 1,
        }}
      >
        {saving ? t.settings.saving : t.settings.save}
      </button>

      <div style={{ height: "0.5px", background: "var(--border)" }} />

      <button
        onClick={handleLogout}
        style={{
          background:   "var(--btn-danger-bg)",
          color:        "var(--btn-danger-text)",
          border:       "0.5px solid var(--btn-danger-border)",
          borderRadius: 9,
          padding:      "12px 0",
          fontSize:     13,
          fontWeight:   500,
          cursor:       "pointer",
          fontFamily:   "inherit",
          width:        "100%",
        }}
      >
        {t.auth.logout}
      </button>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={["worker", "manager", "admin", "superadmin"]}>
      <AppLayout title="Paramètres">
        <SettingsContent />
      </AppLayout>
    </RoleGuard>
  )
}