import { Badge } from '../ui/Badge'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import {
  applicationKey, applicationTone, driverKey, driverTone, invoiceKey,
  invoiceTone, paymentKey, paymentTone, payoutKey, payoutTone, requestKey,
  requestTone,
} from '../../lib/status'
import type {
  ApplicationStatus, Company, DriverStatus, InvoiceStatus, PaymentStatus,
  PayoutStatus, WorkforceRequestStatus,
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
