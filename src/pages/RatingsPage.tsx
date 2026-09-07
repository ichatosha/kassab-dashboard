import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, ProgressBar, RatingStars } from '../components/ui/misc'
import { formatDate, formatNumber, formatPercent } from '../lib/format'

export function RatingsPage() {
  const { t, locale } = useI18n()
  const { ratings, drivers } = useAppState()
  const { driverById, driverName, companyName } = useLookups()
  const navigate = useNavigate()

  const criteria = useMemo(() => {
    if (ratings.length === 0) return { punctuality: 0, behavior: 0, speed: 0, overall: 0 }
    const sum = ratings.reduce(
      (acc, r) => ({
        punctuality: acc.punctuality + r.punctuality,
        behavior: acc.behavior + r.behavior,
        speed: acc.speed + r.deliverySpeed,
      }),
      { punctuality: 0, behavior: 0, speed: 0 },
    )
    const n = ratings.length
    return {
      punctuality: sum.punctuality / n,
      behavior: sum.behavior / n,
      speed: sum.speed / n,
      overall: (sum.punctuality + sum.behavior + sum.speed) / (n * 3),
    }
  }, [ratings])

  // Distribution across the 1-5 scale, from the drivers who have ratings
  const distribution = useMemo(() => {
    const rated = drivers.filter((d) => d.performance.rating > 0)
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: rated.filter((d) => Math.round(d.performance.rating) === star).length,
      total: rated.length,
    }))
  }, [drivers])

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('ratings.title')} subtitle={t('ratings.subtitle')} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('ratings.average')} value={criteria.overall.toFixed(1)} tone="brand" />
        <StatCard label={t('ratings.punctuality')} value={criteria.punctuality.toFixed(1)} />
        <StatCard label={t('ratings.behavior')} value={criteria.behavior.toFixed(1)} />
        <StatCard label={t('ratings.speed')} value={criteria.speed.toFixed(1)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={t('ratings.distribution')}>
          <ul className="space-y-3">
            {distribution.map((row) => (
              <li key={row.star}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-1 text-ink-700">
                    <span className="tnum">{row.star}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                  </span>
                  <span className="tnum text-xs text-ink-500">
                    {formatNumber(row.count, locale)}
                    {row.total > 0 && ` · ${formatPercent((row.count / row.total) * 100, locale)}`}
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar value={row.count} max={Math.max(1, row.total)} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('ratings.recent')} className="lg:col-span-2" padded={false}>
          {ratings.length === 0 ? (
            <EmptyState title={t('ratings.empty')} icon={<Star className="h-6 w-6" />} />
          ) : (
            <ul className="divide-y divide-ink-100">
              {ratings.map((r) => {
                const driver = driverById.get(r.driverId)
                return (
                  <li key={r.id}>
                    <button
                      className="w-full cursor-pointer px-4 py-3 text-start transition-colors hover:bg-brand-50/40"
                      onClick={() => navigate(`/drivers/profile/${r.driverId}`)}
                    >
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Avatar name={driver?.name ?? '—'} size="sm" />
                        <span className="text-sm font-medium text-ink-900">{driverName(r.driverId)}</span>
                        {driver && <RatingStars value={driver.performance.rating} />}
                        <span className="ms-auto text-xs text-ink-400">{formatDate(r.at, locale)}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-500">
                        {t('ratings.ratedBy')}: {companyName(r.companyId)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
                        <span>{t('ratings.punctuality')}: <b className="tnum">{r.punctuality}/5</b></span>
                        <span>{t('ratings.behavior')}: <b className="tnum">{r.behavior}/5</b></span>
                        <span>{t('ratings.speed')}: <b className="tnum">{r.deliverySpeed}/5</b></span>
                      </div>
                      {(r.comment || r.commentAr) && (
                        <p className="mt-1.5 text-sm text-ink-700">{locale === 'ar' ? r.commentAr : r.comment}</p>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
