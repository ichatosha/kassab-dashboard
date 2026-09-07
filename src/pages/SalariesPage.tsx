import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader } from '../components/ui/misc'
import { PaymentBadge } from '../components/shared/StatusBadges'
import { formatDate, formatMoney, formatNumber, formatPeriod } from '../lib/format'
import type { SalaryRecord } from '../types/domain'

export function SalariesPage() {
  const { t, locale } = useI18n()
  const { salaries: settlements, companies, drivers } = useAppState()
  const { companyName } = useLookups()
  const navigate = useNavigate()

  // The obligation is recomputed from the drivers actually employed right
  // now, so hiring mid-cycle updates this screen the same way it updates
  // the company profile. Settlement status comes from the billing record.
  const salaries: SalaryRecord[] = useMemo(() => {
    const employers = companies.filter((c) => c.driversHired > 0)
    return employers.map((c) => {
      const staff = drivers.filter((d) => d.status === 'hired' && d.employment?.companyId === c.id)
      const salaryTotal = staff.reduce((sum, d) => sum + (d.employment?.salary ?? 0), 0)
      const kassabFee = Math.round(salaryTotal * c.kassabFeeRate)
      const totalDue = salaryTotal + kassabFee
      const settlement = settlements.find((s) => s.companyId === c.id)
      const status = settlement?.status ?? 'pending'
      return {
        id: settlement?.id ?? `sal-${c.id}`,
        companyId: c.id,
        period: settlement?.period ?? '',
        driversCount: staff.length,
        salaryTotal,
        kassabFee,
        totalDue,
        paid: status === 'paid' ? totalDue : status === 'partially_paid' ? Math.round(totalDue * 0.6) : 0,
        status,
        dueDate: settlement?.dueDate ?? new Date().toISOString(),
      }
    })
  }, [companies, drivers, settlements])

  const totals = useMemo(() => ({
    salaryTotal: salaries.reduce((s, r) => s + r.salaryTotal, 0),
    fees: salaries.reduce((s, r) => s + r.kassabFee, 0),
    due: salaries.reduce((s, r) => s + r.totalDue, 0),
    drivers: salaries.reduce((s, r) => s + r.driversCount, 0),
  }), [salaries])

  const period = settlements[0]?.period

  const columns: Column<SalaryRecord>[] = [
    {
      key: 'company',
      header: t('salaries.company'),
      render: (r) => {
        const c = companies.find((x) => x.id === r.companyId)
        return (
          <span className="flex items-center gap-2.5">
            <Avatar name={c?.name ?? '—'} size="sm" />
            <span className="font-medium text-ink-900">{companyName(r.companyId)}</span>
          </span>
        )
      },
    },
    { key: 'drivers', header: t('salaries.drivers'), align: 'center', render: (r) => <span className="tnum">{formatNumber(r.driversCount, locale)}</span> },
    { key: 'salary', header: t('salaries.salaryTotal'), align: 'end', render: (r) => <span className="tnum">{formatMoney(r.salaryTotal, locale)}</span> },
    { key: 'fee', header: t('salaries.kassabFee'), align: 'end', render: (r) => <span className="tnum font-medium text-brand-700">{formatMoney(r.kassabFee, locale)}</span> },
    { key: 'due', header: t('salaries.totalDue'), align: 'end', render: (r) => <span className="tnum font-semibold">{formatMoney(r.totalDue, locale)}</span> },
    { key: 'paid', header: t('salaries.paid'), align: 'end', render: (r) => <span className="tnum text-emerald-700">{formatMoney(r.paid, locale)}</span> },
    {
      key: 'pending',
      header: t('salaries.pending'),
      align: 'end',
      render: (r) => {
        const pending = r.totalDue - r.paid
        return <span className={`tnum ${pending > 0 ? 'text-red-700' : 'text-ink-400'}`}>{formatMoney(pending, locale)}</span>
      },
    },
    { key: 'dueDate', header: t('salaries.dueDate'), render: (r) => <span className="tnum text-xs text-ink-500">{formatDate(r.dueDate, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (r) => <PaymentBadge status={r.status} /> },
  ]

  const feeShare = totals.due > 0 ? (totals.fees / totals.due) * 100 : 0

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('salaries.title')}
        subtitle={t('salaries.subtitle')}
        actions={
          period && (
            <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">
              {t('salaries.period')}: {formatPeriod(period, locale)}
            </span>
          )
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('dash.hiredDrivers')} value={formatNumber(totals.drivers, locale)} />
        <StatCard label={t('salaries.totalVolume')} value={formatMoney(totals.salaryTotal, locale)} />
        <StatCard label={t('salaries.totalFees')} value={formatMoney(totals.fees, locale)} tone="brand" />
        <StatCard label={t('salaries.totalDueAll')} value={formatMoney(totals.due, locale)} tone="success" />
      </div>

      <Card title={t('salaries.breakdown')} className="mb-4">
        <div
          className="flex h-8 w-full overflow-hidden rounded-lg"
          role="img"
          aria-label={`${t('salaries.salaryTotal')} ${formatMoney(totals.salaryTotal, locale)}, ${t('salaries.kassabFee')} ${formatMoney(totals.fees, locale)}`}
        >
          <div className="flex flex-1 items-center justify-center bg-night-700 text-xs font-semibold text-white">
            {Math.round(100 - feeShare)}%
          </div>
          <div className="flex items-center justify-center bg-brand-600 text-xs font-semibold text-white" style={{ width: `${feeShare}%` }}>
            {Math.round(feeShare)}%
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
          <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-night-700" />{t('salaries.salaryTotal')}</span>
          <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-brand-600" />{t('salaries.kassabFee')}</span>
        </div>
      </Card>

      <Card padded={false}>
        <DataTable
          columns={columns}
          rows={salaries}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate(`/admin/companies/${r.companyId}`)}
          stickyHeader
          emptyState={<EmptyState title={t('salaries.empty')} icon={<Banknote className="h-6 w-6" />} />}
        />
      </Card>
    </div>
  )
}
