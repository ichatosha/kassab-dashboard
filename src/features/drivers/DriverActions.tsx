import { useState } from 'react'
import { BadgeCheck, OctagonPause, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useToast } from '../../components/ui/Toast'
import type { Driver, DriverStatus } from '../../types/domain'

export function DriverActions({ driver, size = 'sm' }: { driver: Driver; size?: 'sm' | 'md' }) {
  const { t } = useI18n()
  const { dispatch } = useAppState()
  const { toast } = useToast()
  const [confirmSuspend, setConfirmSuspend] = useState(false)

  const set = (status: DriverStatus, msg: string) => {
    dispatch({ type: 'setDriverStatus', driverId: driver.id, status })
    toast(msg)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {driver.status === 'under_review' && (
        <Button size={size} variant="success" icon={<BadgeCheck className="h-4 w-4" aria-hidden />} onClick={() => set('available', t('drivers.verified'))}>
          {t('drivers.verify')}
        </Button>
      )}
      {(driver.status === 'available' || driver.status === 'hired') && (
        <Button size={size} variant="secondary" icon={<OctagonPause className="h-4 w-4" aria-hidden />} onClick={() => setConfirmSuspend(true)}>
          {t('drivers.suspend')}
        </Button>
      )}
      {driver.status === 'suspended' && (
        <Button size={size} variant="success" icon={<RotateCcw className="h-4 w-4" aria-hidden />} onClick={() => set('available', t('drivers.reinstated'))}>
          {t('drivers.reinstate')}
        </Button>
      )}
      <ConfirmDialog
        open={confirmSuspend}
        title={t('drivers.suspend')}
        body={t('common.demoAction')}
        danger
        confirmLabel={t('drivers.suspend')}
        onConfirm={() => set('suspended', t('drivers.suspended'))}
        onClose={() => setConfirmSuspend(false)}
      />
    </div>
  )
}
