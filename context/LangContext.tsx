"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { getT, type Lang, type Translations } from "../i18n"

interface LangContextValue {
  lang: Lang
  t: Translations
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr")

  useEffect(() => {
    const stored = localStorage.getItem("pfe-lang") as Lang | null
    if (stored === "fr" || stored === "en") setLangState(stored)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem("pfe-lang", l)
  }

  return (
    <LangContext.Provider value={{ lang, t: getT(lang), setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside LangProvider")
  return ctx
}