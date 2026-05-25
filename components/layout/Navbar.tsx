"use client"

import { useTheme } from "@/hooks/useTheme"
import { useLang }  from "@/hooks/useLang"
import { useAuth }  from "@/hooks/useAuth"

interface NavbarProps {
  title?:       string
  onMenuClick?: () => void
}

export default function Navbar({ title, onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang }      = useLang()
  const { appUser }            = useAuth()

  return (
    <header style={{
      height:       52,
      background:   "var(--surface)",
      borderBottom: "0.5px solid var(--border)",
      display:      "flex",
      alignItems:   "center",
      padding:      "0 16px",
      gap:          10,
      position:     "sticky",
      top:          0,
      zIndex:       40,
    }}>

      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        style={{
          background:   "none",
          border:       "none",
          color:        "var(--text-sub)",
          cursor:       "pointer",
          fontSize:     20,
          padding:      "4px 8px",
          lineHeight:   1,
          borderRadius: 6,
          flexShrink:   0,
        }}
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Title */}
      <div style={{
        flex:       1,
        fontSize:   13,
        fontWeight: 500,
        color:      "var(--text)",
      }}>
        {title || ""}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          style={{
            background:   "var(--card)",
            border:       "0.5px solid var(--border)",
            borderRadius: 6,
            color:        "var(--text-sub)",
            padding:      "5px 10px",
            fontSize:     11,
            cursor:       "pointer",
            fontFamily:   "inherit",
            fontWeight:   500,
          }}
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>

        <button
          onClick={toggleTheme}
          style={{
            background:   "var(--card)",
            border:       "0.5px solid var(--border)",
            borderRadius: 6,
            color:        "var(--text-sub)",
            padding:      "5px 9px",
            fontSize:     13,
            cursor:       "pointer",
            lineHeight:   1,
          }}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>

        {appUser && (
          <div style={{
            background:    "var(--accent-bg)",
            border:        "0.5px solid var(--border-focus)",
            borderRadius:  6,
            padding:       "4px 10px",
            fontSize:      10,
            color:         "var(--accent)",
            fontWeight:    500,
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