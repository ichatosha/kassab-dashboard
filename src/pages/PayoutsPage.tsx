import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SelectField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, Pagination } from '../components/ui/misc'
import { PayoutBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatDate, formatMoney, formatPeriod } from '../lib/format'
import { payoutKey } from '../lib/status'
import type { DriverPayout, PayoutStatus } from '../types/domain'

const STATUSES: PayoutStatus[] = ['paid', 'pending', 'processing']

export function PayoutsPage() {
  const { t, locale } = useI18n()
  const { payouts, dispatch } = useAppState()
  const { driverById, driverName, companyName } = useLookups()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [status, setStatus] = useState('all')
  const [period, setPeriod] = useState('all')

  const periods = useMemo(
    () => Array.from(new Set(payouts.map((p) => p.period))).sort().reverse(),
    [payouts],
  )

  const filtered = useMemo(
    () => payouts.filter((p) => (status === 'all' || p.status === status) && (period === 'all' || p.period === period)),
    [payouts, status, period],
  )

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)

  const totals = useMemo(() => ({
    net: payouts.reduce((s, p) => s + p.net, 0),
    pending: payouts.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.net, 0),
  }), [payouts])

  const columns: Column<DriverPayout>[] = [
    {
      key: 'driver',
      header: t('payouts.driver'),
      render: (p) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={driverById.get(p.driverId)?.name ?? '—'} size="sm" />
          <span className="font-medium text-ink-900">{driverName(p.driverId)}</span>
        </span>
      ),
    },
    { key: 'company', header: t('payouts.company'), render: (p) => <span className="text-ink-600">{companyName(p.companyId)}</span> },
    { key: 'period', header: t('payments.period'), render: (p) => <span className="text-ink-600">{formatPeriod(p.period, locale)}</span> },
    { key: 'salary', header: t('payouts.salary'), align: 'end', render: (p) => <span className="tnum">{formatMoney(p.salary, locale)}</span> },
    { key: 'bonus', header: t('payouts.bonus'), align: 'end', render: (p) => <span className="tnum text-emerald-700">{p.bonus > 0 ? `+${formatMoney(p.bonus, locale)}` : '—'}</span> },
    { key: 'deductions', header: t('payouts.deductions'), align: 'end', render: (p) => <span className="tnum text-red-700">{p.deductions > 0 ? `-${formatMoney(p.deductions, locale)}` : '—'}</span> },
    { key: 'net', header: t('payouts.net'), align: 'end', render: (p) => <span className="tnum font-semibold">{formatMoney(p.net, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (p) => <PayoutBadge status={p.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (p) =>
        p.status !== 'paid' ? (
          <span onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="success"
              onClick={() => {
                dispatch({ type: 'markPayoutPaid', payoutId: p.id })
                toast(t('payouts.marked'))
              }}
            >
              {t('payouts.markPaid')}
            </Button>
          </span>
        ) : (
          <span className="tnum text-xs text-ink-400">{p.paidAt ? formatDate(p.paidAt, locale) : ''}</span>
        ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('payouts.title')} subtitle={t('payouts.subtitle')} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard label={t('payouts.totalNet')} value={formatMoney(totals.net, locale)} />
        <StatCard label={t('payouts.pendingTotal')} value={formatMoney(totals.pending, locale)} tone={totals.pending > 0 ? 'brand' : 'default'} />
      </div>

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(payoutKey(s))}</option>
            ))}
          </SelectField>
          <SelectField label={t('payments.period')} value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {periods.map((p) => (
              <option key={p} value={p}>{formatPeriod(p, locale)}</option>
            ))}
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(p) => p.id}
          onRowClick={(p) => navigate(`/admin/drivers/profile/${p.driverId}`)}
          stickyHeader
          emptyState={<EmptyState title={t('payouts.empty')} icon={<Wallet className="h-6 w-6" />} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
      <p className="mt-3 text-xs text-ink-400">{t('wallet.integrationNote')}</p>
    </div>
  )
}
