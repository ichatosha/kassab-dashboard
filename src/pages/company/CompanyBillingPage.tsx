import { ReceiptText } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { InvoiceBadge, PaymentBadge } from '../../components/shared/StatusBadges'
import { formatDate, formatMoney, formatNumber, formatPeriod } from '../../lib/format'
import type { CompanyPayment, Invoice } from '../../types/domain'

export function CompanyBillingPage() {
  const { t, locale } = useI18n()
  const { invoices, payments, salaryTotal, kassabFee, monthlyTotal } = useCompanyScope()

  const outstanding = payments
    .filter((p) => p.status !== 'paid')
    .reduce((s, p) => s + p.total, 0)

  const invoiceColumns: Column<Invoice>[] = [
    { key: 'number', header: t('invoices.number'), render: (i) => <span className="tnum font-semibold text-ink-900">{i.number}</span> },
    { key: 'period', header: t('salaries.period'), render: (i) => <span className="tnum text-ink-600">{formatPeriod(i.period, locale)}</span> },
    { key: 'drivers', header: t('invoices.drivers'), align: 'center', render: (i) => <span className="tnum">{formatNumber(i.driversCount, locale)}</span> },
    { key: 'salaries', header: t('invoices.salaries'), align: 'end', render: (i) => <span className="tnum">{formatMoney(i.salaries, locale)}</span> },
    { key: 'fees', header: t('company.kassabFee'), align: 'end', render: (i) => <span className="tnum text-brand-700">{formatMoney(i.kassabFees, locale)}</span> },
    { key: 'total', header: t('common.total'), align: 'end', render: (i) => <span className="tnum font-semibold">{formatMoney(i.total, locale)}</span> },
    { key: 'due', header: t('invoices.due'), render: (i) => <span className="tnum text-xs text-ink-500">{formatDate(i.dueAt, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (i) => <InvoiceBadge status={i.status} /> },
  ]

  const paymentColumns: Column<CompanyPayment>[] = [
    { key: 'period', header: t('salaries.period'), render: (p) => <span className="tnum font-medium text-ink-900">{formatPeriod(p.period, locale)}</span> },
    { key: 'salaries', header: t('company.salaries'), align: 'end', render: (p) => <span className="tnum">{formatMoney(p.driverSalaries, locale)}</span> },
    { key: 'fees', header: t('company.kassabFee'), align: 'end', render: (p) => <span className="tnum text-brand-700">{formatMoney(p.kassabFees, locale)}</span> },
    { key: 'total', header: t('common.total'), align: 'end', render: (p) => <span className="tnum font-semibold">{formatMoney(p.total, locale)}</span> },
    { key: 'due', header: t('invoices.due'), render: (p) => <span className="tnum text-xs text-ink-500">{formatDate(p.dueDate, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (p) => <PaymentBadge status={p.status} /> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('company.billingTitle')} subtitle={t('company.billingSub')} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('company.salaries')} value={formatMoney(salaryTotal, locale)} />
        <StatCard label={t('company.kassabFee')} value={formatMoney(kassabFee, locale)} tone="brand" />
        <StatCard label={t('company.monthlyCost')} value={formatMoney(monthlyTotal, locale)} tone="success" />
        <StatCard label={t('company.outstanding')} value={formatMoney(outstanding, locale)} tone={outstanding > 0 ? 'danger' : 'default'} />
      </div>

      <Card title={t('company.invoices')} padded={false} className="mb-4">
        <DataTable
          columns={invoiceColumns}
          rows={invoices}
          rowKey={(i) => i.id}
          stickyHeader
          emptyState={<EmptyState title={t('company.noInvoices')} hint={t('company.noInvoicesHint')} icon={<ReceiptText className="h-6 w-6" />} />}
        />
      </Card>

      <Card title={t('company.paymentHistory')} padded={false}>
        <DataTable
          columns={paymentColumns}
          rows={payments}
          rowKey={(p) => p.id}
          stickyHeader
          emptyState={<EmptyState title={t('company.noPayments')} />}
        />
      </Card>
    </div>
  )
}
