import type { Account, AccountRole, Portal } from '../types/domain'
import { mockDrivers } from './drivers'
import { companyIdFor } from './companies'
import { mockEmployees } from './employees'
import { mockLiveStates } from './operations'

// ── Demo accounts ─────────────────────────────────────────────────────
// Kassab staff accounts ARE the employee records: creating an employee in
// /admin/employees creates the account that person signs in with. Company
// and driver accounts come from their own populations. A real backend
// replaces this with an identity provider; the shape the UI depends on is
// account -> role -> portal.

export const DEMO_PASSWORD = 'kassab2026'

// The employer account is tied to a company that is actively hiring, and
// the driver account to someone still looking, so both demos have
// something to do the moment you sign in.
const DEMO_COMPANY_ID = companyIdFor('koshary')
const DEMO_DRIVER = mockDrivers.find((d) => d.status === 'available') ?? mockDrivers[0]

// A second driver account for someone already on shift, so the delivery
// side of the product can be seen as the captain sees it.
const WORKING_DRIVER =
  mockDrivers.find((d) => mockLiveStates.some(
    (l) => l.driverId === d.id && l.status !== 'offline' && l.orderId,
  )) ?? mockDrivers.find((d) => d.status === 'hired') ?? mockDrivers[0]

export const PORTAL_BY_ROLE: Record<AccountRole, Portal> = {
  platform_owner: 'admin',
  general_manager: 'admin',
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

// One sign-in account per active Kassab employee
const staffAccounts: Account[] = mockEmployees
  .filter((e) => e.status === 'active')
  .map((e) => ({
    id: `acc-${e.id}`,
    name: e.name,
    nameAr: e.nameAr,
    email: e.email,
    role: e.role as AccountRole,
    employeeId: e.id,
  }))

export const demoAccounts: Account[] = [
  ...staffAccounts,
  {
    id: 'acc-company',
    name: 'Hassan Mahmoud',
    nameAr: 'حسن محمود',
    email: 'company@kassab.demo',
    role: 'company_owner',
    companyId: DEMO_COMPANY_ID,
  },
  {
    id: 'acc-captain',
    name: WORKING_DRIVER.name,
    nameAr: WORKING_DRIVER.nameAr,
    email: 'captain@kassab.demo',
    role: 'driver',
    driverId: WORKING_DRIVER.id,
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
