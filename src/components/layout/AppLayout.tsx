import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuth } from '../../store/auth'
import { useAppState } from '../../store/AppState'
import { PageSkeleton } from '../ui/Skeleton'
import { Button } from '../ui/Button'
import { useI18n } from '../../i18n'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { status } = useAppState()
  const { t } = useI18n()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ms-60">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1400px] px-4 py-5 lg:px-6">
          {status === 'loading' && <PageSkeleton />}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="text-lg font-semibold text-ink-900">{t('error.title')}</p>
              <p className="text-sm text-ink-500">{t('error.body')}</p>
              <Button onClick={() => window.location.reload()}>{t('error.retry')}</Button>
            </div>
          )}
          {status === 'ready' && <Outlet />}
        </main>
      </div>
    </div>
  )
}
