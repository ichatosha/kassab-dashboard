import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { WorkforceTrackingView } from '../../features/tracking/WorkforceTrackingView'

// The same operations view, scoped to one employer. A company never sees a
// driver working for anyone else.
export function CompanyTrackingPage() {
  const { t } = useI18n()
  const { liveStates } = useAppState()
  const { company } = useCompanyScope()

  const mine = useMemo(
    () => liveStates.filter((s) => s.companyId === company?.id),
    [liveStates, company],
  )

  return (
    <WorkforceTrackingView
      title={t('track.companyTitle')}
      subtitle={t('track.companySubtitle')}
      states={mine}
      showCompany={false}
    />
  )
}
