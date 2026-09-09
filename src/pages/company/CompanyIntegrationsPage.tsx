import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { IntegrationStatusBadge } from '../../components/shared/StatusBadges'
import { IntegrationSetupPanel } from '../../features/integrations/IntegrationSetupPanel'

// Two ways to get delivery visibility: connect the system the company
// already runs, or — when there is no such system — run the deliveries on
// Kassab itself. Both end in the same place: orders Kassab can see, and a
// driver moving on the tracking map. The panel itself is shared with the
// admin portal, so staff and employer configure the identical thing.
export function CompanyIntegrationsPage() {
  const { t } = useI18n()
  const { integrations } = useAppState()
  const { company, drivers } = useCompanyScope()

  const integration = useMemo(
    () => integrations.find((i) => i.companyId === company?.id && i.status !== 'disconnected'),
    [integrations, company],
  )

  if (!company) return <EmptyState title={t('notFound.title')} />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('int.companyTitle')}
        subtitle={t('int.companySubtitle')}
        actions={integration && <IntegrationStatusBadge status={integration.status} />}
      />
      <IntegrationSetupPanel
        companyId={company.id}
        drivers={drivers}
        ordersPath="/company/orders"
        trackingPath="/company/workforce-tracking"
      />
    </div>
  )
}
