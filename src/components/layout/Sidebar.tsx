import { NavLink } from 'react-router-dom'
import {
  BadgeCheck, Banknote, Bell, Bike, Building2, ChartColumn, ClipboardList,
  GitBranch, LayoutDashboard, MapPin, Percent, Radar, Settings, Tags,
  Users, Wallet, ReceiptText,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { Logo } from './Logo'
import { useAppState } from '../../store/AppState'

interface NavItem {
  to: string
  labelKey: TranslationKey
  icon: ReactNode
  badge?: number
}

interface NavSection {
  labelKey?: TranslationKey
  items: NavItem[]
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, dir } = useI18n()
  const { drivers, orders } = useAppState()

  const pendingApprovals = drivers.filter((d) => d.status === 'pending_review').length
  const unassigned = orders.filter((o) => o.status === 'new').length

  const sections: NavSection[] = [
    {
      items: [{ to: '/dashboard', labelKey: 'nav.dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }],
    },
    {
      labelKey: 'nav.operations',
      items: [
        { to: '/orders', labelKey: 'nav.orders', icon: <ClipboardList className="h-4 w-4" />, badge: unassigned },
        { to: '/tracking', labelKey: 'nav.tracking', icon: <Radar className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.fleet',
      items: [
        { to: '/drivers', labelKey: 'nav.drivers', icon: <Users className="h-4 w-4" /> },
        { to: '/vehicles', labelKey: 'nav.vehicles', icon: <Bike className="h-4 w-4" /> },
        { to: '/approvals', labelKey: 'nav.approvals', icon: <BadgeCheck className="h-4 w-4" />, badge: pendingApprovals },
      ],
    },
    {
      labelKey: 'nav.customers',
      items: [
        { to: '/companies', labelKey: 'nav.companies', icon: <Building2 className="h-4 w-4" /> },
        { to: '/branches', labelKey: 'nav.branches', icon: <GitBranch className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.finance',
      items: [
        { to: '/finance', labelKey: 'nav.revenue', icon: <Banknote className="h-4 w-4" /> },
        { to: '/commissions', labelKey: 'nav.commissions', icon: <Percent className="h-4 w-4" /> },
        { to: '/wallets', labelKey: 'nav.wallets', icon: <Wallet className="h-4 w-4" /> },
        { to: '/invoices', labelKey: 'nav.invoices', icon: <ReceiptText className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: 'nav.pricing',
      items: [{ to: '/pricing', labelKey: 'nav.pricing', icon: <Tags className="h-4 w-4" /> }],
    },
    {
      labelKey: 'nav.analytics',
      items: [{ to: '/reports', labelKey: 'nav.reports', icon: <ChartColumn className="h-4 w-4" /> }],
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
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-60 flex-col border-e border-ink-200 bg-white transition-transform duration-200 lg:!translate-x-0 ${
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
          <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
            <MapPin className="h-3 w-3" aria-hidden />
            {t('brand.descriptor')}
          </p>
          <p className="mt-1 text-[10px] text-ink-300" dir="ltr">
            Designed &amp; Developed by BrandMe Agency [HΣ]
          </p>
        </div>
      </aside>
    </>
  )
}
