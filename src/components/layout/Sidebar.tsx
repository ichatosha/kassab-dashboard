import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Banknote, Bell, Bike, Briefcase, Building2, ClipboardList, Columns3,
  FileText, Gauge, LayoutDashboard, ReceiptText, Settings, Star, TrendingUp,
  UserCheck, Users, Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { Logo } from './Logo'
import { BrandCredit } from '../shared/BrandCredit'
import { useAppState } from '../../store/AppState'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'

interface NavItem {
  to: string
  labelKey: TranslationKey
  icon: ReactNode
  badge?: number
  end?: boolean
}

interface NavSection {
  labelKey?: TranslationKey
  items: NavItem[]
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, dir } = useI18n()
  const { applications, requests, drivers, payments } = useAppState()

  // While the mobile drawer is open it owns the screen: Escape closes it and
  // the page behind it must not scroll.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const newApplications = applications.filter((a) => a.status === 'new').length
  const openRequests = requests.filter((r) => OPEN_REQUEST_STATUSES.includes(r.status)).length
  const availableDrivers = drivers.filter((d) => d.status === 'available').length
  const overduePayments = payments.filter((p) => p.status === 'overdue').length

  const sections: NavSection[] = [
    { items: [{ to: '/dashboard', labelKey: 'nav.dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }] },
    {
      labelKey: 'nav.workforce',
      items: [
        { to: '/opportunities', labelKey: 'nav.opportunities', icon: <Briefcase className="h-4 w-4" />, badge: openRequests },
        { to: '/requests', labelKey: 'nav.requests', icon: <ClipboardList className="h-4 w-4" /> },
        { to: '/applications', labelKey: 'nav.applications', icon: <FileText className="h-4 w-4" />, badge: newApplications },
        { to: '/pipeline', labelKey: 'nav.pipeline', icon: <Columns3 className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.drivers',
      items: [
        { to: '/drivers', labelKey: 'nav.allDrivers', icon: <Users className="h-4 w-4" />, end: true },
        { to: '/drivers/available', labelKey: 'nav.availableDrivers', icon: <Bike className="h-4 w-4" />, badge: availableDrivers },
        { to: '/drivers/hired', labelKey: 'nav.hiredDrivers', icon: <UserCheck className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.companies',
      items: [
        { to: '/companies', labelKey: 'nav.allCompanies', icon: <Building2 className="h-4 w-4" />, end: true },
        { to: '/companies/hiring', labelKey: 'nav.hiringCompanies', icon: <Briefcase className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.finance',
      items: [
        { to: '/salaries', labelKey: 'nav.salaries', icon: <Banknote className="h-4 w-4" /> },
        { to: '/payments', labelKey: 'nav.payments', icon: <Wallet className="h-4 w-4" />, badge: overduePayments },
        { to: '/payouts', labelKey: 'nav.payouts', icon: <Wallet className="h-4 w-4" /> },
        { to: '/invoices', labelKey: 'nav.invoices', icon: <ReceiptText className="h-4 w-4" /> },
        { to: '/revenue', labelKey: 'nav.revenue', icon: <TrendingUp className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.performance',
      items: [
        { to: '/performance', labelKey: 'nav.driverPerformance', icon: <Gauge className="h-4 w-4" /> },
        { to: '/ratings', labelKey: 'nav.ratings', icon: <Star className="h-4 w-4" /> },
        { to: '/reports', labelKey: 'nav.reports', icon: <FileText className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.communication',
      items: [{ to: '/notifications', labelKey: 'nav.notifications', icon: <Bell className="h-4 w-4" /> }],
    },
    {
      labelKey: 'nav.administration',
      items: [{ to: '/settings', labelKey: 'nav.settings', icon: <Settings className="h-4 w-4" /> }],
    },
  ]

  return (
    <>
      {open && (
        <button
          aria-hidden
          tabIndex={-1}
          className="fixed inset-0 z-30 bg-night-950/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-60 flex-col border-e border-ink-200 bg-surface transition-transform duration-200 lg:!translate-x-0 ${
          open ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center border-b border-ink-100 px-4">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto scroll-thin px-3 py-3">
          {sections.map((section, i) => (
            <div key={i} className="mb-1">
              {section.labelKey && (
                <p className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  {t(section.labelKey)}
                </p>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                    }`
                  }
                >
                  <span aria-hidden>{item.icon}</span>
                  <span className="flex-1">{t(item.labelKey)}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="tnum inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-ink-100 px-4 py-3">
          <p className="text-[11px] text-ink-400">{t('brand.descriptor')}</p>
          <BrandCredit className="mt-1 text-[10px] text-ink-300" />
        </div>
      </aside>
    </>
  )
}
