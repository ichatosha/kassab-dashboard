import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, FilterX } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SearchInput, SelectField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, Pagination, ProgressBar, VerifiedMark } from '../components/ui/misc'
import { CompanyBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatMoney, formatNumber } from '../lib/format'
import { cityName, EGYPT_CITIES } from '../lib/geo'
import type { BusinessType, Company } from '../types/domain'

const BIZ_TYPES: BusinessType[] = ['company', 'restaurant', 'pharmacy', 'retail', 'ecommerce']
const bizTone = { company: 'info', restaurant: 'brand', pharmacy: 'success', retail: 'warning', ecommerce: 'violet' } as const

export function CompaniesPage({ scope = 'all' }: { scope?: 'all' | 'hiring' }) {
  const { t, locale } = useI18n()
  const { companies, applications } = useAppState()
  const { contactName } = useLookups()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [city, setCity] = useState('all')

  const scoped = useMemo(
    () =>
      scope === 'hiring'
        ? companies.filter((c) => c.status === 'active' && c.driversHired < c.driversRequired)
        : companies,
    [companies, scope],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.nameAr.includes(query.trim()) && !c.contactName.toLowerCase().includes(q)) return false
      if (type !== 'all' && c.type !== type) return false
      if (city !== 'all' && c.city !== city) return false
      return true
    })
  }, [scoped, query, type, city])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 10)
  const hasFilters = query !== '' || type !== 'all' || city !== 'all'
  const clear = () => { setQuery(''); setType('all'); setCity('all') }

  const pendingCandidates = (companyId: string) =>
    applications.filter((a) => a.companyId === companyId && !['hired', 'rejected', 'withdrawn'].includes(a.status)).length

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: t('companies.name'),
      render: (c) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={c.name} size="sm" />
          <span>
            <span className="flex items-center gap-2 font-medium text-ink-900">
              {locale === 'ar' ? c.nameAr : c.name}
              <VerifiedMark verified={c.verified} />
            </span>
            <span className="block text-xs text-ink-400">{contactName(c.id)}</span>
          </span>
        </span>
      ),
    },
    { key: 'type', header: t('companies.type'), render: (c) => <Badge tone={bizTone[c.type]}>{t(`biz.${c.type}` as TranslationKey)}</Badge> },
    { key: 'city', header: t('common.city'), render: (c) => <span className="text-ink-600">{cityName(c.city, locale)}</span> },
    {
      key: 'progress',
      header: `${t('companies.hired')} / ${t('companies.required')}`,
      render: (c) => (
        <span className="block w-28">
          <span className="tnum text-xs text-ink-700">
            {formatNumber(c.driversHired, locale)} / {formatNumber(c.driversRequired, locale)}
          </span>
          <span className="mt-1 block">
            <ProgressBar value={c.driversHired} max={c.driversRequired} />
          </span>
        </span>
      ),
    },
    {
      key: 'open',
      header: t('companies.open'),
      align: 'center',
      render: (c) => <span className="tnum font-medium text-brand-700">{formatNumber(Math.max(0, c.driversRequired - c.driversHired), locale)}</span>,
    },
    { key: 'candidates', header: t('companies.pendingCandidates'), align: 'center', render: (c) => <span className="tnum">{formatNumber(pendingCandidates(c.id), locale)}</span> },
    { key: 'cost', header: t('companies.cost'), align: 'end', render: (c) => <span className="tnum font-medium">{formatMoney(c.monthlyWorkforceCost, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (c) => <CompanyBadge status={c.status} /> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={scope === 'hiring' ? t('companies.hiringTitle') : t('companies.title')}
        subtitle={scope === 'hiring' ? t('companies.hiringSubtitle') : t('companies.subtitle')}
      />
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t('common.search')}…`} aria-label={t('common.search')} className="w-full sm:w-64" />
          <SelectField label={t('companies.type')} value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {BIZ_TYPES.map((b) => (
              <option key={b} value={b}>{t(`biz.${b}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('common.city')} value={city} onChange={(e) => setCity(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {EGYPT_CITIES.map((c) => (
              <option key={c} value={c}>{cityName(c, locale)}</option>
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
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/companies/${c.id}`)}
          stickyHeader
          emptyState={
            <EmptyState
              title={scope === 'hiring' ? t('companies.emptyHiring') : t('companies.empty')}
              icon={<Building2 className="h-6 w-6" />}
              action={hasFilters ? <Button variant="secondary" size="sm" onClick={clear}>{t('common.clearFilters')}</Button> : undefined}
            />
          }
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
