import { useMemo, useState } from 'react'
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
import { PaymentBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatDate, formatMoney, formatNumber, formatPeriod } from '../lib/format'
import { paymentKey } from '../lib/status'
import type { CompanyPayment, PaymentStatus } from '../types/domain'

const STATUSES: PaymentStatus[] = ['paid', 'pending', 'partially_paid', 'overdue']

export function PaymentsPage() {
  const { t, locale } = useI18n()
  const { payments, companies, dispatch } = useAppState()
  const { companyName } = useLookups()
  const { toast } = useToast()

  const [status, setStatus] = useState('all')
  const [period, setPeriod] = useState('all')

  const periods = useMemo(
    () => Array.from(new Set(payments.map((p) => p.period))).sort().reverse(),
    [payments],
  )

  const filtered = useMemo(
    () => payments.filter((p) => (status === 'all' || p.status === status) && (period === 'all' || p.period === period)),
    [payments, status, period],
  )

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)

  const totals = useMemo(() => ({
    collected: payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.total, 0),
    outstanding: payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.total, 0),
    overdue: payments.filter((p) => p.status === 'overdue').length,
  }), [payments])

  const columns: Column<CompanyPayment>[] = [
    {
      key: 'company',
      header: t('salaries.company'),
      render: (p) => {
        const c = companies.find((x) => x.id === p.companyId)
        return (
          <span className="flex items-center gap-2.5">
            <Avatar name={c?.name ?? '—'} size="sm" />
            <span className="font-medium text-ink-900">{companyName(p.companyId)}</span>
          </span>
        )
      },
    },
    { key: 'period', header: t('payments.period'), render: (p) => <span className="text-ink-600">{formatPeriod(p.period, locale)}</span> },
    { key: 'salaries', header: t('payments.driverSalaries'), align: 'end', render: (p) => <span className="tnum">{formatMoney(p.driverSalaries, locale)}</span> },
    { key: 'fees', header: t('payments.kassabFees'), align: 'end', render: (p) => <span className="tnum text-brand-700">{formatMoney(p.kassabFees, locale)}</span> },
    { key: 'total', header: t('common.total'), align: 'end', render: (p) => <span className="tnum font-semibold">{formatMoney(p.total, locale)}</span> },
    { key: 'due', header: t('payments.dueDate'), render: (p) => <span className="tnum text-xs text-ink-500">{formatDate(p.dueDate, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (p) => <PaymentBadge status={p.status} /> },
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
                dispatch({ type: 'markPaymentPaid', paymentId: p.id })
                toast(t('payments.marked'))
              }}
            >
              {t('payments.markPaid')}
            </Button>
          </span>
        ) : (
          <span className="tnum text-xs text-ink-400">{p.paidAt ? formatDate(p.paidAt, locale) : ''}</span>
        ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t('payments.collected')} value={formatMoney(totals.collected, locale)} tone="success" />
        <StatCard label={t('payments.outstanding')} value={formatMoney(totals.outstanding, locale)} tone={totals.outstanding > 0 ? 'danger' : 'default'} />
        <StatCard label={t('payments.overdueCount')} value={formatNumber(totals.overdue, locale)} tone={totals.overdue > 0 ? 'danger' : 'default'} />
      </div>

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(paymentKey(s))}</option>
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
          stickyHeader
          emptyState={<EmptyState title={t('payments.empty')} icon={<Wallet className="h-6 w-6" />} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
