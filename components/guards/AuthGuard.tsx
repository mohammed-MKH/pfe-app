"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getHomeRoute } from "@/lib/routes"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (appUser) {
      router.replace(getHomeRoute(appUser.role))
    }
  }, [appUser, loading, router])

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div className="spinner" />
      </div>
    )
  }

  if (appUser) return null

  return <>{children}</>
}