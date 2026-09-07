import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gauge } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, MotorcycleBadge, PageHeader, ProgressBar, RatingStars } from '../components/ui/misc'
import { formatNumber, formatPercent } from '../lib/format'
import type { Driver } from '../types/domain'

export function PerformancePage() {
  const { t, locale } = useI18n()
  const { drivers } = useAppState()
  const { companyName } = useLookups()
  const navigate = useNavigate()

  const active = useMemo(
    () => drivers.filter((d) => d.performance.completedDeliveries > 0),
    [drivers],
  )

  const stats = useMemo(() => {
    if (active.length === 0) return { avgRating: 0, avgSuccess: 0, deliveries: 0, failed: 0 }
    return {
      avgRating: active.reduce((s, d) => s + d.performance.rating, 0) / active.length,
      avgSuccess: active.reduce((s, d) => s + d.performance.deliverySuccessRate, 0) / active.length,
      deliveries: active.reduce((s, d) => s + d.performance.completedDeliveries, 0),
      failed: active.reduce((s, d) => s + d.performance.failedDeliveries, 0),
    }
  }, [active])

  const ranked = useMemo(
    () => [...active].sort((a, b) => b.performance.deliverySuccessRate - a.performance.deliverySuccessRate),
    [active],
  )
  const topPerformers = ranked.slice(0, 5)
  const needsSupport = ranked.slice(-3).reverse()

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      header: t('drivers.name'),
      render: (d) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={d.name} size="sm" />
          <span>
            <span className="block font-medium text-ink-900">{locale === 'ar' ? d.nameAr : d.name}</span>
            <span className="block text-xs text-ink-400">
              {d.employment ? companyName(d.employment.companyId) : t('drivers.noEmployment')}
            </span>
          </span>
        </span>
      ),
    },
    { key: 'moto', header: t('moto.category'), render: (d) => <MotorcycleBadge motorcycle={d.motorcycle} showModel={false} /> },
    { key: 'rating', header: t('common.rating'), render: (d) => <RatingStars value={d.performance.rating} count={d.performance.ratingCount} /> },
    {
      key: 'success',
      header: t('drivers.successRate'),
      render: (d) => (
        <span className="block w-28">
          <span className="tnum text-xs font-medium text-emerald-700">{formatPercent(d.performance.deliverySuccessRate, locale)}</span>
          <span className="mt-1 block"><ProgressBar value={d.performance.deliverySuccessRate} max={100} tone="emerald" /></span>
        </span>
      ),
    },
    { key: 'completed', header: t('drivers.completedDeliveries'), align: 'end', render: (d) => <span className="tnum">{formatNumber(d.performance.completedDeliveries, locale)}</span> },
    { key: 'failed', header: t('drivers.failedDeliveries'), align: 'end', render: (d) => <span className="tnum text-red-700">{formatNumber(d.performance.failedDeliveries, locale)}</span> },
    { key: 'experience', header: t('drivers.experience'), align: 'center', render: (d) => <span className="tnum">{formatNumber(d.performance.experienceYears, locale)} {t('common.years')}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('perf.title')} subtitle={t('perf.subtitle')} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('reports.avgRating')} value={stats.avgRating.toFixed(1)} />
        <StatCard label={t('reports.avgSuccess')} value={formatPercent(stats.avgSuccess, locale)} tone="success" />
        <StatCard label={t('perf.deliveries')} value={formatNumber(stats.deliveries, locale)} />
        <StatCard label={t('drivers.failedDeliveries')} value={formatNumber(stats.failed, locale)} tone="danger" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card title={t('perf.topPerformers')}>
          <ul className="space-y-3">
            {topPerformers.map((d) => (
              <li key={d.id}>
                <button
                  className="flex w-full cursor-pointer items-center justify-between gap-2 text-start"
                  onClick={() => navigate(`/admin/drivers/profile/${d.id}`)}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-ink-800">
                    <Avatar name={d.name} size="sm" />
                    {locale === 'ar' ? d.nameAr : d.name}
                  </span>
                  <span className="tnum text-xs font-semibold text-emerald-700">
                    {formatPercent(d.performance.deliverySuccessRate, locale)}
                  </span>
                </button>
                <div className="mt-1.5"><ProgressBar value={d.performance.deliverySuccessRate} max={100} tone="emerald" /></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('perf.needsSupport')}>
          <ul className="space-y-3">
            {needsSupport.map((d) => (
              <li key={d.id}>
                <button
                  className="flex w-full cursor-pointer items-center justify-between gap-2 text-start"
                  onClick={() => navigate(`/admin/drivers/profile/${d.id}`)}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-ink-800">
                    <Avatar name={d.name} size="sm" />
                    {locale === 'ar' ? d.nameAr : d.name}
                  </span>
                  <span className="tnum text-xs font-semibold text-amber-700">
                    {formatPercent(d.performance.deliverySuccessRate, locale)}
                  </span>
                </button>
                <div className="mt-1.5"><ProgressBar value={d.performance.deliverySuccessRate} max={100} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card padded={false}>
        <DataTable
          columns={columns}
          rows={ranked}
          rowKey={(d) => d.id}
          onRowClick={(d) => navigate(`/admin/drivers/profile/${d.id}`)}
          stickyHeader
          emptyState={<EmptyState title={t('drivers.empty')} icon={<Gauge className="h-6 w-6" />} />}
        />
      </Card>
    </div>
  )
}
