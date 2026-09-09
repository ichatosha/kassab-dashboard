import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { IntegrationStatusBadge } from '../../components/shared/StatusBadges'
import { IntegrationSetupPanel } from '../../features/integrations/IntegrationSetupPanel'

// Kassab staff setting a company up. Same panel the employer sees, so
// support can walk a company through it — or do it for them — without a
// second, divergent screen to maintain.
export function IntegrationSetupPage() {
  const { t, locale } = useI18n()
  const { companyId = '' } = useParams()
  const { companies, drivers, integrations } = useAppState()
  const { can } = useAuth()

  const company = companies.find((c) => c.id === companyId)
  const companyDrivers = useMemo(
    () => drivers.filter((d) => d.status === 'hired' && d.employment?.companyId === companyId),
    [drivers, companyId],
  )
  const integration = integrations.find((i) => i.companyId === companyId && i.status !== 'disconnected')

  const Back = locale === 'ar' ? ArrowRight : ArrowLeft

  if (!company) {
    return (
      <EmptyState
        title={t('notFound.title')}
        action={
          <Link to="/admin/integrations">
            <Button size="sm" variant="secondary">{t('int.backToList')}</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/admin/integrations"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-800"
      >
        <Back className="h-4 w-4" aria-hidden />
        {t('int.backToList')}
      </Link>

      <PageHeader
        title={locale === 'ar' ? company.nameAr : company.name}
        subtitle={t('int.setupSubtitle')}
        actions={integration && <IntegrationStatusBadge status={integration.status} />}
      />

      {!can('integrations.manage') && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{t('int.viewOnly')}</p>
      )}

      <IntegrationSetupPanel
        companyId={company.id}
        drivers={companyDrivers}
        ordersPath="/admin/workforce-tracking"
        trackingPath="/admin/workforce-tracking"
        readOnly={!can('integrations.manage')}
      />
    </div>
  )
}
