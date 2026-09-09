import {
  Banknote, Bell, Bike, Briefcase, Building2, ClipboardList, Columns3,
  FileText, Gauge, LayoutDashboard, PlugZap, Radio, ReceiptText, ScrollText,
  Settings, ShieldCheck, Star, TrendingUp, UserCheck, UserCog, Users, Wallet,
} from 'lucide-react'
import { PortalLayout } from './PortalLayout'
import type { NavItem, NavSection } from './Sidebar'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'
import type { Permission } from '../../types/domain'

// Kassab's own operations room. Every entry declares the permission it
// needs, and the sidebar is filtered by the signed-in role — a finance
// account simply never sees the recruitment tools.
type GatedItem = NavItem & { permission?: Permission }

export function AdminLayout() {
  const { applications, requests, drivers, payments, liveStates, integrations } = useAppState()
  const { can } = useAuth()

  const newApplications = applications.filter((a) => a.status === 'new').length
  const openRequests = requests.filter((r) => OPEN_REQUEST_STATUSES.includes(r.status)).length
  const availableDrivers = drivers.filter((d) => d.status === 'available').length
  const overduePayments = payments.filter((p) => p.status === 'overdue').length
  const working = liveStates.filter((s) => s.status !== 'offline').length
  const failingIntegrations = integrations.filter((i) => i.status === 'error').length

  const sections: { labelKey?: NavSection['labelKey']; items: GatedItem[] }[] = [
    { items: [{ to: '/admin', labelKey: 'nav.dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true }] },
    {
      labelKey: 'nav.workforce',
      items: [
        { to: '/admin/opportunities', labelKey: 'nav.opportunities', icon: <Briefcase className="h-4 w-4" />, badge: openRequests, permission: 'hiring.view' },
        { to: '/admin/requests', labelKey: 'nav.requests', icon: <ClipboardList className="h-4 w-4" />, permission: 'hiring.view' },
        { to: '/admin/applications', labelKey: 'nav.applications', icon: <FileText className="h-4 w-4" />, badge: newApplications, permission: 'applications.view' },
        { to: '/admin/pipeline', labelKey: 'nav.pipeline', icon: <Columns3 className="h-4 w-4" />, permission: 'applications.view' },
        { to: '/admin/workforce-tracking', labelKey: 'nav.workforceTracking', icon: <Radio className="h-4 w-4" />, badge: working, permission: 'workforce_tracking.view' },
      ],
    },
    {
      labelKey: 'nav.drivers',
      items: [
        { to: '/admin/drivers', labelKey: 'nav.allDrivers', icon: <Users className="h-4 w-4" />, end: true, permission: 'drivers.view' },
        { to: '/admin/drivers/available', labelKey: 'nav.availableDrivers', icon: <Bike className="h-4 w-4" />, badge: availableDrivers, permission: 'drivers.view' },
        { to: '/admin/drivers/hired', labelKey: 'nav.hiredDrivers', icon: <UserCheck className="h-4 w-4" />, permission: 'drivers.view' },
      ],
    },
    {
      labelKey: 'nav.companies',
      items: [
        { to: '/admin/companies', labelKey: 'nav.allCompanies', icon: <Building2 className="h-4 w-4" />, end: true, permission: 'companies.view' },
        { to: '/admin/companies/hiring', labelKey: 'nav.hiringCompanies', icon: <Briefcase className="h-4 w-4" />, permission: 'companies.view' },
        { to: '/admin/integrations', labelKey: 'nav.integrations', icon: <PlugZap className="h-4 w-4" />, badge: failingIntegrations, permission: 'integrations.view' },
      ],
    },
    {
      labelKey: 'nav.finance',
      items: [
        { to: '/admin/salaries', labelKey: 'nav.salaries', icon: <Banknote className="h-4 w-4" />, permission: 'finance.view' },
        { to: '/admin/payments', labelKey: 'nav.payments', icon: <Wallet className="h-4 w-4" />, badge: overduePayments, permission: 'finance.view' },
        { to: '/admin/payouts', labelKey: 'nav.payouts', icon: <Wallet className="h-4 w-4" />, permission: 'finance.view' },
        { to: '/admin/invoices', labelKey: 'nav.invoices', icon: <ReceiptText className="h-4 w-4" />, permission: 'finance.view' },
        { to: '/admin/revenue', labelKey: 'nav.revenue', icon: <TrendingUp className="h-4 w-4" />, permission: 'finance.view' },
      ],
    },
    {
      labelKey: 'nav.performance',
      items: [
        { to: '/admin/performance', labelKey: 'nav.driverPerformance', icon: <Gauge className="h-4 w-4" />, permission: 'drivers.view' },
        { to: '/admin/ratings', labelKey: 'nav.ratings', icon: <Star className="h-4 w-4" />, permission: 'drivers.view' },
        { to: '/admin/reports', labelKey: 'nav.reports', icon: <FileText className="h-4 w-4" />, permission: 'reports.view' },
      ],
    },
    {
      labelKey: 'nav.people',
      items: [
        { to: '/admin/employees', labelKey: 'nav.employees', icon: <UserCog className="h-4 w-4" />, permission: 'employees.view' },
        { to: '/admin/roles', labelKey: 'nav.roles', icon: <ShieldCheck className="h-4 w-4" />, permission: 'employees.view' },
        { to: '/admin/audit-logs', labelKey: 'nav.auditLogs', icon: <ScrollText className="h-4 w-4" />, permission: 'audit.view' },
      ],
    },
    {
      labelKey: 'nav.communication',
      items: [{ to: '/admin/notifications', labelKey: 'nav.notifications', icon: <Bell className="h-4 w-4" /> }],
    },
    {
      labelKey: 'nav.administration',
      items: [{ to: '/admin/settings', labelKey: 'nav.settings', icon: <Settings className="h-4 w-4" /> }],
    },
  ]

  // The four places this role works from, in the order they matter.
  // Anything the role cannot see is skipped, so a finance account gets a
  // finance bar and a recruiter gets a hiring one, from one list.
  const tabCandidates: GatedItem[] = [
    { to: '/admin', labelKey: 'nav.dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/admin/applications', labelKey: 'nav.applications', icon: <FileText className="h-4 w-4" />, badge: newApplications, permission: 'applications.view' },
    { to: '/admin/payments', labelKey: 'tab.payments', icon: <Wallet className="h-4 w-4" />, badge: overduePayments, permission: 'finance.view' },
    { to: '/admin/drivers', labelKey: 'nav.drivers', icon: <Users className="h-4 w-4" />, end: true, permission: 'drivers.view' },
    { to: '/admin/companies', labelKey: 'nav.companies', icon: <Building2 className="h-4 w-4" />, end: true, permission: 'companies.view' },
    { to: '/admin/workforce-tracking', labelKey: 'tab.tracking', icon: <Radio className="h-4 w-4" />, badge: working, permission: 'workforce_tracking.view' },
  ]
  const tabs = tabCandidates.filter((item) => !item.permission || can(item.permission))

  const visible: NavSection[] = sections
    .map((section) => ({
      labelKey: section.labelKey,
      items: section.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((section) => section.items.length > 0)

  return <PortalLayout portal="admin" sections={visible} tabs={tabs} footerKey="portal.admin" />
}
