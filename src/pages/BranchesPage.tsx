import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SearchInput, SelectField } from '../components/ui/Field'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader, Pagination } from '../components/ui/misc'
import { usePagination } from '../hooks/usePagination'
import { formatNumber, formatPercent } from '../lib/format'
import type { Branch } from '../types/domain'

export function BranchesPage() {
  const { t, locale } = useI18n()
  const { branches, companies } = useAppState()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [companyId, setCompanyId] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return branches.filter((b) => {
      if (q && !b.name.toLowerCase().includes(q) && !b.nameAr.includes(query.trim()) && !b.address.toLowerCase().includes(q) && !b.manager.toLowerCase().includes(q)) return false
      if (companyId !== 'all' && b.companyId !== companyId) return false
      return true
    })
  }, [branches, query, companyId])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)

  const companyName = (id: string) => {
    const c = companies.find((x) => x.id === id)
    return c ? (locale === 'ar' ? c.nameAr : c.name) : '—'
  }

  const columns: Column<Branch>[] = [
    { key: 'name', header: t('branches.name'), render: (b) => (
      <span>
        <span className="block font-medium text-ink-900">{locale === 'ar' ? b.nameAr : b.name}</span>
        <span className="block text-xs text-ink-400">{b.address}</span>
      </span>
    ) },
    { key: 'company', header: t('orders.company'), render: (b) => <span className="text-ink-600">{companyName(b.companyId)}</span> },
    { key: 'manager', header: t('branches.manager'), render: (b) => <span className="text-ink-600">{b.manager}</span> },
    { key: 'phone', header: t('common.phone'), render: (b) => <span className="tnum text-xs text-ink-500" dir="ltr">{b.phone}</span> },
    { key: 'status', header: t('common.status'), render: (b) => <Badge tone={b.active ? 'success' : 'neutral'}>{t(b.active ? 'branches.active' : 'branches.inactive')}</Badge> },
    { key: 'daily', header: t('branches.daily'), align: 'end', render: (b) => <span className="tnum">{formatNumber(b.dailyOrders, locale)}</span> },
    { key: 'monthly', header: t('branches.monthly'), align: 'end', render: (b) => <span className="tnum">{formatNumber(b.monthlyOrders, locale)}</span> },
    { key: 'success', header: t('companies.successRate'), align: 'end', render: (b) => <span className="tnum text-emerald-700">{formatPercent(b.successRate, locale)}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('branches.title')} subtitle={t('branches.subtitle')} />
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t('common.search')}…`} aria-label={t('common.search')} className="w-full sm:w-64" />
          <SelectField label={t('orders.company')} value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full sm:w-48">
            <option value="all">{t('common.all')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{locale === 'ar' ? c.nameAr : c.name}</option>
            ))}
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(b) => b.id}
          onRowClick={(b) => navigate(`/companies/${b.companyId}`)}
          emptyState={<EmptyState title={t('branches.empty')} icon={<GitBranch className="h-6 w-6" />} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
