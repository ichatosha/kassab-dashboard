import { CreditCard, FileBadge, IdCard, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { formatDate } from '../../lib/format'
import type { Driver, DriverDocument } from '../../types/domain'

const docIcons: Record<DriverDocument['kind'], ReactNode> = {
  personal_photo: <UserRound className="h-5 w-5" aria-hidden />,
  national_id: <IdCard className="h-5 w-5" aria-hidden />,
  driving_license: <CreditCard className="h-5 w-5" aria-hidden />,
  vehicle_license: <FileBadge className="h-5 w-5" aria-hidden />,
}

const docTone = { pending: 'warning', approved: 'success', rejected: 'danger' } as const

export function DocumentReview({ driver }: { driver: Driver }) {
  const { t, locale } = useI18n()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {driver.documents.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-ink-200 p-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
            {docIcons[doc.kind]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-900">{t(`approvals.docs.${doc.kind}` as TranslationKey)}</p>
            <p className="tnum text-xs text-ink-400">
              {t('approvals.submitted')}: {formatDate(doc.submittedAt, locale)}
            </p>
          </div>
          <Badge tone={docTone[doc.status]}>{t(`approvals.docStatus.${doc.status}` as TranslationKey)}</Badge>
        </div>
      ))}
    </div>
  )
}
