import { useMemo, useState } from 'react'
import { ReceiptText } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SelectField } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader, Pagination } from '../components/ui/misc'
import { InvoiceStatusBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatDate, formatMoney, formatNumber } from '../lib/format'
import type { Invoice } from '../types/domain'

export function InvoicesPage() {
  const { t, locale } = useI18n()
  const { invoices, companies } = useAppState()
  const [status, setStatus] = useState('all')
  const [companyId, setCompanyId] = useState('all')

  const filtered = useMemo(
    () => invoices.filter((i) => (status === 'all' || i.status === status) && (companyId === 'all' || i.companyId === companyId)),
    [invoices, status, companyId],
  )
  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)

  const totals = useMemo(
    () => ({
      due: invoices.filter((i) => i.status === 'due').reduce((s, i) => s + i.amount, 0),
      overdue: invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
      paid: invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    }),
    [invoices],
  )

  const companyName = (id: string) => {
    const c = companies.find((x) => x.id === id)
    return c ? (locale === 'ar' ? c.nameAr : c.name) : '—'
  }

  const columns: Column<Invoice>[] = [
    { key: 'number', header: t('invoices.number'), render: (i) => <span className="tnum font-semibold" dir="ltr">{i.number}</span> },
    { key: 'company', header: t('orders.company'), render: (i) => <span className="text-ink-600">{companyName(i.companyId)}</span> },
    { key: 'period', header: t('invoices.period'), render: (i) => i.period },
    { key: 'orders', header: t('invoices.ordersCount'), align: 'end', render: (i) => <span className="tnum">{formatNumber(i.ordersCount, locale)}</span> },
    { key: 'amount', header: t('invoices.amount'), align: 'end', render: (i) => <span className="tnum font-medium">{formatMoney(i.amount, locale)}</span> },
    { key: 'issued', header: t('invoices.issued'), render: (i) => <span className="tnum text-xs text-ink-500">{formatDate(i.issuedAt, locale)}</span> },
    { key: 'due', header: t('invoices.due'), render: (i) => <span className="tnum text-xs text-ink-500">{formatDate(i.dueAt, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (i) => <InvoiceStatusBadge status={i.status} /> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('invoices.title')} subtitle={t('invoices.subtitle')} />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t('invoices.status.paid')} value={formatMoney(totals.paid, locale)} tone="success" />
        <StatCard label={t('invoices.status.due')} value={formatMoney(totals.due, locale)} />
        <StatCard label={t('invoices.status.overdue')} value={formatMoney(totals.overdue, locale)} tone="danger" />
      </div>
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {(['paid', 'due', 'overdue'] as const).map((s) => (
              <option key={s} value={s}>{t(`invoices.status.${s}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('orders.company')} value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full sm:w-56">
            <option value="all">{t('common.all')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{locale === 'ar' ? c.nameAr : c.name}</option>
            ))}
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(i) => i.id}
          emptyState={<EmptyState title={t('notif.empty')} icon={<ReceiptText className="h-6 w-6" />} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
