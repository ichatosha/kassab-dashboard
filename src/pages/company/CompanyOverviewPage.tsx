import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Briefcase, Plus, Users } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader, ProgressBar, RatingStars } from '../../components/ui/misc'
import { ApplicationBadge, RequestBadge } from '../../components/shared/StatusBadges'
import { useLookups } from '../../hooks/useLookups'
import { formatMoney, formatNumber, formatPercent, formatRelative } from '../../lib/format'
import { cityName } from '../../lib/geo'

export function CompanyOverviewPage() {
  const { t, locale, dir } = useI18n()
  const { driverName } = useLookups()
  const {
    company, requests, applications, drivers, openPositions,
    salaryTotal, kassabFee, monthlyTotal, feeRate,
  } = useCompanyScope()
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight

  if (!company) return <EmptyState title={t('notFound.title')} />

  const required = requests.reduce((s, r) => s + r.driversRequired, 0)
  const newApplicants = applications.filter((a) => ['new', 'under_review'].includes(a.status)).length
  const inProgress = applications.filter((a) => ['contacted', 'interview', 'accepted'].includes(a.status)).length
  const recent = applications.slice(0, 5)
  const activeRequests = requests.filter((r) => !['closed', 'cancelled', 'draft'].includes(r.status))

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${t('company.welcome')}, ${locale === 'ar' ? company.nameAr : company.name}`}
        subtitle={t('company.overviewSub')}
        actions={
          <Link
            to="/company/requests/new"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('company.postRequest')}
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('company.driversHired')} value={formatNumber(drivers.length, locale)} tone="success" hint={`${formatNumber(required, locale)} ${t('company.requested')}`} />
        <StatCard label={t('company.openPositions')} value={formatNumber(openPositions, locale)} tone="brand" />
        <StatCard label={t('company.newApplicants')} value={formatNumber(newApplicants, locale)} hint={`${formatNumber(inProgress, locale)} ${t('company.inProgress')}`} />
        <StatCard label={t('company.monthlyCost')} value={formatMoney(monthlyTotal, locale)} hint={t('company.inclFee')} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card
            title={t('company.activeRequests')}
            padded={false}
            actions={
              <Link to="/company/requests" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                {t('common.viewAll')}
                <Arrow className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            {activeRequests.length === 0 ? (
              <EmptyState
                title={t('company.noRequests')}
                hint={t('company.noRequestsHint')}
                icon={<Briefcase className="h-6 w-6" />}
                action={
                  <Link to="/company/requests/new">
                    <Button size="sm">{t('company.postRequest')}</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {activeRequests.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    <Link to={`/company/requests`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-50/40">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="tnum text-sm font-semibold text-ink-900">{r.number}</span>
                          <RequestBadge status={r.status} />
                        </span>
                        <span className="mt-1 block text-xs text-ink-500">
                          {cityName(r.city, locale)} · {formatMoney(r.salary, locale)} {t('common.perMonth')}
                        </span>
                        <span className="mt-1.5 block max-w-xs">
                          <ProgressBar value={r.driversHired} max={r.driversRequired} tone="emerald" />
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-sm font-semibold text-ink-800">
                        {formatNumber(r.driversHired, locale)} / {formatNumber(r.driversRequired, locale)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title={t('company.recentApplicants')}
            padded={false}
            actions={
              <Link to="/company/applicants" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                {t('common.viewAll')}
                <Arrow className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            {recent.length === 0 ? (
              <EmptyState title={t('company.noApplicants')} hint={t('company.noApplicantsHint')} icon={<Users className="h-6 w-6" />} />
            ) : (
              <ul className="divide-y divide-ink-100">
                {recent.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Avatar name={driverName(a.driverId)} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">{driverName(a.driverId)}</span>
                      <span className="block text-xs text-ink-500">{formatRelative(a.appliedAt, locale)}</span>
                    </span>
                    <ApplicationBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title={t('company.thisMonth')}>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('company.salaries')}</dt>
                <dd className="tnum font-medium text-ink-900">{formatMoney(salaryTotal, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">
                  {t('company.kassabFee')} ({formatPercent(feeRate * 100, locale)})
                </dt>
                <dd className="tnum font-medium text-brand-700">{formatMoney(kassabFee, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-ink-100 pt-2.5">
                <dt className="font-medium text-ink-800">{t('company.total')}</dt>
                <dd className="tnum text-base font-bold text-ink-950">{formatMoney(monthlyTotal, locale)}</dd>
              </div>
            </dl>
            <Link to="/company/billing" className="mt-4 block">
              <Button variant="secondary" className="w-full">{t('nav.billing')}</Button>
            </Link>
          </Card>

          <Card title={t('company.topDrivers')} padded={false}>
            {drivers.length === 0 ? (
              <EmptyState title={t('company.noDrivers')} />
            ) : (
              <ul className="divide-y divide-ink-100">
                {[...drivers]
                  .sort((a, b) => b.performance.rating - a.performance.rating)
                  .slice(0, 4)
                  .map((d) => (
                    <li key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                      <Avatar name={d.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">
                          {locale === 'ar' ? d.nameAr : d.name}
                        </span>
                        <span className="tnum block text-xs text-ink-500">
                          {formatPercent(d.performance.deliverySuccessRate, locale)} {t('drivers.successRate')}
                        </span>
                      </span>
                      <RatingStars value={d.performance.rating} />
                    </li>
                  ))}
              </ul>
            )}
          </Card>

          <Card title={t('company.howItWorks')}>
            <ol className="space-y-3 text-sm text-ink-700">
              {(['company.step1', 'company.step2', 'company.step3'] as TranslationKey[]).map((key, i) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span aria-hidden className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                    {formatNumber(i + 1, locale)}
                  </span>
                  {t(key)}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
