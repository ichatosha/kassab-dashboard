import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, FilterX } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SearchInput, SelectField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, Pagination } from '../components/ui/misc'
import { DriverApprovalBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatMoney, formatNumber } from '../lib/format'
import type { BusinessType, Company } from '../types/domain'

const BIZ_TYPES: BusinessType[] = ['company', 'restaurant', 'pharmacy', 'retail', 'ecommerce']

const bizTone = { company: 'info', restaurant: 'brand', pharmacy: 'success', retail: 'warning', ecommerce: 'violet' } as const

export function CompaniesPage() {
  const { t, locale } = useI18n()
  const { companies } = useAppState()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return companies.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.nameAr.includes(query.trim()) && !c.contactName.toLowerCase().includes(q)) return false
      if (type !== 'all' && c.type !== type) return false
      if (status !== 'all' && c.status !== status) return false
      return true
    })
  }, [companies, query, type, status])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 10)
  const hasFilters = query !== '' || type !== 'all' || status !== 'all'
  const clearFilters = () => { setQuery(''); setType('all'); setStatus('all') }

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: t('companies.name'),
      render: (c) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={c.name} size="sm" />
          <span>
            <span className="block font-medium text-ink-900">{locale === 'ar' ? c.nameAr : c.name}</span>
            <span className="block text-xs text-ink-400">{locale === "ar" ? c.contactNameAr : c.contactName}</span>
          </span>
        </span>
      ),
    },
    { key: 'type', header: t('companies.type'), render: (c) => <Badge tone={bizTone[c.type]}>{t(`biz.${c.type}` as TranslationKey)}</Badge> },
    { key: 'status', header: t('common.status'), render: (c) => <DriverApprovalBadge status={c.status} /> },
    { key: 'branches', header: t('companies.branches'), align: 'center', render: (c) => <span className="tnum">{formatNumber(c.branchIds.length, locale)}</span> },
    { key: 'active', header: t('companies.activeOrders'), align: 'center', render: (c) => <span className="tnum">{formatNumber(c.activeOrders, locale)}</span> },
    { key: 'monthly', header: t('companies.monthlyOrders'), align: 'end', render: (c) => <span className="tnum">{formatNumber(c.monthlyOrders, locale)}</span> },
    { key: 'revenue', header: t('companies.revenue'), align: 'end', render: (c) => <span className="tnum font-medium">{formatMoney(c.monthlyRevenue, locale)}</span> },
    { key: 'price', header: t('companies.deliveryPrice'), align: 'end', render: (c) => <span className="tnum">{formatMoney(c.deliveryPrice, locale)}</span> },
    {
      key: 'outstanding', header: t('companies.outstanding'), align: 'end',
      render: (c) => <span className={`tnum font-medium ${c.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>{formatMoney(c.outstandingBalance, locale)}</span>,
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('companies.title')} subtitle={t('companies.subtitle')} />
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t('common.search')}…`} aria-label={t('common.search')} className="w-full sm:w-64" />
          <SelectField label={t('companies.type')} value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {BIZ_TYPES.map((b) => (
              <option key={b} value={b}>{t(`biz.${b}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {(['pending_review', 'approved', 'rejected', 'suspended'] as const).map((s) => (
              <option key={s} value={s}>{t(`driverStatus.${s}` as TranslationKey)}</option>
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
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/companies/${c.id}`)}
          stickyHeader
          emptyState={<EmptyState title={t('companies.empty')} icon={<Building2 className="h-6 w-6" />} action={hasFilters ? <Button variant="secondary" size="sm" onClick={clearFilters}>{t('common.clearFilters')}</Button> : undefined} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
