import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Info, Users } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, MotorcycleBadge, PageHeader, RatingStars } from '../../components/ui/misc'
import { ApplicationBadge } from '../../components/shared/StatusBadges'
import { formatDate, formatNumber, formatPercent } from '../../lib/format'
import { cityName } from '../../lib/geo'
import { PIPELINE_STAGES } from '../../lib/status'
import type { Application } from '../../types/domain'

// The employer follows candidates but does not act on them: screening and
// hiring are Kassab's job, which the page says plainly rather than showing
// buttons that would not work.
export function CompanyApplicantsPage() {
  const { t, locale } = useI18n()
  const { requests, applications } = useCompanyScope()
  const { driverById, driverName } = useLookups()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState('all')

  const requestId = params.get('request') ?? 'all'

  const filtered = useMemo(
    () => applications.filter((a) => {
      if (requestId !== 'all' && a.requestId !== requestId) return false
      if (status !== 'all' && a.status !== status) return false
      return true
    }),
    [applications, requestId, status],
  )

  const columns: Column<Application>[] = [
    {
      key: 'driver',
      header: t('apps.applicant'),
      render: (a) => {
        const d = driverById.get(a.driverId)
        return (
          <span className="flex items-center gap-2.5">
            <Avatar name={d?.name ?? '—'} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink-900">{driverName(a.driverId)}</span>
              <span className="tnum block text-xs text-ink-500">
                {d ? `${formatNumber(d.age, locale)} ${t('common.years')}` : '—'}
              </span>
            </span>
          </span>
        )
      },
    },
    {
      key: 'rating',
      header: t('common.rating'),
      render: (a) => {
        const d = driverById.get(a.driverId)
        return d ? <RatingStars value={d.performance.rating} /> : <span className="text-ink-400">—</span>
      },
    },
    {
      key: 'success',
      header: t('drivers.successRate'),
      align: 'end',
      render: (a) => {
        const d = driverById.get(a.driverId)
        return (
          <span className="tnum text-emerald-700">
            {d && d.performance.completedDeliveries > 0 ? formatPercent(d.performance.deliverySuccessRate, locale) : '—'}
          </span>
        )
      },
    },
    {
      key: 'motorcycle',
      header: t('moto.category'),
      render: (a) => {
        const d = driverById.get(a.driverId)
        return d ? <MotorcycleBadge motorcycle={d.motorcycle} /> : <span className="text-ink-400">—</span>
      },
    },
    {
      key: 'area',
      header: t('common.area'),
      render: (a) => {
        const d = driverById.get(a.driverId)
        return <span className="text-ink-600">{d ? cityName(d.city, locale) : '—'}</span>
      },
    },
    {
      key: 'request',
      header: t('company.forRequest'),
      render: (a) => {
        const r = requests.find((x) => x.id === a.requestId)
        return <span className="tnum text-xs text-ink-500">{r?.number ?? '—'}</span>
      },
    },
    { key: 'applied', header: t('apps.applied'), render: (a) => <span className="tnum text-xs text-ink-500">{formatDate(a.appliedAt, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (a) => <ApplicationBadge status={a.status} /> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('company.candidatesTitle')} subtitle={t('company.candidatesSub')} />

      <p className="mb-4 flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-sky-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {t('company.kassabScreens')}
      </p>

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SelectField
            label={t('company.forRequest')}
            value={requestId}
            onChange={(e) => {
              const v = e.target.value
              setParams(v === 'all' ? {} : { request: v })
            }}
            className="w-full sm:w-56"
          >
            <option value="all">{t('common.all')}</option>
            {requests.map((r) => (
              <option key={r.id} value={r.id}>{r.number} · {cityName(r.city, locale)}</option>
            ))}
          </SelectField>
          <SelectField
            label={t('common.status')}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">{t('common.all')}</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>{t(`appStatus.${s}` as Parameters<typeof t>[0])}</option>
            ))}
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(a) => a.id}
          stickyHeader
          emptyState={
            <EmptyState
              title={t('company.noApplicants')}
              hint={t('company.noApplicantsHint')}
              icon={<Users className="h-6 w-6" />}
            />
          }
        />
      </Card>
    </div>
  )
}
