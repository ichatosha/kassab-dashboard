import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, FilterX } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useAuth } from '../store/auth'
import { useLookups } from '../hooks/useLookups'
import { EngagementInline } from '../components/shared/EngagementStats'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SearchInput, SelectField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader, Pagination, ProgressBar } from '../components/ui/misc'
import { RequestBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatDate, formatMoney, formatNumber } from '../lib/format'
import { cityName } from '../lib/geo'
import { OPEN_REQUEST_STATUSES, requestKey } from '../lib/status'
import type { WorkforceRequest, WorkforceRequestStatus } from '../types/domain'

const ALL_STATUSES: WorkforceRequestStatus[] = [
  'draft', 'open', 'reviewing', 'partially_filled', 'filled', 'closed', 'cancelled',
]

export function RequestsPage() {
  const { t, locale } = useI18n()
  const { requests, companies, applications, dispatch } = useAppState()
  const { canViewEngagement } = useAuth()
  const { companyName } = useLookups()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [companyId, setCompanyId] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return requests.filter((r) => {
      if (q && !r.number.toLowerCase().includes(q) && !companyName(r.companyId).toLowerCase().includes(q) && !companyName(r.companyId).includes(query.trim())) return false
      if (status !== 'all' && r.status !== status) return false
      if (companyId !== 'all' && r.companyId !== companyId) return false
      return true
    })
  }, [requests, query, status, companyId, companyName])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)
  const hasFilters = query !== '' || status !== 'all' || companyId !== 'all'
  const clear = () => { setQuery(''); setStatus('all'); setCompanyId('all') }

  const totals = useMemo(() => ({
    required: requests.reduce((s, r) => s + r.driversRequired, 0),
    hired: requests.reduce((s, r) => s + r.driversHired, 0),
    open: requests.filter((r) => OPEN_REQUEST_STATUSES.includes(r.status)).length,
  }), [requests])

  const applicationCount = (requestId: string) =>
    applications.filter((a) => a.requestId === requestId).length

  const columns: Column<WorkforceRequest>[] = [
    { key: 'number', header: t('wfr.number'), render: (r) => <span className="tnum font-semibold text-ink-900">{r.number}</span> },
    { key: 'company', header: t('wfr.company'), render: (r) => <span className="text-ink-700">{companyName(r.companyId)}</span> },
    { key: 'location', header: t('wfr.location'), render: (r) => <span className="text-ink-600">{cityName(r.city, locale)}</span> },
    { key: 'salary', header: t('wfr.salary'), align: 'end', render: (r) => <span className="tnum font-medium">{formatMoney(r.salary, locale)}</span> },
    {
      key: 'progress',
      header: `${t('wfr.hired')} / ${t('wfr.required')}`,
      render: (r) => (
        <span className="block w-28">
          <span className="tnum text-xs text-ink-700">
            {formatNumber(r.driversHired, locale)} / {formatNumber(r.driversRequired, locale)}
          </span>
          <span className="mt-1 block">
            <ProgressBar value={r.driversHired} max={r.driversRequired} />
          </span>
        </span>
      ),
    },
    { key: 'remaining', header: t('wfr.remaining'), align: 'center', render: (r) => <span className="tnum">{formatNumber(Math.max(0, r.driversRequired - r.driversHired), locale)}</span> },
    { key: 'apps', header: t('wfr.applications'), align: 'center', render: (r) => <span className="tnum">{formatNumber(applicationCount(r.id), locale)}</span> },
    // Audience numbers are restricted — see ENGAGEMENT_ROLES
    ...(canViewEngagement
      ? [{
          key: 'interest',
          header: t('eng.interest'),
          render: (r: WorkforceRequest) => <EngagementInline requestId={r.id} />,
        } as Column<WorkforceRequest>]
      : []),
    { key: 'status', header: t('common.status'), render: (r) => <RequestBadge status={r.status} /> },
    { key: 'deadline', header: t('wfr.deadline'), render: (r) => <span className="tnum text-xs text-ink-500">{formatDate(r.deadline, locale)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (r) => (
        <span onClick={(e) => e.stopPropagation()}>
          {r.status === 'draft' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => {
                dispatch({ type: 'setRequestStatus', requestId: r.id, status: 'open' })
                toast(t('wfr.published'))
              }}
            >
              {t('wfr.publish')}
            </Button>
          )}
          {OPEN_REQUEST_STATUSES.includes(r.status) && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                dispatch({ type: 'setRequestStatus', requestId: r.id, status: 'closed' })
                toast(t('wfr.closed'), 'info')
              }}
            >
              {t('wfr.close')}
            </Button>
          )}
          {r.status === 'closed' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                dispatch({ type: 'setRequestStatus', requestId: r.id, status: 'open' })
                toast(t('wfr.published'))
              }}
            >
              {t('wfr.reopen')}
            </Button>
          )}
        </span>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('wfr.title')} subtitle={t('wfr.subtitle')} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t('dash.openOpportunities')} value={formatNumber(totals.open, locale)} tone="brand" />
        <StatCard label={t('companies.required')} value={formatNumber(totals.required, locale)} />
        <StatCard label={t('dash.filledPositions')} value={formatNumber(totals.hired, locale)} tone="success" hint={`${formatNumber(totals.required - totals.hired, locale)} ${t('dash.remainingPositions').toLowerCase()}`} />
      </div>

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t('common.search')}…`} aria-label={t('common.search')} className="w-full sm:w-64" />
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{t(requestKey(s))}</option>
            ))}
          </SelectField>
          <SelectField label={t('wfr.company')} value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full sm:w-52">
            <option value="all">{t('common.all')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{locale === 'ar' ? c.nameAr : c.name}</option>
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
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate(`/admin/opportunities/${r.id}`)}
          stickyHeader
          emptyState={
            <EmptyState
              title={t('wfr.empty')}
              icon={<ClipboardList className="h-6 w-6" />}
              action={hasFilters ? <Button variant="secondary" size="sm" onClick={clear}>{t('common.clearFilters')}</Button> : undefined}
            />
          }
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
