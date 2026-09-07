import { Link } from 'react-router-dom'
import { Bike, Check, Clock, MapPin, Users } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useLookups } from '../../hooks/useLookups'
import { InterestIconButtons } from '../../components/shared/EngagementStats'
import { Avatar, VerifiedMark } from '../../components/ui/misc'
import { formatMoney, formatNumber, formatRelative } from '../../lib/format'
import { cityName } from '../../lib/geo'
import type { WorkforceRequest } from '../../types/domain'

// One opening as a driver sees it: pay first, then where and what it asks
// of them. The heart and bookmark sit on the card so a driver can keep a
// job without opening it.
export function JobCard({ request, applied }: { request: WorkforceRequest; applied: boolean }) {
  const { t, locale } = useI18n()
  const { companyById, companyName } = useLookups()
  const company = companyById.get(request.companyId)
  const remaining = Math.max(0, request.driversRequired - request.driversHired)

  return (
    <article className="flex flex-col rounded-xl border border-ink-200/80 bg-surface p-4 shadow-card transition-colors hover:border-brand-300">
      <div className="flex items-start gap-3">
        <Avatar name={company?.name ?? '—'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink-950">{companyName(request.companyId)}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2">
            {company && <VerifiedMark verified={company.verified} />}
            <span className="text-xs text-ink-500">{t(`biz.${company?.type ?? 'company'}` as TranslationKey)}</span>
          </div>
        </div>
        <InterestIconButtons requestId={request.id} />
      </div>

      {applied && (
        <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-500/25">
          <Check className="h-3 w-3" aria-hidden />
          {t('driver.applied')}
        </span>
      )}

      <p className="tnum mt-3 text-xl font-bold text-brand-700">
        {formatMoney(request.salary, locale)}
        <span className="ms-1 text-xs font-medium text-ink-500">{t('common.perMonth')}</span>
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-ink-600">
          <MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden />
          {cityName(request.city, locale)}
        </div>
        <div className="flex items-center gap-1.5 text-ink-600">
          <Clock className="h-3.5 w-3.5 text-ink-400" aria-hidden />
          {t(`emp.${request.employmentType}` as TranslationKey)}
        </div>
        <div className="flex items-center gap-1.5 text-ink-600">
          <Users className="h-3.5 w-3.5 text-ink-400" aria-hidden />
          <span className="tnum">{formatNumber(remaining, locale)} {t('opp.remaining')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink-600">
          <Bike className="h-3.5 w-3.5 text-ink-400" aria-hidden />
          {t('moto.category')}
        </div>
      </dl>

      <p className="mt-3 text-[11px] text-ink-400">{formatRelative(request.createdAt, locale)}</p>

      <Link
        to={`/delivery/jobs/${request.id}`}
        className="mt-4 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
      >
        {applied ? t('driver.viewJob') : t('opp.apply')}
      </Link>
    </article>
  )
}
