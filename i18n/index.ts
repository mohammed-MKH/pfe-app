import fr from "../i18n/fr"
import en from "./en"

export type { Translations } from "../i18n/fr"
export type Lang = "fr" | "en"

export const translations = { fr, en }

export function getT(lang: Lang) {
  return translations[lang]
}