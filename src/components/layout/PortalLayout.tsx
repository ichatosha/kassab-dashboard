import { Suspense, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import type { Portal } from '../../types/domain'
import type { NavItem, NavSection } from './Sidebar'
import { Sidebar } from './Sidebar'
import { MobileTabBar } from './MobileTabBar'
import { Header } from './Header'
import { useAuth } from '../../store/auth'
import { useAppState } from '../../store/AppState'
import { PageSkeleton } from '../ui/Skeleton'
import { Button } from '../ui/Button'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'

// The shell every portal shares. It also owns the access rule: you must be
// signed in, and an account only ever sees its own portal — a driver who
// lands on /admin is sent back to /delivery rather than shown an error.
export function PortalLayout({
  portal, sections, tabs, footerKey, searchable = true, notifications = true,
  settingsPath = '/admin/settings',
}: {
  portal: Portal
  sections: NavSection[]
  /** The handful of places this account lives in, for the phone tab bar */
  tabs: NavItem[]
  footerKey: TranslationKey
  searchable?: boolean
  notifications?: boolean
  settingsPath?: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, portal: accountPortal, homePath } = useAuth()
  const { status } = useAppState()
  const { t } = useI18n()

  if (!user) return <Navigate to="/login" replace />
  if (accountPortal !== portal) return <Navigate to={homePath} replace />

  return (
    <div className="min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sections={sections}
        footerKey={footerKey}
      />
      <div className="lg:ms-60">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          searchable={searchable}
          notifications={notifications}
          settingsPath={settingsPath}
        />
        {/* The tab bar is fixed, so the page keeps room for it */}
        <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-5 lg:px-6 lg:pb-5">
          {status === 'loading' && <PageSkeleton />}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="text-lg font-semibold text-ink-900">{t('error.title')}</p>
              <p className="text-sm text-ink-500">{t('error.body')}</p>
              <Button onClick={() => window.location.reload()}>{t('error.retry')}</Button>
            </div>
          )}
          {/* Only the page suspends while its chunk loads — the sidebar
              and header stay exactly where they are. */}
          {status === 'ready' && (
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          )}
        </main>
      </div>

      <MobileTabBar tabs={tabs} onMore={() => setSidebarOpen(true)} />
    </div>
  )
}
