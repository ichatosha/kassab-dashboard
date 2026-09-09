import { Bookmark, Briefcase, FileText, LayoutDashboard, Navigation, UserRound, Wallet } from 'lucide-react'
import { PortalLayout } from './PortalLayout'
import type { NavItem, NavSection } from './Sidebar'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'

// The driver's own view: find work, follow applications, get paid.
export function DeliveryLayout() {
  const { user } = useAuth()
  const { applications, requests, savedOpportunities, likedOpportunities, orders, liveStates } = useAppState()

  const openJobs = requests.filter((r) => OPEN_REQUEST_STATUSES.includes(r.status)).length
  const myApplications = applications.filter((a) => a.driverId === user?.driverId).length
  // One badge for everything the driver kept, saved or liked
  const kept = new Set([...savedOpportunities, ...likedOpportunities]).size
  const working = liveStates.some((l) => l.driverId === user?.driverId)
  const activeRun = orders.filter(
    (o) => o.driverId === user?.driverId && ['assigned', 'picked_up', 'delivering'].includes(o.status),
  ).length

  const sections: NavSection[] = [
    { items: [{ to: '/delivery', labelKey: 'nav.overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true }] },
    {
      labelKey: 'nav.work',
      items: [
        // The job screen only matters once a driver is actually placed
        ...(working
          ? [{ to: '/delivery/work', labelKey: 'nav.myJob' as const, icon: <Navigation className="h-4 w-4" />, badge: activeRun }]
          : []),
        { to: '/delivery/jobs', labelKey: 'nav.findJobs', icon: <Briefcase className="h-4 w-4" />, badge: openJobs, end: true },
        { to: '/delivery/saved', labelKey: 'nav.savedJobs', icon: <Bookmark className="h-4 w-4" />, badge: kept },
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

  // A placed driver opens the app to run the delivery in front of them;
  // one still looking opens it to find work. The bar follows that.
  const tabs: NavItem[] = [
    { to: '/delivery', labelKey: 'nav.overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    ...(working
      ? [{ to: '/delivery/work', labelKey: 'nav.myJob' as const, icon: <Navigation className="h-4 w-4" />, badge: activeRun }]
      : []),
    { to: '/delivery/jobs', labelKey: 'nav.findJobs', icon: <Briefcase className="h-4 w-4" />, badge: openJobs, end: true },
    ...(working
      ? []
      : [{ to: '/delivery/saved', labelKey: 'tab.saved' as const, icon: <Bookmark className="h-4 w-4" />, badge: kept }]),
    { to: '/delivery/applications', labelKey: 'tab.applications', icon: <FileText className="h-4 w-4" />, badge: myApplications },
  ]

  return (
    <PortalLayout
      portal="delivery"
      sections={sections}
      tabs={tabs}
      footerKey="portal.delivery"
      searchable={false}
      notifications={false}
      settingsPath="/delivery/profile"
    />
  )
}
