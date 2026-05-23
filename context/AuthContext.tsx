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
import { getUser } from "@/lib/firestore"
import type { AppUser } from "@/types"

interface AuthContextValue {
  firebaseUser: User | null
  appUser:      AppUser | null
  loading:      boolean
  error:        string | null
  login:        (email: string, password: string) => Promise<void>
  logout:       () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser,      setAppUser]      = useState<AppUser | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
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

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, error, login, logout }}
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