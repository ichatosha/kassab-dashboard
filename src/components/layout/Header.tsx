import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Languages, LogOut, Menu } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { formatRelative } from '../../lib/format'
import { GlobalSearch, MobileSearch } from './GlobalSearch'
import { ThemeToggle } from '../shared/ThemeToggle'
import { Avatar } from '../ui/misc'

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onOutside])
  return ref
}

function NotificationsMenu() {
  const { t, locale } = useI18n()
  const { notifications, dispatch } = useAppState()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useClickOutside(() => setOpen(false))

  const unread = notifications.filter((n) => !n.read).length
  const latest = notifications.slice(0, 5)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`${t('nav.notifications')}${unread > 0 ? ` (${unread})` : ''}`}
        className="relative cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="tnum absolute -top-0.5 -end-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        // Anchored to the bell on desktop; on a phone it spans the screen
        // instead of overflowing past the edge.
        <div className="fixed inset-x-3 top-[4.25rem] z-30 rounded-xl border border-ink-200 bg-surface shadow-pop animate-slide-up sm:absolute sm:inset-x-auto sm:end-0 sm:top-12 sm:w-80">
          <header className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-ink-900">{t('nav.notifications')}</p>
            {unread > 0 && (
              <button
                className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700"
                onClick={() => dispatch({ type: 'markAllNotificationsRead' })}
              >
                {t('header.markAllRead')}
              </button>
            )}
          </header>
          <div className="max-h-80 overflow-y-auto scroll-thin py-1">
            {latest.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-500">{t('header.noNotifications')}</p>}
            {latest.map((n) => (
              <button
                key={n.id}
                className="flex w-full cursor-pointer gap-2.5 px-4 py-2.5 text-start transition-colors hover:bg-ink-50"
                onClick={() => {
                  dispatch({ type: 'markNotificationRead', id: n.id })
                  setOpen(false)
                  navigate('/admin/notifications')
                }}
              >
                <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-ink-200' : 'bg-brand-500'}`} />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-ink-800">
                    {t(`notifKind.${n.kind}` as Parameters<typeof t>[0])}
                  </span>
                  <span className="line-clamp-2 block text-xs text-ink-500">{locale === 'ar' ? n.bodyAr : n.body}</span>
                  <span className="block pt-0.5 text-[10px] text-ink-400">{formatRelative(n.at, locale)}</span>
                </span>
              </button>
            ))}
          </div>
          <footer className="border-t border-ink-100 p-2">
            <button
              className="w-full cursor-pointer rounded-lg py-1.5 text-center text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
              onClick={() => {
                setOpen(false)
                navigate('/admin/notifications')
              }}
            >
              {t('header.viewAll')}
            </button>
          </footer>
        </div>
      )}
    </div>
  )
}

function UserMenu({ settingsPath }: { settingsPath: string }) {
  const { t, locale } = useI18n()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  const navigate = useNavigate()

  if (!user) return null
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-ink-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-sm font-medium text-ink-800 sm:block">
          {locale === 'ar' ? user.nameAr : user.name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-400" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute end-0 top-12 z-30 w-56 rounded-xl border border-ink-200 bg-surface py-1.5 shadow-pop animate-slide-up">
          <div className="border-b border-ink-100 px-3.5 pb-2 pt-1">
            <p className="truncate text-xs text-ink-500">{user.email}</p>
            <p className="mt-0.5 text-[11px] font-medium text-brand-700">
              {t(`role.${user.role}` as Parameters<typeof t>[0])}
            </p>
          </div>
          <button
            role="menuitem"
            className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-50"
            onClick={() => {
              setOpen(false)
              navigate(settingsPath)
            }}
          >
            {t('header.profile')}
          </button>
          <button
            role="menuitem"
            className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-sm text-red-700 transition-colors hover:bg-red-50"
            onClick={() => {
              signOut()
              navigate('/login')
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}

// Search and the notification feed are Kassab's own operational tools —
// they cover every driver and company on the platform, so they belong to
// the admin portal only. Employers and drivers get their own signals on
// their home screens.
export function Header({
  onMenuClick, searchable = true, notifications = true, settingsPath = '/admin/settings',
}: {
  onMenuClick: () => void
  searchable?: boolean
  notifications?: boolean
  settingsPath?: string
}) {
  const { t, toggleLocale } = useI18n()
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-1 border-b border-ink-200 bg-surface/95 px-3 backdrop-blur sm:gap-3 sm:px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Menu"
        className="shrink-0 cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      {searchable && <GlobalSearch />}
      <div className="flex-1" />
      {searchable && <MobileSearch />}
      {/* Icon only on phones, where header space is tight */}
      <button
        onClick={toggleLocale}
        aria-label={t('header.language')}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg p-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:px-2.5"
      >
        <Languages className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden />
        <span className="hidden sm:inline">{t('header.language')}</span>
      </button>
      <ThemeToggle className="shrink-0" />
      {notifications && <NotificationsMenu />}
      <UserMenu settingsPath={settingsPath} />
    </header>
  )
}
