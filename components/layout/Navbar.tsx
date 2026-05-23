"use client"

import { useTheme } from "@/hooks/useTheme"
import { useLang }  from "@/hooks/useLang"
import { useAuth }  from "@/hooks/useAuth"

interface NavbarProps {
  title?: string
}

export default function Navbar({ title }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, t }   = useLang()
  const { appUser }             = useAuth()

  return (
    <header style={{
      height: 52,
      background: "var(--surface)",
      borderBottom: "0.5px solid var(--border)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 12,
      position: "sticky",
      top: 0,
      zIndex: 40,
    }}>

      {/* Page title */}
      <div style={{
        flex: 1,
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text)",
        letterSpacing: "-0.01em",
      }}>
        {title || ""}
      </div>

      {/* Right side controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* Language */}
        <button
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          style={{
            background: "var(--card)",
            border: "0.5px solid var(--border)",
            borderRadius: 6,
            color: "var(--text-sub)",
            padding: "5px 10px",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          style={{
            background: "var(--card)",
            border: "0.5px solid var(--border)",
            borderRadius: 6,
            color: "var(--text-sub)",
            padding: "5px 9px",
            fontSize: 13,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>

        {/* Role badge */}
        {appUser && (
          <div style={{
            background: "var(--accent-bg)",
            border: "0.5px solid var(--border-focus)",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 10,
            color: "var(--accent)",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            {appUser.role}
          </div>
        )}
      </div>
    </header>
  )
}