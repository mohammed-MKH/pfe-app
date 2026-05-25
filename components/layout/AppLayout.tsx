"use client"

import { useState, useEffect } from "react"
import { usePathname }         from "next/navigation"
import Sidebar                 from "./Sidebar"
import Navbar                  from "./Navbar"
import PWAInstall              from "@/components/PWAInstall"

interface AppLayoutProps {
  children: React.ReactNode
  title?:   string
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [open, setOpen] = useState(false)
  const pathname        = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Dark overlay on mobile when sidebar open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:   "fixed",
            inset:      0,
            background: "rgba(0,0,0,0.5)",
            zIndex:     49,
          }}
        />
      )}

      {/* Sidebar — slides in on mobile, always visible on desktop */}
      <div style={{
        position:   "fixed",
        top:        0,
        left:       open ? 0 : -220,
        width:      220,
        height:     "100vh",
        zIndex:     50,
        transition: "left 0.2s ease",
      }}
        className="sidebar-wrapper"
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Desktop spacer so content does not go under sidebar */}
      <div className="sidebar-spacer" style={{ width: 220, flexShrink: 0 }} />

      {/* Main */}
      <div style={{
        flex:          1,
        display:       "flex",
        flexDirection: "column",
        minHeight:     "100vh",
        minWidth:      0,
      }}>
        <Navbar title={title} onMenuClick={() => setOpen(v => !v)} />
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>

      <PWAInstall />

      <style>{`
        /* On mobile: sidebar hidden by default, spacer hidden */
        @media (max-width: 767px) {
          .sidebar-spacer { display: none !important; }
        }
        /* On desktop: sidebar always visible, no slide animation needed */
        @media (min-width: 768px) {
          .sidebar-wrapper {
            left: 0 !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}