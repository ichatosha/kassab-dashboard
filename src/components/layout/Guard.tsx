import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../../store/auth'
import { useI18n } from '../../i18n'
import type { Permission } from '../../types/domain'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

// A staff route that needs a permission. Navigation already hides what a
// role cannot reach; this is what happens when someone types the URL
// anyway — an honest refusal rather than a blank screen.
export function Guard({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useAuth()
  const { t } = useI18n()

  if (can(permission)) return <>{children}</>

  return (
    <div className="animate-fade-in">
      <Card>
        <EmptyState
          title={t('guard.title')}
          hint={t('guard.body')}
          icon={<Lock className="h-6 w-6" />}
          action={
            <Link to="/admin">
              <Button size="sm" variant="secondary">{t('nav.dashboard')}</Button>
            </Link>
          }
        />
        <p className="mt-3 text-center font-mono text-[11px] text-ink-400">{permission}</p>
      </Card>
    </div>
  )
}
