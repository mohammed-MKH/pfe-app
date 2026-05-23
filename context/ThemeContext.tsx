"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

type Theme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    const stored = localStorage.getItem("pfe-theme") as Theme | null
    if (stored === "dark" || stored === "light") {
      apply(stored)
    } else {
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches
      apply(sys ? "dark" : "light")
    }
  }, [])

  function apply(t: Theme) {
    setThemeState(t)
    document.documentElement.setAttribute("data-theme", t)
    localStorage.setItem("pfe-theme", t)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: apply,
        toggleTheme: () => apply(theme === "dark" ? "light" : "dark"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}