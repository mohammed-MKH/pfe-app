"use client"

import { useEffect, useState } from "react"
import { useLang } from "@/hooks/useLang"

export default function PWAInstall() {
  const { lang }                          = useLang()
  const [prompt,  setPrompt]             = useState<any>(null)
  const [visible, setVisible]            = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registered"))
        .catch(err => console.log("SW error:", err))
    }

    // Listen for install prompt
    function handlePrompt(e: Event) {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handlePrompt)
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === "accepted") {
      setVisible(false)
    }
  }

  if (!visible) return null

  return (
    <div style={{
      position:     "fixed",
      bottom:       20,
      left:         "50%",
      transform:    "translateX(-50%)",
      zIndex:       1000,
      background:   "var(--card)",
      border:       "0.5px solid var(--border-focus)",
      borderRadius: 12,
      padding:      "14px 20px",
      display:      "flex",
      alignItems:   "center",
      gap:          14,
      boxShadow:    "var(--shadow-md)",
      minWidth:     300,
      maxWidth:     400,
    }}>
      <div style={{ fontSize: 24 }}>⚙</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize:   13,
          fontWeight: 500,
          color:      "var(--text)",
        }}>
          {lang === "fr" ? "Installer l'application" : "Install the app"}
        </div>
        <div style={{
          fontSize:  11,
          color:     "var(--text-muted)",
          marginTop: 2,
        }}>
          {lang === "fr"
            ? "Accès rapide depuis votre écran d'accueil"
            : "Quick access from your home screen"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => setVisible(false)}
          style={{
            background:   "none",
            border:       "none",
            color:        "var(--text-muted)",
            cursor:       "pointer",
            fontSize:     12,
            padding:      "4px 8px",
            fontFamily:   "inherit",
          }}
        >
          {lang === "fr" ? "Non" : "No"}
        </button>
        <button
          onClick={handleInstall}
          style={{
            background:   "var(--accent)",
            color:        "#fff",
            border:       "0.5px solid var(--border-focus)",
            borderRadius: 7,
            padding:      "6px 14px",
            fontSize:     12,
            fontWeight:   500,
            cursor:       "pointer",
            fontFamily:   "inherit",
          }}
        >
          {lang === "fr" ? "Installer" : "Install"}
        </button>
      </div>
    </div>
  )
}