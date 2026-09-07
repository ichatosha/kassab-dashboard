import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Account, AccountRole, Portal } from '../types/domain'
import {
  DEMO_PASSWORD, PORTAL_BY_ROLE, PORTAL_HOME, accountByEmail, demoAccounts,
} from '../mocks/accounts'

// Mock auth. The AuthService shape is what a real backend implementation
// (JWT/session) will satisfy later; every account here shares one password
// because this is a demo environment, not a security boundary.
export const DEMO_EMAIL = 'admin@kassab.demo'
export { DEMO_PASSWORD, demoAccounts }

export const ADMIN_ROLES: AccountRole[] = [
  'platform_owner', 'recruitment_admin', 'finance_admin', 'support',
]

// Who may read how many people viewed, liked or saved an opportunity.
// These are the numbers the platform runs on: the owner sees everything,
// and the recruitment team needs them to judge which postings are working.
// Finance and support work from the same records without them.
export const ENGAGEMENT_ROLES: AccountRole[] = ['platform_owner', 'recruitment_admin']

export const portalForRole = (role: AccountRole): Portal => PORTAL_BY_ROLE[role]
export const homeForRole = (role: AccountRole): string => PORTAL_HOME[portalForRole(role)]

interface AuthContextValue {
  user: Account | null
  signIn: (email: string, password: string) => Promise<boolean>
  /** Sign in an account created during this session (registration flows) */
  signInAs: (account: Account) => void
  signOut: () => void
  role: AccountRole | null
  portal: Portal | null
  /** Landing route for the signed-in account, or the login page */
  homePath: string
  canViewEngagement: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'kassab.session'

// Accounts registered during this session live alongside the seeded ones.
const sessionAccounts: Account[] = []

function findAccount(email: string): Account | undefined {
  return (
    accountByEmail(email) ??
    sessionAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
  )
}

function readSession(): Account | null {
  try {
    const email = sessionStorage.getItem(STORAGE_KEY)
    return email ? (findAccount(email) ?? null) : null
  } catch {
    return null
  }
}

function remember(account: Account | null) {
  try {
    if (account) sessionStorage.setItem(STORAGE_KEY, account.email)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage unavailable; the session simply won't survive a refresh
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(readSession)

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600))
    const account = findAccount(email)
    if (!account || password !== DEMO_PASSWORD) return false
    setUser(account)
    remember(account)
    return true
  }, [])

  const signInAs = useCallback((account: Account) => {
    sessionAccounts.push(account)
    setUser(account)
    remember(account)
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    remember(null)
  }, [])

  const value = useMemo(() => {
    const role = user?.role ?? null
    return {
      user,
      signIn,
      signInAs,
      signOut,
      role,
      portal: role ? portalForRole(role) : null,
      homePath: role ? homeForRole(role) : '/login',
      canViewEngagement: role ? ENGAGEMENT_ROLES.includes(role) : false,
    }
  }, [user, signIn, signInAs, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
