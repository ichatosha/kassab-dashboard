import type { Account, AccountRole, Portal } from '../types/domain'
import { mockDrivers } from './drivers'
import { companyIdFor } from './companies'

// ── Demo accounts ─────────────────────────────────────────────────────
// One account per role so each portal can be seen as its own audience
// sees it. A real backend replaces this with an identity provider; the
// shape (account -> role -> portal) is what the UI depends on.

export const DEMO_PASSWORD = 'kassab2026'

// The employer account is tied to a company that is actively hiring, and
// the driver account to someone still looking, so both demos have
// something to do the moment you sign in.
const DEMO_COMPANY_ID = companyIdFor('koshary')
const DEMO_DRIVER = mockDrivers.find((d) => d.status === 'available') ?? mockDrivers[0]

export const PORTAL_BY_ROLE: Record<AccountRole, Portal> = {
  platform_owner: 'admin',
  recruitment_admin: 'admin',
  finance_admin: 'admin',
  support: 'admin',
  company_owner: 'company',
  driver: 'delivery',
}

export const PORTAL_HOME: Record<Portal, string> = {
  admin: '/admin',
  company: '/company',
  delivery: '/delivery',
}

export const demoAccounts: Account[] = [
  {
    id: 'acc-owner',
    name: 'Kassab Admin',
    nameAr: 'إدارة كساب',
    email: 'admin@kassab.demo',
    role: 'platform_owner',
  },
  {
    id: 'acc-recruiter',
    name: 'Nourhan Adel',
    nameAr: 'نورهان عادل',
    email: 'recruiter@kassab.demo',
    role: 'recruitment_admin',
  },
  {
    id: 'acc-finance',
    name: 'Tarek Selim',
    nameAr: 'طارق سليم',
    email: 'finance@kassab.demo',
    role: 'finance_admin',
  },
  {
    id: 'acc-support',
    name: 'Mai Hassan',
    nameAr: 'مي حسن',
    email: 'support@kassab.demo',
    role: 'support',
  },
  {
    id: 'acc-company',
    name: 'Hassan Mahmoud',
    nameAr: 'حسن محمود',
    email: 'company@kassab.demo',
    role: 'company_owner',
    companyId: DEMO_COMPANY_ID,
  },
  {
    id: 'acc-driver',
    name: DEMO_DRIVER.name,
    nameAr: DEMO_DRIVER.nameAr,
    email: 'driver@kassab.demo',
    role: 'driver',
    driverId: DEMO_DRIVER.id,
  },
]

export const accountByEmail = (email: string) =>
  demoAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
