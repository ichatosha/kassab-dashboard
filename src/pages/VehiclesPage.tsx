import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bike } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SelectField, SearchInput } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, Pagination, VehicleBadge } from '../components/ui/misc'
import { ConnectionBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatNumber } from '../lib/format'
import type { Driver, VehicleType } from '../types/domain'

export function VehiclesPage() {
  const { t, locale } = useI18n()
  const { drivers, vehiclePricing } = useAppState()
  const navigate = useNavigate()
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')

  const fleet = useMemo(() => drivers.filter((d) => d.status === 'approved'), [drivers])

  const counts = useMemo(() => {
    const map: Record<VehicleType, number> = { motorcycle: 0, car: 0, tricycle: 0 }
    fleet.forEach((d) => { map[d.vehicle.type] += 1 })
    return map
  }, [fleet])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return fleet.filter((d) => {
      if (type !== 'all' && d.vehicle.type !== type) return false
      if (q && !d.vehicle.model.toLowerCase().includes(q) && !d.vehicle.plate.includes(query.trim()) && !d.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [fleet, type, query])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)

  const columns: Column<Driver>[] = [
    { key: 'type', header: t('companies.type'), render: (d) => <VehicleBadge type={d.vehicle.type} /> },
    { key: 'model', header: t('vehicles.model'), render: (d) => <span className="font-medium text-ink-900">{d.vehicle.model}</span> },
    { key: 'plate', header: t('vehicles.plate'), render: (d) => <span className="font-medium" dir="rtl">{d.vehicle.plate}</span> },
    { key: 'year', header: t('vehicles.year'), align: 'center', render: (d) => <span className="tnum">{d.vehicle.year}</span> },
    { key: 'owner', header: t('vehicles.owner'), render: (d) => (
      <span className="flex items-center gap-2">
        <Avatar name={d.name} size="sm" />
        {locale === 'ar' ? d.nameAr : d.name}
      </span>
    ) },
    { key: 'status', header: t('common.status'), render: (d) => <ConnectionBadge driver={d} /> },
    { key: 'zone', header: t('common.zone'), render: (d) => <span className="text-ink-600">{d.zone}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('vehicles.title')} subtitle={t('vehicles.subtitle')} />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(counts) as VehicleType[]).map((v) => {
          const pricing = vehiclePricing.find((p) => p.type === v)
          return (
            <StatCard
              key={v}
              label={t(`vehicle.${v}` as TranslationKey)}
              value={formatNumber(counts[v], locale)}
              hint={pricing ? `${t('vehicles.maxWeight')}: ${formatNumber(pricing.maxWeightKg, locale)} kg` : undefined}
            />
          )
        })}
      </div>
      <Card title={t('vehicles.byType')} padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t('common.search')}…`} aria-label={t('common.search')} className="w-full sm:w-64" />
          <SelectField label={t('companies.type')} value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {(['motorcycle', 'car', 'tricycle'] as VehicleType[]).map((v) => (
              <option key={v} value={v}>{t(`vehicle.${v}` as TranslationKey)}</option>
            ))}
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(d) => d.id}
          onRowClick={(d) => navigate(`/drivers/${d.id}`)}
          emptyState={<EmptyState title={t('drivers.empty')} icon={<Bike className="h-6 w-6" />} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
