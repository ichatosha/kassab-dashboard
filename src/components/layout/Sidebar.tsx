import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { Logo } from './Logo'
import { BrandCredit } from '../shared/BrandCredit'

export interface NavItem {
  to: string
  labelKey: TranslationKey
  icon: ReactNode
  badge?: number
  end?: boolean
}

export interface NavSection {
  labelKey?: TranslationKey
  items: NavItem[]
}

// Presentational: each portal supplies its own navigation.
export function Sidebar({
  open, onClose, sections, footerKey,
}: {
  open: boolean
  onClose: () => void
  sections: NavSection[]
  footerKey: TranslationKey
}) {
  const { t, dir } = useI18n()

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
          <p className="text-[11px] text-ink-400">{t(footerKey)}</p>
          <BrandCredit className="mt-1 text-[10px] text-ink-300" />
        </div>
      </aside>
    </>
  )
}
