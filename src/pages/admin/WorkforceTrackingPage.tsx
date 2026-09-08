import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { WorkforceTrackingView } from '../../features/tracking/WorkforceTrackingView'

// Kassab watches every driver it placed, across every connected company.
export function AdminWorkforceTrackingPage() {
  const { t } = useI18n()
  const { liveStates } = useAppState()

  return (
    <WorkforceTrackingView
      title={t('track.adminTitle')}
      subtitle={t('track.adminSubtitle')}
      states={liveStates}
      driverHref={(driverId) => `/admin/drivers/profile/${driverId}`}
    />
  )
}
