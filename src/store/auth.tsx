import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AdminUser } from '../types/domain'

// Mock auth provider. The AuthService shape is what a real backend
// implementation (JWT/session) will satisfy later.
export const DEMO_EMAIL = 'admin@kassab.demo'
export const DEMO_PASSWORD = 'kassab2026'

const DEMO_USER: AdminUser = {
  id: 'adm-001',
  name: 'Kassab Admin',
  email: DEMO_EMAIL,
  role: 'platform_owner',
}

interface AuthContextValue {
  user: AdminUser | null
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'kassab.session'

function readSession(): AdminUser | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1' ? DEMO_USER : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(readSession)

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600))
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setUser(DEMO_USER)
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        // session persistence unavailable; login still works in-memory
      }
      return true
    }
    return false
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
