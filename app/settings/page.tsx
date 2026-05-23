"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { useTheme } from "@/hooks/useTheme"
import { updateUser } from "@/lib/firestore"
import type { Lang, Theme } from "@/types"

function SettingsContent() {
  const { appUser, logout }    = useAuth()
  const { t, lang, setLang }   = useLang()
  const { theme, setTheme }    = useTheme()
  const router                 = useRouter()

  const [displayName, setDisplayName] = useState(appUser?.displayName || "")
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState("")

  async function handleSave() {
    if (!appUser) return
    if (!displayName.trim()) {
      setError("Le nom ne peut pas être vide")
      return
    }
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

  function handleLangChange(l: Lang) {
    setLang(l)
  }

  function handleThemeChange(th: Theme) {
    setTheme(th)
  }

  if (!appUser) return null

  const sectionTitle: React.CSSProperties = {
    fontSize:      11,
    color:         "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight:    500,
    marginBottom:  10,
  }

  const inputStyle = {
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

  const labelStyle: React.CSSProperties = {
    fontSize:      11,
    color:         "var(--text-sub)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontWeight:    500,
    marginBottom:  6,
    display:       "block",
  }

  return (
    <div style={{
      display:   "flex",
      flexDirection: "column",
      gap:       24,
      maxWidth:  520,
    }}>

      {/* PROFILE SECTION */}
      <div>
        <div style={sectionTitle}>{t.settings.profile}</div>
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          overflow:     "hidden",
        }}>

          {/* Avatar row */}
          <div style={{
            padding:      "20px 24px",
            borderBottom: "0.5px solid var(--border)",
            display:      "flex",
            alignItems:   "center",
            gap:          16,
          }}>
            <div style={{
              width:          56,
              height:         56,
              borderRadius:   14,
              background:     "var(--accent-bg)",
              border:         "0.5px solid var(--border-focus)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       20,
              fontWeight:     500,
              color:          "var(--accent)",
              flexShrink:     0,
            }}>
              {appUser.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{
                fontSize:   14,
                fontWeight: 500,
                color:      "var(--text)",
              }}>
                {appUser.displayName}
              </div>
              <div style={{
                fontSize:  12,
                color:     "var(--text-muted)",
                marginTop: 3,
              }}>
                {appUser.email}
              </div>
              <div style={{
                display:      "inline-flex",
                background:   "var(--accent-bg)",
                color:        "var(--accent)",
                border:       "0.5px solid var(--border-focus)",
                borderRadius: 4,
                padding:      "2px 8px",
                fontSize:     10,
                fontWeight:   500,
                marginTop:    6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                {appUser.role}
              </div>
            </div>
          </div>

          {/* Edit name */}
          <div style={{ padding: "20px 24px" }}>
            <label style={labelStyle}>{t.settings.displayName}</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
            />
          </div>
        </div>
      </div>

      {/* LANGUAGE SECTION */}
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
              onClick={() => handleLangChange(l)}
              style={{
                flex:         1,
                background:   lang === l ? "var(--accent-bg)" : "var(--surface)",
                color:        lang === l ? "var(--accent)"    : "var(--text-sub)",
                border:       `0.5px solid ${lang === l ? "var(--border-focus)" : "var(--border)"}`,
                borderRadius: 8,
                padding:      "12px 0",
                fontSize:     13,
                fontWeight:   lang === l ? 500 : 400,
                cursor:       "pointer",
                fontFamily:   "inherit",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                gap:          8,
                transition:   "background 0.15s",
              }}
            >
              <span style={{ fontSize: 18 }}>
                {l === "fr" ? "🇫🇷" : "🇬🇧"}
              </span>
              {l === "fr" ? t.settings.french : t.settings.english}
            </button>
          ))}
        </div>
      </div>

      {/* THEME SECTION */}
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
              onClick={() => handleThemeChange(th)}
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
                transition:     "background 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>
                {th === "dark" ? "☾" : "☀"}
              </span>
              {th === "dark" ? t.settings.dark : t.settings.light}
            </button>
          ))}
        </div>
      </div>

      {/* ACCOUNT INFO */}
      <div>
        <div style={sectionTitle}>Compte</div>
        <div style={{
          background:   "var(--card)",
          border:       "0.5px solid var(--border)",
          borderRadius: 12,
          overflow:     "hidden",
        }}>
          {[
            { label: t.settings.email,   value: appUser.email           },
            { label: "ID",               value: appUser.uid.slice(0, 16) + "..." },
            { label: "Admin ID",         value: appUser.adminId         },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display:      "flex",
                alignItems:   "center",
                padding:      "13px 20px",
                borderBottom: i < arr.length - 1
                  ? "0.5px solid var(--border)"
                  : "none",
              }}
            >
              <div style={{
                fontSize:   12,
                color:      "var(--text-muted)",
                width:      100,
                flexShrink: 0,
              }}>
                {row.label}
              </div>
              <div style={{
                fontSize:     12,
                color:        "var(--text)",
                fontFamily:   "var(--font-mono, monospace)",
                flex:         1,
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
              }}>
                {row.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ERROR */}
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

      {/* SUCCESS */}
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

      {/* SAVE BUTTON */}
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
          transition:   "background 0.15s",
        }}
      >
        {saving ? t.settings.saving : t.settings.save}
      </button>

      {/* DIVIDER */}
      <div style={{ height: "0.5px", background: "var(--border)" }} />

      {/* LOGOUT */}
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