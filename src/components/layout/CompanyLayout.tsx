import { Building2, ClipboardList, LayoutDashboard, ReceiptText, UserCheck, Users } from 'lucide-react'
import { PortalLayout } from './PortalLayout'
import type { NavSection } from './Sidebar'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'

// The employer's own view: their requests, their candidates, their bill.
// Nothing here reaches beyond the company the account belongs to.
export function CompanyLayout() {
  const { user } = useAuth()
  const { applications, requests } = useAppState()

  const companyId = user?.companyId
  const myRequestIds = requests.filter((r) => r.companyId === companyId).map((r) => r.id)
  const newApplicants = applications.filter(
    (a) => myRequestIds.includes(a.requestId) && ['new', 'under_review'].includes(a.status),
  ).length

  const sections: NavSection[] = [
    { items: [{ to: '/company', labelKey: 'nav.overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true }] },
    {
      labelKey: 'nav.workforce',
      items: [
        { to: '/company/requests', labelKey: 'nav.myRequests', icon: <ClipboardList className="h-4 w-4" />, end: true },
        { to: '/company/applicants', labelKey: 'nav.candidates', icon: <Users className="h-4 w-4" />, badge: newApplicants },
        { to: '/company/drivers', labelKey: 'nav.myDrivers', icon: <UserCheck className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.finance',
      items: [{ to: '/company/billing', labelKey: 'nav.billing', icon: <ReceiptText className="h-4 w-4" /> }],
    },
    {
      labelKey: 'nav.administration',
      items: [{ to: '/company/settings', labelKey: 'nav.companyProfile', icon: <Building2 className="h-4 w-4" /> }],
    },
  ]

  return (
    <PortalLayout
      portal="company"
      sections={sections}
      footerKey="portal.company"
      searchable={false}
      notifications={false}
      settingsPath="/company/settings"
    />
  )
}
