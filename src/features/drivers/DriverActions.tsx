import { useState } from 'react'
import { BadgeCheck, OctagonPause, RotateCcw, ShieldQuestion, XOctagon } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useToast } from '../../components/ui/Toast'
import type { Driver } from '../../types/domain'

export function DriverActions({ driver, size = 'sm' }: { driver: Driver; size?: 'sm' | 'md' }) {
  const { t } = useI18n()
  const { dispatch } = useAppState()
  const { toast } = useToast()
  const [confirmReject, setConfirmReject] = useState(false)

  const set = (status: Driver['status'], msg: string) => {
    dispatch({ type: 'setDriverStatus', driverId: driver.id, status })
    toast(msg)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {driver.status === 'pending_review' && (
        <>
          <Button size={size} variant="success" icon={<BadgeCheck className="h-4 w-4" aria-hidden />} onClick={() => set('approved', t('drivers.approved'))}>
            {t('drivers.approve')}
          </Button>
          <Button size={size} variant="danger" icon={<XOctagon className="h-4 w-4" aria-hidden />} onClick={() => setConfirmReject(true)}>
            {t('drivers.reject')}
          </Button>
          <Button size={size} variant="secondary" icon={<ShieldQuestion className="h-4 w-4" aria-hidden />} onClick={() => toast(t('drivers.reviewRequested'), 'info')}>
            {t('drivers.requestReview')}
          </Button>
        </>
      )}
      {driver.status === 'approved' && (
        <Button size={size} variant="secondary" icon={<OctagonPause className="h-4 w-4" aria-hidden />} onClick={() => set('suspended', t('drivers.suspended'))}>
          {t('drivers.suspend')}
        </Button>
      )}
      {(driver.status === 'suspended' || driver.status === 'rejected') && (
        <Button size={size} variant="success" icon={<RotateCcw className="h-4 w-4" aria-hidden />} onClick={() => set('approved', t('drivers.approved'))}>
          {t('drivers.reinstate')}
        </Button>
      )}
      <ConfirmDialog
        open={confirmReject}
        title={t('approvals.rejectConfirmTitle')}
        body={t('approvals.rejectConfirmBody')}
        danger
        confirmLabel={t('drivers.reject')}
        onConfirm={() => set('rejected', t('drivers.rejected'))}
        onClose={() => setConfirmReject(false)}
      />
    </div>
  )
}
