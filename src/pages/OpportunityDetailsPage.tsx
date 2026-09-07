import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Bike, CalendarClock, Check, Clock, Gift, MapPin, Users,
} from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, ProgressBar, RatingStars, VerifiedMark } from '../components/ui/misc'
import { ApplicationBadge, RequestBadge } from '../components/shared/StatusBadges'
import { ApplyModal } from '../features/applications/ApplyModal'
import { formatDate, formatMoney, formatNumber, formatPercent } from '../lib/format'
import { cityName } from '../lib/geo'
import { OPEN_REQUEST_STATUSES } from '../lib/status'

export function OpportunityDetailsPage() {
  const { id } = useParams()
  const { t, locale, dir } = useI18n()
  const { requests, companies, applications, drivers } = useAppState()
  const { companyName, contactName } = useLookups()
  const navigate = useNavigate()
  const [applyOpen, setApplyOpen] = useState(false)

  const request = requests.find((r) => r.id === id)
  const candidates = useMemo(
    () => applications.filter((a) => a.requestId === id),
    [applications, id],
  )

  if (!request) {
    return (
      <EmptyState
        title={t('notFound.title')}
        action={<Link to="/opportunities" className="text-sm font-medium text-brand-600">{t('nav.opportunities')}</Link>}
      />
    )
  }

  const company = companies.find((c) => c.id === request.companyId)
  const remaining = Math.max(0, request.driversRequired - request.driversHired)
  const isOpen = OPEN_REQUEST_STATUSES.includes(request.status)
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <BackIcon className="h-4 w-4" aria-hidden />
        {t('nav.opportunities')}
      </button>

      <PageHeader
        title={locale === 'ar' ? request.positionAr : request.position}
        subtitle={`${request.number} · ${companyName(request.companyId)}`}
        actions={
          <>
            <RequestBadge status={request.status} />
            {isOpen && (
              <Button onClick={() => setApplyOpen(true)}>{t('opp.apply')}</Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Headline figures */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label={t('opp.salary')} value={formatMoney(request.salary, locale)} tone="brand" hint={t('common.perMonth')} />
            <StatCard label={t('opp.bonuses')} value={formatMoney(request.bonuses, locale)} />
            <StatCard label={t('wfr.required')} value={formatNumber(request.driversRequired, locale)} />
            <StatCard label={t('wfr.remaining')} value={formatNumber(remaining, locale)} tone={remaining > 0 ? 'success' : 'default'} />
          </div>

          <Card title={t('opp.progress')}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink-600">{t('opp.hiring')}</span>
              <span className="tnum font-semibold text-ink-900">
                {formatNumber(request.driversHired, locale)} / {formatNumber(request.driversRequired, locale)}
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={request.driversHired} max={request.driversRequired} tone="emerald" />
            </div>
            <p className="tnum mt-2 text-xs text-ink-500">
              {formatPercent((request.driversHired / request.driversRequired) * 100, locale)} · {formatNumber(candidates.length, locale)} {t('opp.candidates')}
            </p>
          </Card>

          <Card title={t('opp.workDetails')}>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: <MapPin className="h-4 w-4" aria-hidden />, label: t('common.area'), value: `${locale === 'ar' ? request.areaAr : request.area} · ${cityName(request.city, locale)}` },
                { icon: <Clock className="h-4 w-4" aria-hidden />, label: t('wfr.workingHours'), value: locale === 'ar' ? request.workingHoursAr : request.workingHours },
                { icon: <CalendarClock className="h-4 w-4" aria-hidden />, label: t('wfr.workingDays'), value: locale === 'ar' ? request.workingDaysAr : request.workingDays },
                { icon: <Users className="h-4 w-4" aria-hidden />, label: t('wfr.employmentType'), value: t(`emp.${request.employmentType}` as TranslationKey) },
                { icon: <Bike className="h-4 w-4" aria-hidden />, label: t('moto.category'), value: t('moto.required') },
                {
                  icon: <CalendarClock className="h-4 w-4" aria-hidden />,
                  label: t('opp.experience'),
                  value: request.experienceYears > 0
                    ? `${formatNumber(request.experienceYears, locale)} ${t('common.years')}`
                    : t('opp.noExperience'),
                },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-2.5 rounded-lg border border-ink-100 px-3 py-2.5">
                  <span className="mt-0.5 text-ink-400">{row.icon}</span>
                  <span className="min-w-0">
                    <dt className="text-xs text-ink-500">{row.label}</dt>
                    <dd className="text-sm font-medium text-ink-900">{row.value}</dd>
                  </span>
                </div>
              ))}
            </dl>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card title={t('opp.requirements')}>
              <ul className="space-y-2.5">
                {request.requirementKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600" aria-hidden>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {t(key as TranslationKey)}
                  </li>
                ))}
              </ul>
            </Card>
            <Card title={t('opp.benefits')}>
              <ul className="space-y-2.5">
                {request.benefitKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden>
                      <Gift className="h-3 w-3" />
                    </span>
                    {t(key as TranslationKey)}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card title={`${t('opp.candidates')} (${formatNumber(candidates.length, locale)})`} padded={false}>
            {candidates.length === 0 ? (
              <EmptyState title={t('apps.empty')} />
            ) : (
              <ul className="divide-y divide-ink-100">
                {candidates.map((a) => {
                  const d = drivers.find((x) => x.id === a.driverId)
                  return (
                    <li key={a.id}>
                      <button
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-start transition-colors hover:bg-brand-50/40"
                        onClick={() => navigate(`/applications?open=${a.id}`)}
                      >
                        <Avatar name={d?.name ?? '—'} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink-900">
                            {d ? (locale === 'ar' ? d.nameAr : d.name) : '—'}
                          </span>
                          <span className="tnum block text-xs text-ink-500">{a.number}</span>
                        </span>
                        {d && <RatingStars value={d.performance.rating} />}
                        <ApplicationBadge status={a.status} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Company sidebar */}
        <div className="space-y-4">
          <Card title={t('opp.aboutCompany')}>
            {company && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar name={company.name} size="lg" />
                  <div className="min-w-0">
                    <Link to={`/companies/${company.id}`} className="block truncate text-base font-bold text-ink-950 hover:text-brand-700">
                      {locale === 'ar' ? company.nameAr : company.name}
                    </Link>
                    <VerifiedMark verified={company.verified} />
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-500">{t('companies.type')}</dt>
                    <dd><Badge tone="info">{t(`biz.${company.type}` as TranslationKey)}</Badge></dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-500">{t('common.city')}</dt>
                    <dd className="font-medium text-ink-900">{cityName(company.city, locale)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-500">{t('companies.contact')}</dt>
                    <dd className="font-medium text-ink-900">{contactName(company.id)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-500">{t('common.phone')}</dt>
                    <dd className="tnum font-medium text-ink-900" dir="ltr">{company.phone}</dd>
                  </div>
                </dl>
              </>
            )}
          </Card>

          <Card title={t('opp.details')}>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('opp.published')}</dt>
                <dd className="tnum font-medium text-ink-900">{formatDate(request.createdAt, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('opp.deadline')}</dt>
                <dd className="tnum font-medium text-ink-900">{formatDate(request.deadline, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('wfr.number')}</dt>
                <dd className="tnum font-medium text-ink-900" dir="ltr">{request.number}</dd>
              </div>
            </dl>
            {isOpen && (
              <Button className="mt-4 w-full" onClick={() => setApplyOpen(true)}>
                {t('opp.apply')}
              </Button>
            )}
          </Card>
        </div>
      </div>

      {applyOpen && <ApplyModal request={request} onClose={() => setApplyOpen(false)} />}
    </div>
  )
}
