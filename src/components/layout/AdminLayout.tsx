import {
  Banknote, Bell, Bike, Briefcase, Building2, ClipboardList, Columns3,
  FileText, Gauge, LayoutDashboard, ReceiptText, Settings, Star, TrendingUp,
  UserCheck, Users, Wallet,
} from 'lucide-react'
import { PortalLayout } from './PortalLayout'
import type { NavSection } from './Sidebar'
import { useAppState } from '../../store/AppState'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'

// Kassab's own operations room: every company, driver and settlement.
export function AdminLayout() {
  const { applications, requests, drivers, payments } = useAppState()

  const newApplications = applications.filter((a) => a.status === 'new').length
  const openRequests = requests.filter((r) => OPEN_REQUEST_STATUSES.includes(r.status)).length
  const availableDrivers = drivers.filter((d) => d.status === 'available').length
  const overduePayments = payments.filter((p) => p.status === 'overdue').length

  const sections: NavSection[] = [
    { items: [{ to: '/admin', labelKey: 'nav.dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true }] },
    {
      labelKey: 'nav.workforce',
      items: [
        { to: '/admin/opportunities', labelKey: 'nav.opportunities', icon: <Briefcase className="h-4 w-4" />, badge: openRequests },
        { to: '/admin/requests', labelKey: 'nav.requests', icon: <ClipboardList className="h-4 w-4" /> },
        { to: '/admin/applications', labelKey: 'nav.applications', icon: <FileText className="h-4 w-4" />, badge: newApplications },
        { to: '/admin/pipeline', labelKey: 'nav.pipeline', icon: <Columns3 className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.drivers',
      items: [
        { to: '/admin/drivers', labelKey: 'nav.allDrivers', icon: <Users className="h-4 w-4" />, end: true },
        { to: '/admin/drivers/available', labelKey: 'nav.availableDrivers', icon: <Bike className="h-4 w-4" />, badge: availableDrivers },
        { to: '/admin/drivers/hired', labelKey: 'nav.hiredDrivers', icon: <UserCheck className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.companies',
      items: [
        { to: '/admin/companies', labelKey: 'nav.allCompanies', icon: <Building2 className="h-4 w-4" />, end: true },
        { to: '/admin/companies/hiring', labelKey: 'nav.hiringCompanies', icon: <Briefcase className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.finance',
      items: [
        { to: '/admin/salaries', labelKey: 'nav.salaries', icon: <Banknote className="h-4 w-4" /> },
        { to: '/admin/payments', labelKey: 'nav.payments', icon: <Wallet className="h-4 w-4" />, badge: overduePayments },
        { to: '/admin/payouts', labelKey: 'nav.payouts', icon: <Wallet className="h-4 w-4" /> },
        { to: '/admin/invoices', labelKey: 'nav.invoices', icon: <ReceiptText className="h-4 w-4" /> },
        { to: '/admin/revenue', labelKey: 'nav.revenue', icon: <TrendingUp className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.performance',
      items: [
        { to: '/admin/performance', labelKey: 'nav.driverPerformance', icon: <Gauge className="h-4 w-4" /> },
        { to: '/admin/ratings', labelKey: 'nav.ratings', icon: <Star className="h-4 w-4" /> },
        { to: '/admin/reports', labelKey: 'nav.reports', icon: <FileText className="h-4 w-4" /> },
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

  return <PortalLayout portal="admin" sections={sections} footerKey="portal.admin" />
}
