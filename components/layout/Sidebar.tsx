"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/hooks/useLang"

interface NavItem {
  label: string
  path:  string
  icon:  string
  roles: string[]
}

export default function Sidebar() {
  const { appUser, logout } = useAuth()
  const { t } = useLang()
  const pathname = usePathname()
  const router   = useRouter()

  if (!appUser) return null

  const navItems: NavItem[] = [
    {
      label: t.nav.dashboard,
      path:  "/dashboard",
      icon:  "⊞",
      roles: ["worker", "manager"],
    },
    {
      label: t.nav.messages,
      path:  "/messages",
      icon:  "◉",
      roles: ["worker", "manager"],
    },
    {
      label: t.nav.products,
      path:  "/products",
      icon:  "▦",
      roles: ["worker"],
    },
    {
      label: t.nav.annexe,
      path:  "/annexe",
      icon:  "≡",
      roles: ["manager", "admin"],
    },
    {
      label: t.nav.manager,
      path:  "/manager",
      icon:  "✓",
      roles: ["manager"],
    },
    {
      label: t.nav.team,
      path:  "/manager/team",
      icon:  "◈",
      roles: ["manager"],
    },
    {
      label: t.nav.admin,
      path:  "/admin",
      icon:  "⊛",
      roles: ["admin"],
    },
    {
      label: t.nav.users,
      path:  "/admin/users",
      icon:  "◎",
      roles: ["admin"],
    },
    {
      label: t.nav.annexe,
      path:  "/admin/annexe",
      icon:  "≡",
      roles: ["admin"],
    },
    {
      label: t.nav.stats,
      path:  "/admin/stats",
      icon:  "◫",
      roles: ["admin"],
    },
    {
      label: t.nav.superadmin,
      path:  "/superadmin",
      icon:  "◈",
      roles: ["superadmin"],
    },
    {
      label: t.nav.aiTools,
      path:  "/ai-tools",
      icon:  "◬",
      roles: ["worker", "manager", "admin", "superadmin"],
    },
    {
      label: t.nav.settings,
      path:  "/settings",
      icon:  "⊙",
      roles: ["worker", "manager", "admin", "superadmin"],
    },
  ]

  const visible = navItems.filter(item =>
    item.roles.includes(appUser.role)
  )

  async function handleLogout() {
    await logout()
    router.replace("/login")
  }

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "var(--sidebar-bg)",
      borderRight: "0.5px solid var(--sidebar-border)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
    }}>

      {/* LOGO */}
      <div style={{
        padding: "20px 18px 16px",
        borderBottom: "0.5px solid var(--sidebar-border)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: "var(--accent-bg)",
            border: "0.5px solid var(--border-focus)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}>
            ⚙
          </div>
          <div>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}>
              PFE App
            </div>
            <div style={{
              fontSize: 10,
              color: "var(--sidebar-text)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              {appUser.role}
            </div>
          </div>
        </div>
      </div>

      {/* NAV ITEMS */}
      <nav style={{
        flex: 1,
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
      }}>
        {visible.map(item => {
          const isActive = pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(item.path) &&
             item.path.split("/").length >= pathname.split("/").length)

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 7,
                border: "none",
                background: isActive
                  ? "var(--sidebar-active-bg)"
                  : "transparent",
                color: isActive
                  ? "var(--sidebar-active-text)"
                  : "var(--sidebar-text)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                fontFamily: "inherit",
                width: "100%",
                textAlign: "left",
                transition: "background 0.1s, color 0.1s",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--sidebar-hover-bg)"
                  e.currentTarget.style.color = "var(--text)"
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "var(--sidebar-text)"
                }
              }}
            >
              <span style={{
                fontSize: 14,
                width: 18,
                textAlign: "center",
                flexShrink: 0,
              }}>
                {item.icon}
              </span>
              <span style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* USER + LOGOUT */}
      <div style={{
        padding: "12px 8px",
        borderTop: "0.5px solid var(--sidebar-border)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        {/* User info */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          borderRadius: 7,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "var(--accent-bg)",
            border: "0.5px solid var(--border-focus)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--accent)",
            flexShrink: 0,
          }}>
            {appUser.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {appUser.displayName}
            </div>
            <div style={{
              fontSize: 10,
              color: "var(--sidebar-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {appUser.email}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 7,
            border: "none",
            background: "transparent",
            color: "var(--sidebar-text)",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit",
            width: "100%",
            textAlign: "left",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--reject-bg)"
            e.currentTarget.style.color = "var(--reject-text)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "var(--sidebar-text)"
          }}
        >
          <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>⇥</span>
          {t.nav.logout}
        </button>
      </div>
    </aside>
  )
}