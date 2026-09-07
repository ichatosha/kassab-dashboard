import { Briefcase, FileText, LayoutDashboard, UserRound, Wallet } from 'lucide-react'
import { PortalLayout } from './PortalLayout'
import type { NavSection } from './Sidebar'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'

// The driver's own view: find work, follow applications, get paid.
export function DeliveryLayout() {
  const { user } = useAuth()
  const { applications, requests } = useAppState()

  const openJobs = requests.filter((r) => OPEN_REQUEST_STATUSES.includes(r.status)).length
  const myApplications = applications.filter((a) => a.driverId === user?.driverId).length

  const sections: NavSection[] = [
    { items: [{ to: '/delivery', labelKey: 'nav.overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true }] },
    {
      labelKey: 'nav.work',
      items: [
        { to: '/delivery/jobs', labelKey: 'nav.findJobs', icon: <Briefcase className="h-4 w-4" />, badge: openJobs, end: true },
        { to: '/delivery/applications', labelKey: 'nav.myApplications', icon: <FileText className="h-4 w-4" />, badge: myApplications },
      ],
    },
    {
      labelKey: 'nav.account',
      items: [
        { to: '/delivery/wallet', labelKey: 'nav.myWallet', icon: <Wallet className="h-4 w-4" /> },
        { to: '/delivery/profile', labelKey: 'nav.myProfile', icon: <UserRound className="h-4 w-4" /> },
      ],
    },
  ]

  return (
    <PortalLayout
      portal="delivery"
      sections={sections}
      footerKey="portal.delivery"
      searchable={false}
      notifications={false}
      settingsPath="/delivery/profile"
    />
  )
}
