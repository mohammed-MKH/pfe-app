"use client"

import { useEffect, useState } from "react"
import AppLayout from "../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"
import { getProductsByAdmin, getProductsByUser } from "@/lib/firestore"
import type { Product } from "@/types"

// ── STAT CARD ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div style={{
      background: "var(--card)",
      border: "0.5px solid var(--border)",
      borderRadius: 10,
      padding: "18px 20px",
      flex: 1,
      minWidth: 120,
    }}>
      <div style={{
        fontSize: 28,
        fontWeight: 600,
        color,
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        color: "var(--text-muted)",
        marginTop: 6,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}>
        {label}
      </div>
    </div>
  )
}

// ── ACTIVITY ROW ──────────────────────────────────────────────────────────
function ActivityRow({ product }: { product: Product }) {
  const statusStyle = {
    pending:  { bg: "var(--pending-bg)",  text: "var(--pending-text)",  border: "var(--pending-border)"  },
    approved: { bg: "var(--ok-bg)",       text: "var(--ok-text)",       border: "var(--ok-border)"       },
    rejected: { bg: "var(--reject-bg)",   text: "var(--reject-text)",   border: "var(--reject-border)"   },
  }[product.status]

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (days  > 0) return `${days}j`
    if (hours > 0) return `${hours}h`
    if (mins  > 0) return `${mins}min`
    return "maintenant"
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 14px",
      background: "var(--card)",
      border: "0.5px solid var(--border)",
      borderRadius: 8,
      transition: "background 0.1s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
      onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
    >
      {/* Icon */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        flexShrink: 0,
      }}>
        ▦
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {product.name}
        </div>
        <div style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 2,
        }}>
          {product.submittedByName} · {timeAgo(product.createdAt)}
        </div>
      </div>

      {/* Status badge */}
      <div style={{
        background: statusStyle.bg,
        color: statusStyle.text,
        border: `0.5px solid ${statusStyle.border}`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.03em",
        flexShrink: 0,
      }}>
        {product.status === "pending"  ? "En attente" :
         product.status === "approved" ? "Approuvé"   : "Rejeté"}
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────
function DashboardContent() {
  const { appUser } = useAuth()
  const { t }       = useLang()
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!appUser) return
    async function load() {
      try {
        let data: Product[]
        if (appUser!.role === "worker") {
          data = await getProductsByUser(appUser!.uid)
        } else {
          data = await getProductsByAdmin(appUser!.adminId)
        }
        setProducts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [appUser])

  if (!appUser) return null

  const pending  = products.filter(p => p.status === "pending").length
  const approved = products.filter(p => p.status === "approved").length
  const rejected = products.filter(p => p.status === "rejected").length
  const recent   = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* WELCOME */}
      <div>
        <div style={{
          fontSize: 20,
          fontWeight: 600,
          color: "var(--text)",
          letterSpacing: "-0.02em",
        }}>
          {t.dashboard.welcome}, {appUser.displayName.split(" ")[0]}
        </div>
        <div style={{
          fontSize: 12,
          color: "var(--text-muted)",
          marginTop: 4,
        }}>
          {new Date().toLocaleDateString(
            appUser.language === "fr" ? "fr-FR" : "en-GB",
            { weekday: "long", day: "numeric", month: "long" }
          )}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard
          label={t.dashboard.submissions}
          value={products.length}
          color="var(--text)"
        />
        <StatCard
          label={t.dashboard.pending}
          value={pending}
          color="var(--pending-text)"
        />
        <StatCard
          label={t.dashboard.approved}
          value={approved}
          color="var(--ok-text)"
        />
        <StatCard
          label={t.dashboard.rejected}
          value={rejected}
          color="var(--reject-text)"
        />
      </div>

      {/* RECENT ACTIVITY */}
      <div>
        <div style={{
          fontSize: 11,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
          marginBottom: 10,
        }}>
          {t.dashboard.recentActivity}
        </div>

        {loading ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}>
            <div className="spinner" />
          </div>
        ) : recent.length === 0 ? (
          <div style={{
            background: "var(--card)",
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            padding: 32,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}>
            {t.dashboard.noActivity}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recent.map(p => (
              <ActivityRow key={p.productId} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── EXPORT ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["worker", "manager", "admin", "superadmin"]}>
      <AppLayout title="Dashboard">
        <DashboardContent />
      </AppLayout>
    </RoleGuard>
  )
}