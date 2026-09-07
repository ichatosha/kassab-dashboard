import { UserCheck } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, MotorcycleBadge, PageHeader, RatingStars } from '../../components/ui/misc'
import { formatDate, formatMoney, formatNumber, formatPercent } from '../../lib/format'
import type { Driver } from '../../types/domain'

export function CompanyDriversPage() {
  const { t, locale } = useI18n()
  const { drivers, salaryTotal } = useCompanyScope()

  const avgRating = drivers.length
    ? drivers.reduce((s, d) => s + d.performance.rating, 0) / drivers.length
    : 0
  const avgSuccess = drivers.length
    ? drivers.reduce((s, d) => s + d.performance.deliverySuccessRate, 0) / drivers.length
    : 0

  const columns: Column<Driver>[] = [
    {
      key: 'driver',
      header: t('drivers.name'),
      render: (d) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={d.name} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink-900">
              {locale === 'ar' ? d.nameAr : d.name}
            </span>
            <span className="tnum block text-xs text-ink-500" dir="ltr">{d.phone}</span>
          </span>
        </span>
      ),
    },
    { key: 'age', header: t('drivers.age'), align: 'center', render: (d) => <span className="tnum">{formatNumber(d.age, locale)}</span> },
    { key: 'motorcycle', header: t('moto.category'), render: (d) => <MotorcycleBadge motorcycle={d.motorcycle} /> },
    { key: 'rating', header: t('common.rating'), render: (d) => <RatingStars value={d.performance.rating} count={d.performance.ratingCount} /> },
    { key: 'success', header: t('drivers.successRate'), align: 'end', render: (d) => <span className="tnum text-emerald-700">{formatPercent(d.performance.deliverySuccessRate, locale)}</span> },
    { key: 'completed', header: t('drivers.completedDeliveries'), align: 'end', render: (d) => <span className="tnum">{formatNumber(d.performance.completedDeliveries, locale)}</span> },
    { key: 'salary', header: t('drivers.salary'), align: 'end', render: (d) => <span className="tnum font-medium">{formatMoney(d.employment?.salary ?? 0, locale)}</span> },
    { key: 'start', header: t('drivers.startDate'), render: (d) => <span className="tnum text-xs text-ink-500">{d.employment ? formatDate(d.employment.startDate, locale) : '—'}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('company.myDriversTitle')} subtitle={t('company.myDriversSub')} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('company.driversHired')} value={formatNumber(drivers.length, locale)} tone="success" />
        <StatCard label={t('company.salaries')} value={formatMoney(salaryTotal, locale)} />
        <StatCard label={t('ratings.average')} value={avgRating > 0 ? avgRating.toFixed(1) : '—'} />
        <StatCard label={t('drivers.successRate')} value={avgSuccess > 0 ? formatPercent(avgSuccess, locale) : '—'} tone="brand" />
      </div>

      <Card padded={false}>
        <DataTable
          columns={columns}
          rows={drivers}
          rowKey={(d) => d.id}
          stickyHeader
          emptyState={
            <EmptyState
              title={t('company.noDrivers')}
              hint={t('company.noDriversHint')}
              icon={<UserCheck className="h-6 w-6" />}
            />
          }
        />
      </Card>
    </div>
  )
}
