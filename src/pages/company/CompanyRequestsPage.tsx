import { Link, useNavigate } from 'react-router-dom'
import { ClipboardList, Plus } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader, ProgressBar } from '../../components/ui/misc'
import { RequestBadge } from '../../components/shared/StatusBadges'
import { formatDate, formatMoney, formatNumber } from '../../lib/format'
import { cityName } from '../../lib/geo'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'
import type { WorkforceRequest } from '../../types/domain'

export function CompanyRequestsPage() {
  const { t, locale } = useI18n()
  const { applications, dispatch } = useAppState()
  const { requests } = useCompanyScope()
  const { toast } = useToast()
  const navigate = useNavigate()

  const applicantCount = (requestId: string) =>
    applications.filter((a) => a.requestId === requestId).length

  const columns: Column<WorkforceRequest>[] = [
    { key: 'number', header: t('wfr.number'), render: (r) => <span className="tnum font-semibold text-ink-900">{r.number}</span> },
    { key: 'location', header: t('wfr.location'), render: (r) => <span className="text-ink-600">{cityName(r.city, locale)} · {r.area}</span> },
    { key: 'salary', header: t('wfr.salary'), align: 'end', render: (r) => <span className="tnum font-medium">{formatMoney(r.salary, locale)}</span> },
    { key: 'type', header: t('wfr.employmentType'), render: (r) => <span className="text-ink-600">{t(`emp.${r.employmentType}` as TranslationKey)}</span> },
    {
      key: 'progress',
      header: `${t('wfr.hired')} / ${t('wfr.required')}`,
      render: (r) => (
        <span className="block w-28">
          <span className="tnum text-xs text-ink-700">
            {formatNumber(r.driversHired, locale)} / {formatNumber(r.driversRequired, locale)}
          </span>
          <span className="mt-1 block">
            <ProgressBar value={r.driversHired} max={r.driversRequired} tone="emerald" />
          </span>
        </span>
      ),
    },
    { key: 'applicants', header: t('company.applicants'), align: 'center', render: (r) => <span className="tnum">{formatNumber(applicantCount(r.id), locale)}</span> },
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
      <PageHeader
        title={t('company.myRequestsTitle')}
        subtitle={t('company.myRequestsSub')}
        actions={
          <Link
            to="/company/requests/new"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('company.postRequest')}
          </Link>
        }
      />

      <Card padded={false}>
        <DataTable
          columns={columns}
          rows={requests}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate(`/company/applicants?request=${r.id}`)}
          stickyHeader
          emptyState={
            <EmptyState
              title={t('company.noRequests')}
              hint={t('company.noRequestsHint')}
              icon={<ClipboardList className="h-6 w-6" />}
              action={
                <Link to="/company/requests/new">
                  <Button size="sm">{t('company.postRequest')}</Button>
                </Link>
              }
            />
          }
        />
      </Card>
    </div>
  )
}
