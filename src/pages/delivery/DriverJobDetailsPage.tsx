import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Bike, CalendarClock, Check, Clock, Gift, MapPin, Users,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useDriverScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader, ProgressBar, VerifiedMark } from '../../components/ui/misc'
import { ApplicationBadge } from '../../components/shared/StatusBadges'
import { InterestActions } from '../../components/shared/EngagementStats'
import { ApplyModal } from '../../features/applications/ApplyModal'
import { formatDate, formatMoney, formatNumber } from '../../lib/format'
import { cityName } from '../../lib/geo'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'

// What a driver needs to decide: pay, place, hours, what's required of them,
// and whether they already applied. No company internals, no candidate list.
export function DriverJobDetailsPage() {
  const { id } = useParams()
  const { t, locale, dir } = useI18n()
  const { companies } = useAppState()
  const { driver, requests, applications } = useDriverScope()
  const { companyName } = useLookups()
  const navigate = useNavigate()
  const [applyOpen, setApplyOpen] = useState(false)

  const request = requests.find((r) => r.id === id)
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  if (!request) {
    return (
      <EmptyState
        title={t('notFound.title')}
        action={<Link to="/delivery/jobs" className="text-sm font-medium text-brand-600">{t('nav.findJobs')}</Link>}
      />
    )
  }

  const company = companies.find((c) => c.id === request.companyId)
  const remaining = Math.max(0, request.driversRequired - request.driversHired)
  const isOpen = OPEN_REQUEST_STATUSES.includes(request.status)
  const myApplication = applications.find((a) => a.requestId === request.id)
  const canApply = isOpen && !myApplication && driver?.status !== 'hired'

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/delivery/jobs')}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <BackIcon className="h-4 w-4" aria-hidden />
        {t('nav.findJobs')}
      </button>

      <PageHeader
        title={locale === 'ar' ? request.positionAr : request.position}
        subtitle={companyName(request.companyId)}
        actions={
          <>
            <InterestActions requestId={request.id} />
            {canApply && <Button onClick={() => setApplyOpen(true)}>{t('opp.apply')}</Button>}
          </>
        }
      />

      {myApplication && (
        <Card className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">{t('driver.alreadyApplied')}</p>
              <p className="mt-0.5 text-xs text-ink-500">
                {t('apps.applied')}: {formatDate(myApplication.appliedAt, locale)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ApplicationBadge status={myApplication.status} />
              <Link to="/delivery/applications">
                <Button variant="secondary" size="sm">{t('nav.myApplications')}</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label={t('opp.salary')} value={formatMoney(request.salary, locale)} tone="brand" hint={t('common.perMonth')} />
            <StatCard label={t('opp.bonuses')} value={formatMoney(request.bonuses, locale)} />
            <StatCard label={t('driver.positionsLeft')} value={formatNumber(remaining, locale)} tone={remaining > 0 ? 'success' : 'default'} />
            <StatCard label={t('opp.deadline')} value={formatDate(request.deadline, locale)} />
          </div>

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
            <Card title={t('driver.whatYouNeed')}>
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
            <Card title={t('driver.whatYouGet')}>
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
        </div>

        <div className="space-y-4">
          <Card title={t('opp.aboutCompany')}>
            {company && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar name={company.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-ink-950">
                      {locale === 'ar' ? company.nameAr : company.name}
                    </p>
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
                </dl>
              </>
            )}
          </Card>

          <Card title={t('opp.progress')}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink-600">{t('driver.alreadyHired')}</span>
              <span className="tnum font-semibold text-ink-900">
                {formatNumber(request.driversHired, locale)} / {formatNumber(request.driversRequired, locale)}
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={request.driversHired} max={request.driversRequired} tone="emerald" />
            </div>
            {canApply ? (
              <Button className="mt-4 w-full" onClick={() => setApplyOpen(true)}>{t('opp.apply')}</Button>
            ) : (
              <p className="mt-4 text-xs leading-relaxed text-ink-500">
                {myApplication
                  ? t('driver.alreadyAppliedHint')
                  : driver?.status === 'hired'
                    ? t('driver.currentlyEmployed')
                    : t('driver.jobClosed')}
              </p>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-ink-400">{t('driver.appliesToKassab')}</p>
          </Card>
        </div>
      </div>

      {applyOpen && driver && (
        <ApplyModal
          request={request}
          onClose={() => setApplyOpen(false)}
          fixedDriverId={driver.id}
          applicationsPath="/delivery/applications"
        />
      )}
    </div>
  )
}
