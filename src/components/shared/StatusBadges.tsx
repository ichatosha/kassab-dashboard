import { Badge } from '../ui/Badge'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import {
  applicationKey, applicationTone, driverKey, driverTone, employeeStatusTone,
  integrationStatusTone, invoiceKey, invoiceTone, orderStatusTone, paymentKey,
  paymentTone, payoutKey, payoutTone, requestKey, requestTone, workStatusTone,
} from '../../lib/status'
import type {
  ApplicationStatus, Company, DeliveryOrderStatus, DriverStatus,
  DriverWorkStatus, EmployeeStatus, IntegrationStatus, InvoiceStatus,
  PaymentStatus, PayoutStatus, WorkforceRequestStatus,
} from '../../types/domain'

export function ApplicationBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useI18n()
  const live = status === 'new'
  return (
    <Badge tone={applicationTone[status]} dot={live} pulse={live}>
      {t(applicationKey(status))}
    </Badge>
  )
}

export function RequestBadge({ status }: { status: WorkforceRequestStatus }) {
  const { t } = useI18n()
  const live = status === 'open' || status === 'reviewing'
  return (
    <Badge tone={requestTone[status]} dot={live} pulse={live}>
      {t(requestKey(status))}
    </Badge>
  )
}

export function DriverBadge({ status }: { status: DriverStatus }) {
  const { t } = useI18n()
  return (
    <Badge tone={driverTone[status]} dot={status === 'available'} pulse={status === 'available'}>
      {t(driverKey(status))}
    </Badge>
  )
}

export function CompanyBadge({ status }: { status: Company['status'] }) {
  const { t } = useI18n()
  const tone = status === 'active' ? 'success' : status === 'pending_review' ? 'warning' : 'neutral'
  return <Badge tone={tone}>{t(`companyStatus.${status}` as TranslationKey)}</Badge>
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const { t } = useI18n()
  return <Badge tone={paymentTone[status]}>{t(paymentKey(status))}</Badge>
}

export function PayoutBadge({ status }: { status: PayoutStatus }) {
  const { t } = useI18n()
  return <Badge tone={payoutTone[status]}>{t(payoutKey(status))}</Badge>
}

export function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useI18n()
  return <Badge tone={invoiceTone[status]}>{t(invoiceKey(status))}</Badge>
}

export function WorkStatusBadge({ status }: { status: DriverWorkStatus }) {
  const { t } = useI18n()
  const live = status === 'on_delivery' || status === 'at_pickup'
  return (
    <Badge tone={workStatusTone[status]} dot pulse={live}>
      {t(`workStatus.${status}` as TranslationKey)}
    </Badge>
  )
}

export function OrderStatusBadge({ status }: { status: DeliveryOrderStatus }) {
  const { t } = useI18n()
  return <Badge tone={orderStatusTone[status]}>{t(`orderStatus.${status}` as TranslationKey)}</Badge>
}

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  const { t } = useI18n()
  return (
    <Badge tone={integrationStatusTone[status]} dot pulse={status === 'syncing'}>
      {t(`intStatus.${status}` as TranslationKey)}
    </Badge>
  )
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const { t } = useI18n()
  return <Badge tone={employeeStatusTone[status]}>{t(`empStatus.${status}` as TranslationKey)}</Badge>
}
