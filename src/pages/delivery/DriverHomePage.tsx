import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Briefcase, Building2, Wallet } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useDriverScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, MotorcycleBadge, PageHeader, RatingStars } from '../../components/ui/misc'
import { ApplicationBadge, DriverBadge } from '../../components/shared/StatusBadges'
import { formatDate, formatMoney, formatNumber, formatPercent, formatRelative } from '../../lib/format'
import { cityName } from '../../lib/geo'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'

export function DriverHomePage() {
  const { t, locale, dir } = useI18n()
  const { driver, employer, applications, requests, appliedRequestIds } = useDriverScope()
  const { companyName } = useLookups()
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight

  if (!driver) return <EmptyState title={t('notFound.title')} />

  const openJobs = requests.filter(
    (r) => OPEN_REQUEST_STATUSES.includes(r.status) && !appliedRequestIds.has(r.id),
  )
  const matching = openJobs.filter((r) => r.city === driver.city)
  const suggestions = (matching.length > 0 ? matching : openJobs).slice(0, 4)
  const active = applications.filter((a) => !['rejected', 'withdrawn'].includes(a.status))

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${t('driver.welcome')}، ${locale === 'ar' ? driver.nameAr : driver.name}`}
        subtitle={driver.status === 'hired' ? t('driver.subHired') : t('driver.subLooking')}
        actions={
          <>
            <DriverBadge status={driver.status} />
            <Link to="/delivery/jobs">
              <Button>{t('driver.findJobs')}</Button>
            </Link>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={t('driver.monthlySalary')}
          value={driver.employment ? formatMoney(driver.employment.salary, locale) : '—'}
          tone={driver.employment ? 'success' : 'default'}
          hint={driver.employment ? companyName(driver.employment.companyId) : t('driver.notHired')}
        />
        <StatCard label={t('driver.walletBalance')} value={formatMoney(driver.wallet.balance, locale)} tone="brand" />
        <StatCard label={t('driver.activeApplications')} value={formatNumber(active.length, locale)} />
        <StatCard
          label={t('common.rating')}
          value={driver.performance.rating > 0 ? driver.performance.rating.toFixed(1) : '—'}
          hint={driver.performance.completedDeliveries > 0
            ? `${formatPercent(driver.performance.deliverySuccessRate, locale)} ${t('drivers.successRate')}`
            : t('driver.noHistory')}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card
            title={matching.length > 0 ? t('driver.jobsNearYou') : t('driver.openJobs')}
            padded={false}
            actions={
              <Link to="/delivery/jobs" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                {t('common.viewAll')}
                <Arrow className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            {suggestions.length === 0 ? (
              <EmptyState title={t('driver.noJobs')} hint={t('driver.noJobsHint')} icon={<Briefcase className="h-6 w-6" />} />
            ) : (
              <ul className="divide-y divide-ink-100">
                {suggestions.map((r) => (
                  <li key={r.id}>
                    <Link to={`/delivery/jobs/${r.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-50/40">
                      <Avatar name={companyName(r.companyId)} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{companyName(r.companyId)}</span>
                        <span className="block text-xs text-ink-500">
                          {cityName(r.city, locale)} · {formatNumber(Math.max(0, r.driversRequired - r.driversHired), locale)} {t('opp.remaining')}
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-sm font-bold text-brand-700">
                        {formatMoney(r.salary, locale)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title={t('driver.myApplications')}
            padded={false}
            actions={
              <Link to="/delivery/applications" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                {t('common.viewAll')}
                <Arrow className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            {applications.length === 0 ? (
              <EmptyState
                title={t('driver.noApplications')}
                hint={t('driver.noApplicationsHint')}
                icon={<Briefcase className="h-6 w-6" />}
                action={<Link to="/delivery/jobs"><Button size="sm">{t('driver.findJobs')}</Button></Link>}
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {applications.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">{companyName(a.companyId)}</span>
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
          {employer && driver.employment && (
            <Card title={t('driver.currentJob')}>
              <div className="flex items-center gap-3">
                <Avatar name={employer.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-950">
                    {locale === 'ar' ? employer.nameAr : employer.name}
                  </p>
                  <p className="text-xs text-ink-500">{cityName(employer.city, locale)}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">{t('driver.monthlySalary')}</dt>
                  <dd className="tnum font-semibold text-ink-900">{formatMoney(driver.employment.salary, locale)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">{t('drivers.startDate')}</dt>
                  <dd className="tnum font-medium text-ink-900">{formatDate(driver.employment.startDate, locale)}</dd>
                </div>
              </dl>
            </Card>
          )}

          <Card title={t('driver.myProfile')}>
            <div className="flex items-center gap-3">
              <Avatar name={driver.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-950">
                  {locale === 'ar' ? driver.nameAr : driver.name}
                </p>
                <RatingStars value={driver.performance.rating} count={driver.performance.ratingCount} />
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('drivers.age')}</dt>
                <dd className="tnum font-medium text-ink-900">{formatNumber(driver.age, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('common.city')}</dt>
                <dd className="font-medium text-ink-900">{cityName(driver.city, locale)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-500">{t('moto.category')}</dt>
                <dd><MotorcycleBadge motorcycle={driver.motorcycle} /></dd>
              </div>
            </dl>
            <Link to="/delivery/profile" className="mt-4 block">
              <Button variant="secondary" className="w-full">{t('driver.viewProfile')}</Button>
            </Link>
          </Card>

          <Card title={t('driver.wallet')}>
            <p className="tnum text-2xl font-bold text-ink-950">{formatMoney(driver.wallet.balance, locale)}</p>
            <p className="mt-1 text-xs text-ink-500">{t('driver.pendingThisCycle')}</p>
            <Link to="/delivery/wallet" className="mt-4 block">
              <Button variant="secondary" className="w-full" icon={<Wallet className="h-4 w-4" aria-hidden />}>
                {t('nav.myWallet')}
              </Button>
            </Link>
          </Card>

          {!driver.employment && (
            <Card>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-600">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                {t('driver.howItWorks')}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
