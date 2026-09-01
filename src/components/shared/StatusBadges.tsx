import { Badge } from '../ui/Badge'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import {
  driverStatusTone, invoiceStatusTone, orderStatusKey, orderStatusTone,
} from '../../lib/status'
import type { Driver, DriverAccountStatus, InvoiceStatus, OrderStatus } from '../../types/domain'

export function OrderStatusBadge({ status, pulse }: { status: OrderStatus; pulse?: boolean }) {
  const { t } = useI18n()
  const active = ['new', 'assigned', 'en_route_pickup', 'picked_up', 'en_route_customer'].includes(status)
  return (
    <Badge tone={orderStatusTone[status]} dot pulse={pulse ?? active}>
      {t(orderStatusKey(status))}
    </Badge>
  )
}

export function DriverApprovalBadge({ status }: { status: DriverAccountStatus }) {
  const { t } = useI18n()
  return <Badge tone={driverStatusTone[status]}>{t(`driverStatus.${status}` as TranslationKey)}</Badge>
}

export function ConnectionBadge({ driver }: { driver: Driver }) {
  const { t } = useI18n()
  if (driver.connection === 'online') {
    const delivering = driver.activity === 'delivering'
    return (
      <Badge tone={delivering ? 'violet' : 'success'} dot pulse>
        {t(delivering ? 'driverStatus.delivering' : 'driverStatus.online')}
      </Badge>
    )
  }
  return <Badge tone="neutral">{t('driverStatus.offline')}</Badge>
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useI18n()
  return <Badge tone={invoiceStatusTone[status]}>{t(`invoices.status.${status}` as TranslationKey)}</Badge>
}
