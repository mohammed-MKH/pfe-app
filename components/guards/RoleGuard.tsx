"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import type { Role } from "@/types"

interface Props {
  allowedRoles: Role[]
  children: React.ReactNode
}

export default function RoleGuard({ allowedRoles, children }: Props) {
  const { appUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!appUser) {
      router.replace("/login")
      return
    }
    if (!allowedRoles.includes(appUser.role)) {
      router.replace("/login")
    }
  }, [appUser, loading, allowedRoles, router])

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

  if (!appUser || !allowedRoles.includes(appUser.role)) {
    return null
  }

  return <>{children}</>
}