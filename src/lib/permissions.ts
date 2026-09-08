import type { AccountRole, EmployeeRole, Permission } from '../types/domain'

// ── Authorization, in one place ───────────────────────────────────────
// Components never decide who may do what. They ask `can(permission)`;
// this table is the only thing that answers. Roles are built from
// permissions so a role can be customised later without touching the UI.

export const ALL_PERMISSIONS: Permission[] = [
  'companies.view', 'companies.manage',
  'drivers.view', 'drivers.manage',
  'applications.view', 'applications.manage',
  'hiring.view', 'hiring.manage',
  'workforce_tracking.view',
  'integrations.view', 'integrations.manage',
  'finance.view', 'finance.manage',
  'employees.view', 'employees.manage',
  'audit.view',
  'reports.view',
  'settings.manage',
]

// Grouped for the roles & permissions screen
export const PERMISSION_GROUPS: { labelKey: string; permissions: Permission[] }[] = [
  { labelKey: 'perm.group.companies', permissions: ['companies.view', 'companies.manage'] },
  { labelKey: 'perm.group.drivers', permissions: ['drivers.view', 'drivers.manage'] },
  { labelKey: 'perm.group.recruitment', permissions: ['applications.view', 'applications.manage', 'hiring.view', 'hiring.manage'] },
  { labelKey: 'perm.group.operations', permissions: ['workforce_tracking.view', 'integrations.view', 'integrations.manage'] },
  { labelKey: 'perm.group.finance', permissions: ['finance.view', 'finance.manage'] },
  { labelKey: 'perm.group.platform', permissions: ['employees.view', 'employees.manage', 'audit.view', 'reports.view', 'settings.manage'] },
]

const RECRUITER: Permission[] = [
  'companies.view',
  'drivers.view', 'drivers.manage',
  'applications.view', 'applications.manage',
  'hiring.view', 'hiring.manage',
  'workforce_tracking.view',
  'reports.view',
]

const FINANCE: Permission[] = [
  'companies.view',
  'drivers.view',
  'finance.view', 'finance.manage',
  'reports.view',
]

const SUPPORT: Permission[] = [
  'companies.view',
  'drivers.view',
  'applications.view',
  'hiring.view',
  'workforce_tracking.view',
]

const GENERAL_MANAGER: Permission[] = [
  'companies.view', 'companies.manage',
  'drivers.view', 'drivers.manage',
  'applications.view', 'applications.manage',
  'hiring.view', 'hiring.manage',
  'workforce_tracking.view',
  'integrations.view', 'integrations.manage',
  'finance.view',
  'employees.view',
  'audit.view',
  'reports.view',
]

export const ROLE_PERMISSIONS: Record<EmployeeRole, Permission[]> = {
  // The owner is the only role that holds everything, including the
  // ability to create and remove other staff.
  platform_owner: ALL_PERMISSIONS,
  general_manager: GENERAL_MANAGER,
  recruitment_admin: RECRUITER,
  finance_admin: FINANCE,
  support: SUPPORT,
}

export const EMPLOYEE_ROLES: EmployeeRole[] = [
  'platform_owner', 'general_manager', 'recruitment_admin', 'finance_admin', 'support',
]

const isEmployeeRole = (role: AccountRole): role is EmployeeRole =>
  (EMPLOYEE_ROLES as string[]).includes(role)

/** Everything an account may do. Company and driver accounts hold none of
 *  these: their portals are scoped by tenancy, not by staff permissions. */
export function permissionsFor(role: AccountRole | null, extra: Permission[] = []): Permission[] {
  if (!role || !isEmployeeRole(role)) return []
  return Array.from(new Set([...ROLE_PERMISSIONS[role], ...extra]))
}

export function roleCan(role: AccountRole | null, permission: Permission, extra: Permission[] = []): boolean {
  return permissionsFor(role, extra).includes(permission)
}
