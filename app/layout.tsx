import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/context/ThemeContext"
import { LangProvider }  from "@/context/LangContext"
import { AuthProvider }  from "@/context/AuthContext"

export const metadata: Metadata = {
  title: "PFE — Gestionnaire de Projets Industriels",
  description: "Système de gestion et suivi de projets industriels",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LangProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}