import { Wallet } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useDriverScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { PayoutBadge } from '../../components/shared/StatusBadges'
import { formatDate, formatMoney, formatPeriod } from '../../lib/format'
import type { DriverPayout, WalletTransaction } from '../../types/domain'

export function DriverWalletPage() {
  const { t, locale } = useI18n()
  const { driver, payouts, transactions } = useDriverScope()
  const { companyName } = useLookups()

  if (!driver) return <EmptyState title={t('notFound.title')} />

  const payoutColumns: Column<DriverPayout>[] = [
    { key: 'period', header: t('salaries.period'), render: (p) => <span className="tnum font-medium text-ink-900">{formatPeriod(p.period, locale)}</span> },
    { key: 'company', header: t('drivers.company'), render: (p) => <span className="text-ink-600">{companyName(p.companyId)}</span> },
    { key: 'salary', header: t('driver.salary'), align: 'end', render: (p) => <span className="tnum">{formatMoney(p.salary, locale)}</span> },
    { key: 'bonus', header: t('payouts.bonus'), align: 'end', render: (p) => <span className="tnum text-emerald-700">{formatMoney(p.bonus, locale)}</span> },
    { key: 'deductions', header: t('payouts.deductions'), align: 'end', render: (p) => <span className="tnum text-red-700">{p.deductions > 0 ? `-${formatMoney(p.deductions, locale)}` : '—'}</span> },
    { key: 'net', header: t('payouts.net'), align: 'end', render: (p) => <span className="tnum font-semibold">{formatMoney(p.net, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (p) => <PayoutBadge status={p.status} /> },
    { key: 'paid', header: t('payouts.paidAt'), render: (p) => <span className="tnum text-xs text-ink-500">{p.paidAt ? formatDate(p.paidAt, locale) : '—'}</span> },
  ]

  const txColumns: Column<WalletTransaction>[] = [
    { key: 'at', header: t('common.date'), render: (tx) => <span className="tnum text-xs text-ink-500">{formatDate(tx.at, locale)}</span> },
    { key: 'type', header: t('wallet.type'), render: (tx) => <span className="text-ink-700">{t(`tx.${tx.type}` as Parameters<typeof t>[0])}</span> },
    { key: 'reference', header: t('wallet.reference'), render: (tx) => <span className="text-xs text-ink-500">{tx.reference}</span> },
    {
      key: 'amount',
      header: t('wallet.amount'),
      align: 'end',
      render: (tx) => (
        <span className={`tnum font-medium ${tx.amount < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
          {formatMoney(tx.amount, locale)}
        </span>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('driver.walletTitle')} subtitle={t('driver.walletSub')} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('driver.walletBalance')} value={formatMoney(driver.wallet.balance, locale)} tone="brand" />
        <StatCard label={t('wallet.pending')} value={formatMoney(driver.wallet.pendingEarnings, locale)} />
        <StatCard label={t('wallet.paid')} value={formatMoney(driver.wallet.paidEarnings, locale)} tone="success" />
        <StatCard label={t('wallet.totalEarnings')} value={formatMoney(driver.wallet.totalEarnings, locale)} />
      </div>

      <Card title={t('driver.payouts')} padded={false} className="mb-4">
        <DataTable
          columns={payoutColumns}
          rows={payouts}
          rowKey={(p) => p.id}
          stickyHeader
          emptyState={<EmptyState title={t('driver.noPayouts')} hint={t('driver.noPayoutsHint')} icon={<Wallet className="h-6 w-6" />} />}
        />
      </Card>

      <Card title={t('driver.transactions')} padded={false}>
        <DataTable
          columns={txColumns}
          rows={transactions}
          rowKey={(tx) => tx.id}
          stickyHeader
          emptyState={<EmptyState title={t('driver.noTransactions')} />}
        />
      </Card>
    </div>
  )
}
