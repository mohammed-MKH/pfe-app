"use client"

import Sidebar     from "./Sidebar"
import Navbar      from "./Navbar"
import PWAInstall  from "@/components/PWAInstall"

interface AppLayoutProps {
  children: React.ReactNode
  title?:   string
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div style={{
      display:    "flex",
      minHeight:  "100vh",
      background: "var(--bg)",
    }}>
      <Sidebar />

      <div style={{
        marginLeft:    220,
        flex:          1,
        display:       "flex",
        flexDirection: "column",
        minHeight:     "100vh",
        minWidth:      0,
      }}>
        <Navbar title={title} />
        <main style={{
          flex:      1,
          padding:   "24px",
          overflowY: "auto",
        }}>
          {children}
        </main>
      </div>

      <PWAInstall />
    </div>
  )
}