import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileSearch, FilterX } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SearchInput, SelectField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, MotorcycleBadge, PageHeader, Pagination, RatingStars } from '../components/ui/misc'
import { ApplicationBadge } from '../components/shared/StatusBadges'
import { ApplicationDrawer } from '../features/applications/ApplicationDrawer'
import { usePagination } from '../hooks/usePagination'
import { formatMoney, formatPercent, formatRelative } from '../lib/format'
import { ALL_APPLICATION_STATUSES, applicationKey } from '../lib/status'
import type { Application } from '../types/domain'

export function ApplicationsPage() {
  const { t, locale } = useI18n()
  const { applications, companies } = useAppState()
  const { driverById, requestById, companyName, driverName } = useLookups()
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [companyId, setCompanyId] = useState('all')

  const openId = params.get('open')
  const openApplication = openId ? applications.find((a) => a.id === openId) ?? null : null

  const setOpen = (application: Application | null) => {
    const next = new URLSearchParams(params)
    if (application) next.set('open', application.id)
    else next.delete('open')
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return applications.filter((a) => {
      if (status !== 'all' && a.status !== status) return false
      if (companyId !== 'all' && a.companyId !== companyId) return false
      if (q) {
        const name = driverName(a.driverId).toLowerCase()
        if (!a.number.toLowerCase().includes(q) && !name.includes(q) && !driverName(a.driverId).includes(query.trim())) return false
      }
      return true
    })
  }, [applications, query, status, companyId, driverName])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)
  const hasFilters = query !== '' || status !== 'all' || companyId !== 'all'
  const clear = () => { setQuery(''); setStatus('all'); setCompanyId('all') }

  const columns: Column<Application>[] = [
    {
      key: 'applicant',
      header: t('apps.applicant'),
      render: (a) => {
        const d = driverById.get(a.driverId)
        return (
          <span className="flex items-center gap-2.5">
            <Avatar name={d?.name ?? '—'} size="sm" />
            <span>
              <span className="block font-medium text-ink-900">{driverName(a.driverId)}</span>
              <span className="tnum block text-xs text-ink-400" dir="ltr">{a.number}</span>
            </span>
          </span>
        )
      },
    },
    { key: 'company', header: t('apps.company'), render: (a) => <span className="text-ink-600">{companyName(a.companyId)}</span> },
    {
      key: 'salary',
      header: t('apps.salary'),
      align: 'end',
      render: (a) => {
        const r = requestById.get(a.requestId)
        return <span className="tnum font-medium">{r ? formatMoney(r.salary, locale) : '—'}</span>
      },
    },
    {
      key: 'rating',
      header: t('apps.rating'),
      render: (a) => <RatingStars value={driverById.get(a.driverId)?.performance.rating ?? 0} />,
    },
    {
      key: 'success',
      header: t('apps.successRate'),
      align: 'end',
      render: (a) => {
        const d = driverById.get(a.driverId)
        return (
          <span className="tnum text-emerald-700">
            {d && d.performance.deliverySuccessRate > 0 ? formatPercent(d.performance.deliverySuccessRate, locale) : '—'}
          </span>
        )
      },
    },
    {
      key: 'moto',
      header: t('moto.category'),
      render: (a) => {
        const d = driverById.get(a.driverId)
        return d ? <MotorcycleBadge motorcycle={d.motorcycle} showModel={false} /> : '—'
      },
    },
    { key: 'status', header: t('common.status'), render: (a) => <ApplicationBadge status={a.status} /> },
    { key: 'applied', header: t('apps.applied'), render: (a) => <span className="text-xs text-ink-500">{formatRelative(a.appliedAt, locale)}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('apps.title')} subtitle={t('apps.subtitle')} />
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t('common.search')}…`}
            aria-label={t('common.search')}
            className="w-full sm:w-64"
          />
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {ALL_APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{t(applicationKey(s))}</option>
            ))}
          </SelectField>
          <SelectField label={t('apps.company')} value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full sm:w-52">
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
          rowKey={(a) => a.id}
          onRowClick={setOpen}
          stickyHeader
          emptyState={
            <EmptyState
              title={t('apps.empty')}
              hint={t('apps.emptyHint')}
              icon={<FileSearch className="h-6 w-6" />}
              action={hasFilters ? <Button variant="secondary" size="sm" onClick={clear}>{t('common.clearFilters')}</Button> : undefined}
            />
          }
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>

      <ApplicationDrawer application={openApplication} onClose={() => setOpen(null)} />
    </div>
  )
}
