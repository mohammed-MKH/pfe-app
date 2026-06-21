"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { useTheme } from "@/hooks/useTheme"
import { getHomeRoute } from "@/lib/routes"

export default function LoginPage() {
  const { login, appUser, loading, error } = useAuth()
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // If already logged in redirect
  useEffect(() => {
    if (!loading && appUser) {
      router.replace(getHomeRoute(appUser.role))
    }
  }, [appUser, loading, router])

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setSubmitting(true)

  try {
    await login(email, password)

    window.location.href = "/dashboard"
  } catch (err) {
    console.error("Login failed:", err)
    setSubmitting(false)
  }
}

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
    }}>

      {/* TOP BAR — language + theme */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}>
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          style={{
            background: "var(--card)",
            border: "0.5px solid var(--border)",
            borderRadius: 7,
            color: "var(--text-sub)",
            padding: "6px 12px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "var(--card)",
            border: "0.5px solid var(--border)",
            borderRadius: 7,
            color: "var(--text-sub)",
            padding: "6px 10px",
            fontSize: 14,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>

      {/* CARD */}
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "var(--card)",
        border: "0.5px solid var(--border)",
        borderRadius: 14,
        padding: "36px 32px",
        boxShadow: "var(--shadow-md)",
      }}>

        {/* LOGO / TITLE */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            width: 44,
            height: 44,
            background: "var(--accent-bg)",
            border: "0.5px solid var(--border-focus)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 20,
          }}>
            ⚙
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}>
            {lang === "fr"
              ? "Gestion de Projets"
              : "Project Management"}
          </div>
          <div style={{
            fontSize: 12,
            color: "var(--text-muted)",
            letterSpacing: "0.02em",
          }}>
            {lang === "fr"
              ? "Système de suivi industriel"
              : "Industrial tracking system"}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
              fontSize: 11,
              color: "var(--text-sub)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              fontWeight: 500,
            }}>
              {t.auth.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={lang === "fr" ? "votre@email.com" : "your@email.com"}
              required
              autoComplete="email"
              style={{
                background: "var(--input-bg)",
                border: "0.5px solid var(--input-border)",
                borderRadius: 8,
                color: "var(--input-text)",
                padding: "10px 14px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                width: "100%",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
              fontSize: 11,
              color: "var(--text-sub)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              fontWeight: 500,
            }}>
              {t.auth.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              autoComplete="current-password"
              style={{
                background: "var(--input-bg)",
                border: "0.5px solid var(--input-border)",
                borderRadius: 8,
                color: "var(--input-text)",
                padding: "10px 14px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                width: "100%",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e  => e.target.style.borderColor = "var(--input-border)"}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "var(--reject-bg)",
              border: "0.5px solid var(--reject-border)",
              borderRadius: 7,
              padding: "9px 12px",
              fontSize: 12,
              color: "var(--reject-text)",
            }}>
              {t.auth.error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || loading}
            style={{
              background: submitting
                ? "var(--btn-primary-bg)"
                : "var(--accent)",
              color: submitting
                ? "var(--btn-primary-text)"
                : "#ffffff",
              border: "0.5px solid var(--border-focus)",
              borderRadius: 8,
              padding: "11px 0",
              fontSize: 13,
              fontWeight: 500,
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 4,
              opacity: submitting ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {submitting ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
                {t.auth.loading}
              </>
            ) : (
              t.auth.login
            )}
          </button>

        </form>

        {/* FOOTER */}
        <div style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: "0.5px solid var(--border)",
          textAlign: "center",
          fontSize: 11,
          color: "var(--text-muted)",
          letterSpacing: "0.03em",
        }}>
          {lang === "fr"
            ? "Accès réservé au personnel autorisé"
            : "Access restricted to authorized personnel"}
        </div>
      </div>

      {/* BOTTOM LABEL */}
      <div style={{
        position: "absolute",
        bottom: 20,
        fontSize: 11,
        color: "var(--text-muted)",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}>
        PFE · {new Date().getFullYear()}
      </div>
    </div>
  )
}