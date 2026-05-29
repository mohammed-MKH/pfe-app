"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUser, updateUser } from "@/lib/firestore"
import type { AppUser, Role } from "@/types"

interface AuthContextValue {
  firebaseUser: User | null
  appUser:      AppUser | null
  loading:      boolean
  error:        string | null
  login:        (email: string, password: string) => Promise<void>
  logout:       () => Promise<void>
  switchRole:   (newRole: Role) => Promise<void>
  clearError:   () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser,      setAppUser]      = useState<AppUser | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setFirebaseUser(user)
      if (user) {
        try {
          const data = await getUser(user.uid)
          setAppUser(data)
        } catch {
          setAppUser(null)
        }
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function login(email: string, password: string) {
    setError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError("Email ou mot de passe incorrect")
      setLoading(false)
    }
  }

  async function logout() {
    await signOut(auth)
    setAppUser(null)
    setFirebaseUser(null)
  }

  // Switch role in-app without logging out
  // Only works for users who have both admin + manager access
  async function switchRole(newRole: Role) {
    if (!appUser) return
    await updateUser(appUser.uid, { role: newRole })
    setAppUser(prev => prev ? { ...prev, role: newRole } : prev)
  }

  function clearError() {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        loading,
        error,
        login,
        logout,
        switchRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}