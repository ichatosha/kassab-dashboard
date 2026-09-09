import { NavLink } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { NavItem } from './Sidebar'
import { prefetchRoute } from '../../routes/lazyRoutes'

// ── Mobile tab bar ────────────────────────────────────────────────────
// On a phone the sidebar is a drawer nobody opens, so the sections a role
// actually lives in get a fixed bar at the bottom of the screen, the way
// a phone app puts them. Four destinations plus More, which opens the
// same drawer for everything else — the drawer stays the full list, this
// is only the short way to the places that matter for that account.

export function MobileTabBar({ tabs, onMore }: { tabs: NavItem[]; onMore: () => void }) {
  const { t } = useI18n()
  const shown = tabs.slice(0, 4)

  return (
    <nav
      aria-label={t('nav.sections')}
      // Sits above the page but below drawers and modals, and clears the
      // home indicator on phones that have one.
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-surface/95 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {shown.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              onPointerDown={() => prefetchRoute(tab.to)}
              className={({ isActive }) =>
                `flex h-full flex-col items-center gap-1 px-1 pb-1.5 pt-2 text-[10px] font-medium leading-tight transition-colors ${
                  isActive ? 'text-brand-700' : 'text-ink-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`relative flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive ? 'bg-brand-50' : ''
                    }`}
                  >
                    {tab.icon}
                    {tab.badge != null && tab.badge > 0 && (
                      <span className="tnum absolute -end-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </span>
                    )}
                  </span>
                  <span className="line-clamp-1 text-center">{t(tab.labelKey)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}

        <li className="flex-1">
          <button
            onClick={onMore}
            className="flex h-full w-full cursor-pointer flex-col items-center gap-1 px-1 pb-1.5 pt-2 text-[10px] font-medium leading-tight text-ink-500 transition-colors hover:text-ink-800"
          >
            <span aria-hidden className="flex h-7 w-12 items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
            </span>
            <span className="line-clamp-1 text-center">{t('nav.more')}</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
