import { useMemo, useState } from 'react'
import { ReceiptText } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SelectField } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, Pagination } from '../components/ui/misc'
import { InvoiceBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatDate, formatMoney, formatNumber, formatPeriod } from '../lib/format'
import { invoiceKey } from '../lib/status'
import { cityName } from '../lib/geo'
import type { Invoice, InvoiceStatus } from '../types/domain'

const STATUSES: InvoiceStatus[] = ['paid', 'due', 'overdue']

export function InvoicesPage() {
  const { t, locale } = useI18n()
  const { invoices, companies } = useAppState()
  const { companyName, contactName } = useLookups()
  const [status, setStatus] = useState('all')
  const [companyId, setCompanyId] = useState('all')
  const [selected, setSelected] = useState<Invoice | null>(null)

  const filtered = useMemo(
    () => invoices.filter((i) => (status === 'all' || i.status === status) && (companyId === 'all' || i.companyId === companyId)),
    [invoices, status, companyId],
  )

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)

  const totals = useMemo(() => ({
    paid: invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    due: invoices.filter((i) => i.status === 'due').reduce((s, i) => s + i.total, 0),
    overdue: invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
  }), [invoices])

  const columns: Column<Invoice>[] = [
    { key: 'number', header: t('invoices.number'), render: (i) => <span className="tnum font-semibold" dir="ltr">{i.number}</span> },
    {
      key: 'company',
      header: t('salaries.company'),
      render: (i) => {
        const c = companies.find((x) => x.id === i.companyId)
        return (
          <span className="flex items-center gap-2.5">
            <Avatar name={c?.name ?? '—'} size="sm" />
            <span className="font-medium text-ink-900">{companyName(i.companyId)}</span>
          </span>
        )
      },
    },
    { key: 'period', header: t('salaries.period'), render: (i) => <span className="text-ink-600">{formatPeriod(i.period, locale)}</span> },
    { key: 'drivers', header: t('invoices.drivers'), align: 'center', render: (i) => <span className="tnum">{formatNumber(i.driversCount, locale)}</span> },
    { key: 'salaries', header: t('invoices.salaries'), align: 'end', render: (i) => <span className="tnum">{formatMoney(i.salaries, locale)}</span> },
    { key: 'fees', header: t('invoices.fees'), align: 'end', render: (i) => <span className="tnum text-brand-700">{formatMoney(i.kassabFees, locale)}</span> },
    { key: 'total', header: t('common.total'), align: 'end', render: (i) => <span className="tnum font-semibold">{formatMoney(i.total, locale)}</span> },
    { key: 'due', header: t('invoices.due'), render: (i) => <span className="tnum text-xs text-ink-500">{formatDate(i.dueAt, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (i) => <InvoiceBadge status={i.status} /> },
  ]

  const selectedCompany = selected ? companies.find((c) => c.id === selected.companyId) : undefined

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('invoices.title')} subtitle={t('invoices.subtitle')} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t('invStatus.paid')} value={formatMoney(totals.paid, locale)} tone="success" />
        <StatCard label={t('invStatus.due')} value={formatMoney(totals.due, locale)} />
        <StatCard label={t('invStatus.overdue')} value={formatMoney(totals.overdue, locale)} tone={totals.overdue > 0 ? 'danger' : 'default'} />
      </div>

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(invoiceKey(s))}</option>
            ))}
          </SelectField>
          <SelectField label={t('salaries.company')} value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full sm:w-52">
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
          onRowClick={setSelected}
          stickyHeader
          emptyState={<EmptyState title={t('invoices.empty')} icon={<ReceiptText className="h-6 w-6" />} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>

      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          wide
          title={`${t('invoices.details')} · ${selected.number}`}
          footer={<Button variant="secondary" onClick={() => setSelected(null)}>{t('common.close')}</Button>}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{t('invoices.billTo')}</p>
              <p className="mt-1 text-base font-bold text-ink-950">{companyName(selected.companyId)}</p>
              {selectedCompany && (
                <p className="text-xs text-ink-500">
                  {contactName(selectedCompany.id)} · {cityName(selectedCompany.city, locale)}
                </p>
              )}
            </div>
            <div className="text-end">
              <InvoiceBadge status={selected.status} />
              <p className="tnum mt-2 text-xs text-ink-500">
                {t('invoices.issued')}: {formatDate(selected.issuedAt, locale)}
              </p>
              <p className="tnum text-xs text-ink-500">
                {t('invoices.due')}: {formatDate(selected.dueAt, locale)}
              </p>
            </div>
          </div>

          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                <th className="py-2 text-start font-semibold">{t('common.details')}</th>
                <th className="py-2 text-center font-semibold">{t('invoices.drivers')}</th>
                <th className="py-2 text-end font-semibold">{t('common.total')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ink-100">
                <td className="py-2.5 text-ink-800">{t('invoices.lineDrivers')}</td>
                <td className="tnum py-2.5 text-center">{formatNumber(selected.driversCount, locale)}</td>
                <td className="tnum py-2.5 text-end font-medium">{formatMoney(selected.salaries, locale)}</td>
              </tr>
              <tr className="border-b border-ink-100">
                <td className="py-2.5 text-ink-800">{t('invoices.lineFee')}</td>
                <td className="py-2.5 text-center text-ink-400">—</td>
                <td className="tnum py-2.5 text-end font-medium text-brand-700">{formatMoney(selected.kassabFees, locale)}</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-ink-950">{t('invoices.grandTotal')}</td>
                <td />
                <td className="tnum py-3 text-end text-lg font-bold text-ink-950">{formatMoney(selected.total, locale)}</td>
              </tr>
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  )
}
