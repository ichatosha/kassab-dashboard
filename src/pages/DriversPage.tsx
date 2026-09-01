import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilterX, UserSearch } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SearchInput, SelectField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, Pagination, RatingStars, VehicleBadge } from '../components/ui/misc'
import { ConnectionBadge, DriverApprovalBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatDate, formatMoney, formatNumber } from '../lib/format'
import { zoneName } from '../lib/geo'
import type { Driver, DriverAccountStatus, VehicleType } from '../types/domain'

export function DriversPage() {
  const { t, locale } = useI18n()
  const { drivers } = useAppState()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [connection, setConnection] = useState('all')
  const [vehicle, setVehicle] = useState('all')
  const [zone, setZone] = useState('all')

  const zones = useMemo(() => Array.from(new Set(drivers.map((d) => d.zone))).sort(), [drivers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return drivers.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !d.nameAr.includes(query.trim()) && !d.phone.replace(/\s/g, '').includes(q) && !d.code.toLowerCase().includes(q)) return false
      if (status !== 'all' && d.status !== status) return false
      if (connection !== 'all' && d.connection !== connection) return false
      if (vehicle !== 'all' && d.vehicle.type !== vehicle) return false
      if (zone !== 'all' && d.zone !== zone) return false
      return true
    })
  }, [drivers, query, status, connection, vehicle, zone])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)
  const hasFilters = query !== '' || status !== 'all' || connection !== 'all' || vehicle !== 'all' || zone !== 'all'
  const clearFilters = () => {
    setQuery(''); setStatus('all'); setConnection('all'); setVehicle('all'); setZone('all')
  }

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      header: t('drivers.name'),
      render: (d) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={d.name} size="sm" />
          <span>
            <span className="block font-medium text-ink-900">{locale === 'ar' ? d.nameAr : d.name}</span>
            <span className="tnum block text-xs text-ink-400" dir="ltr">{d.code}</span>
          </span>
        </span>
      ),
    },
    { key: 'connection', header: t('drivers.connection'), render: (d) => <ConnectionBadge driver={d} /> },
    { key: 'approval', header: t('drivers.approval'), render: (d) => <DriverApprovalBadge status={d.status} /> },
    { key: 'rating', header: t('common.rating'), render: (d) => <RatingStars value={d.rating} /> },
    { key: 'vehicle', header: t('orders.vehicle'), render: (d) => <VehicleBadge type={d.vehicle.type} /> },
    { key: 'zone', header: t('common.zone'), render: (d) => <span className="text-ink-600">{zoneName(d.zone, locale)}</span> },
    { key: 'active', header: t('drivers.activeOrders'), align: 'center', render: (d) => <span className="tnum">{formatNumber(d.activeOrders, locale)}</span> },
    { key: 'completed', header: t('drivers.completed'), align: 'end', render: (d) => <span className="tnum">{formatNumber(d.completedOrders, locale)}</span> },
    { key: 'earnings', header: t('drivers.earnings'), align: 'end', render: (d) => <span className="tnum font-medium">{formatMoney(d.earningsMonth, locale)}</span> },
    { key: 'registered', header: t('drivers.registered'), render: (d) => <span className="tnum text-xs text-ink-500">{formatDate(d.registeredAt, locale)}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('drivers.title')} subtitle={t('drivers.subtitle')} />
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t('common.search')}…`} aria-label={t('common.search')} className="w-full sm:w-64" />
          <SelectField label={t('drivers.approval')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {(['pending_review', 'approved', 'rejected', 'suspended'] as DriverAccountStatus[]).map((s) => (
              <option key={s} value={s}>{t(`driverStatus.${s}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('drivers.connection')} value={connection} onChange={(e) => setConnection(e.target.value)} className="w-full sm:w-36">
            <option value="all">{t('common.all')}</option>
            <option value="online">{t('driverStatus.online')}</option>
            <option value="offline">{t('driverStatus.offline')}</option>
          </SelectField>
          <SelectField label={t('orders.vehicle')} value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full sm:w-36">
            <option value="all">{t('common.all')}</option>
            {(['motorcycle', 'car', 'tricycle'] as VehicleType[]).map((v) => (
              <option key={v} value={v}>{t(`vehicle.${v}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('common.zone')} value={zone} onChange={(e) => setZone(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {zones.map((z) => (
              <option key={z} value={z}>{zoneName(z, locale)}</option>
            ))}
          </SelectField>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} icon={<FilterX className="h-4 w-4" aria-hidden />}>
              {t('common.clearFilters')}
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(d) => d.id}
          onRowClick={(d) => navigate(`/drivers/${d.id}`)}
          stickyHeader
          emptyState={<EmptyState title={t('drivers.empty')} icon={<UserSearch className="h-6 w-6" />} action={hasFilters ? <Button variant="secondary" size="sm" onClick={clearFilters}>{t('common.clearFilters')}</Button> : undefined} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
