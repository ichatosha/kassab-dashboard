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

export type AdminRole = AdminUser['role']

export const ADMIN_ROLES: AdminRole[] = [
  'platform_owner', 'recruitment_admin', 'finance_admin', 'support',
]

// Who may read how many people viewed, liked or saved an opportunity.
// These are the numbers the platform runs on: the owner sees everything,
// and the recruitment team needs them to judge which postings are working.
// Finance and support staff work from the same records without them.
export const ENGAGEMENT_ROLES: AdminRole[] = ['platform_owner', 'recruitment_admin']

interface AuthContextValue {
  user: AdminUser | null
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => void
  /** Effective role. The demo lets the owner preview the other roles. */
  role: AdminRole
  setRole: (role: AdminRole) => void
  canViewEngagement: boolean
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
  // Real RBAC will come from the signed-in account. Until then the demo
  // account is the owner and can preview what a narrower role would see.
  const [role, setRole] = useState<AdminRole>(DEMO_USER.role)

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
    setRole(DEMO_USER.role)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      role,
      setRole,
      canViewEngagement: ENGAGEMENT_ROLES.includes(role),
    }),
    [user, signIn, signOut, role],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
