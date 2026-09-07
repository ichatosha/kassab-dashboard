import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FilterX, UserSearch } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SearchInput, SelectField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, MotorcycleBadge, PageHeader, Pagination, RatingStars } from '../components/ui/misc'
import { DriverBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatDate, formatMoney, formatNumber, formatPercent } from '../lib/format'
import { cityName, EGYPT_CITIES, brandLabel } from '../lib/geo'
import { driverKey } from '../lib/status'
import type { Driver, DriverStatus, MotorcycleBrand } from '../types/domain'

const BRANDS: MotorcycleBrand[] = ['honda', 'yamaha', 'bajaj', 'sym', 'tvs', 'other']

type Scope = 'all' | 'available' | 'hired'

export function DriversPage({ scope = 'all' }: { scope?: Scope }) {
  const { t, locale } = useI18n()
  const { drivers } = useAppState()
  const { companyName } = useLookups()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [city, setCity] = useState('all')
  const [brand, setBrand] = useState('all')

  const scoped = useMemo(() => {
    if (scope === 'available') return drivers.filter((d) => d.status === 'available')
    if (scope === 'hired') return drivers.filter((d) => d.status === 'hired')
    return drivers
  }, [drivers, scope])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !d.nameAr.includes(query.trim()) && !d.phone.replace(/\s/g, '').includes(q) && !d.code.toLowerCase().includes(q)) return false
      if (scope === 'all' && status !== 'all' && d.status !== status) return false
      if (city !== 'all' && d.city !== city) return false
      if (brand !== 'all' && d.motorcycle.brand !== brand) return false
      return true
    })
  }, [scoped, query, status, city, brand, scope])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)
  const hasFilters = query !== '' || status !== 'all' || city !== 'all' || brand !== 'all'
  const clear = () => { setQuery(''); setStatus('all'); setCity('all'); setBrand('all') }

  const titles = {
    all: { title: t('drivers.title'), subtitle: t('drivers.subtitle'), empty: t('drivers.empty') },
    available: { title: t('drivers.availableTitle'), subtitle: t('drivers.availableSubtitle'), empty: t('drivers.emptyAvailable') },
    hired: { title: t('drivers.hiredTitle'), subtitle: t('drivers.hiredSubtitle'), empty: t('drivers.emptyHired') },
  }[scope]

  const baseColumns: Column<Driver>[] = [
    {
      key: 'name',
      header: t('drivers.name'),
      render: (d) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={d.name} size="sm" />
          <span>
            <span className="block font-medium text-ink-900">{locale === 'ar' ? d.nameAr : d.name}</span>
            <span className="tnum block text-xs text-ink-400" dir="ltr">{d.phone}</span>
          </span>
        </span>
      ),
    },
    { key: 'age', header: t('drivers.age'), align: 'center', render: (d) => <span className="tnum">{formatNumber(d.age, locale)}</span> },
    { key: 'city', header: t('common.city'), render: (d) => <span className="text-ink-600">{cityName(d.city, locale)}</span> },
    { key: 'moto', header: t('moto.category'), render: (d) => <MotorcycleBadge motorcycle={d.motorcycle} /> },
    { key: 'rating', header: t('common.rating'), render: (d) => <RatingStars value={d.performance.rating} /> },
    {
      key: 'success',
      header: t('drivers.successRate'),
      align: 'end',
      render: (d) => (
        <span className="tnum text-emerald-700">
          {d.performance.deliverySuccessRate > 0 ? formatPercent(d.performance.deliverySuccessRate, locale) : '—'}
        </span>
      ),
    },
  ]

  const hiredColumns: Column<Driver>[] = [
    { key: 'company', header: t('drivers.company'), render: (d) => <span className="text-ink-700">{d.employment ? companyName(d.employment.companyId) : '—'}</span> },
    { key: 'salary', header: t('drivers.salary'), align: 'end', render: (d) => <span className="tnum font-medium">{d.employment ? formatMoney(d.employment.salary, locale) : '—'}</span> },
    { key: 'start', header: t('drivers.startDate'), render: (d) => <span className="tnum text-xs text-ink-500">{d.employment ? formatDate(d.employment.startDate, locale) : '—'}</span> },
  ]

  const availableColumns: Column<Driver>[] = [
    { key: 'experience', header: t('drivers.experience'), align: 'center', render: (d) => <span className="tnum">{formatNumber(d.performance.experienceYears, locale)} {t('common.years')}</span> },
    { key: 'availability', header: t('drivers.availability'), render: (d) => <span className="text-ink-600">{t(`emp.${d.availability}` as TranslationKey)}</span> },
    { key: 'area', header: t('common.area'), render: (d) => <span className="text-ink-600">{d.preferredArea}</span> },
  ]

  const statusColumn: Column<Driver> = {
    key: 'status', header: t('common.status'), render: (d) => <DriverBadge status={d.status} />,
  }

  const columns: Column<Driver>[] =
    scope === 'hired'
      ? [...baseColumns, ...hiredColumns, statusColumn]
      : scope === 'available'
        ? [...baseColumns, ...availableColumns, statusColumn]
        : [
            ...baseColumns,
            statusColumn,
            { key: 'company', header: t('drivers.company'), render: (d) => <span className="text-ink-600">{d.employment ? companyName(d.employment.companyId) : '—'}</span> },
            { key: 'registered', header: t('drivers.registered'), render: (d) => <span className="tnum text-xs text-ink-500">{formatDate(d.registeredAt, locale)}</span> },
          ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={titles.title} subtitle={titles.subtitle} />
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t('common.search')}…`} aria-label={t('common.search')} className="w-full sm:w-64" />
          {scope === 'all' && (
            <SelectField label={t('drivers.filterStatus')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-40">
              <option value="all">{t('common.all')}</option>
              {(['available', 'hired', 'under_review', 'suspended'] as DriverStatus[]).map((s) => (
                <option key={s} value={s}>{t(driverKey(s))}</option>
              ))}
            </SelectField>
          )}
          <SelectField label={t('drivers.filterCity')} value={city} onChange={(e) => setCity(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {EGYPT_CITIES.map((c) => (
              <option key={c} value={c}>{cityName(c, locale)}</option>
            ))}
          </SelectField>
          <SelectField label={t('drivers.filterMoto')} value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{brandLabel(b, locale)}</option>
            ))}
          </SelectField>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clear} icon={<FilterX className="h-4 w-4" aria-hidden />}>
              {t('common.clearFilters')}
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(d) => d.id}
          onRowClick={(d) => navigate(`/admin/drivers/profile/${d.id}`)}
          stickyHeader
          emptyState={
            <EmptyState
              title={titles.empty}
              icon={<UserSearch className="h-6 w-6" />}
              action={hasFilters ? <Button variant="secondary" size="sm" onClick={clear}>{t('common.clearFilters')}</Button> : undefined}
            />
          }
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
