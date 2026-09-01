import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Percent } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SelectField } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader, Pagination } from '../components/ui/misc'
import { OrderStatusBadge } from '../components/shared/StatusBadges'
import { usePagination } from '../hooks/usePagination'
import { formatMoney } from '../lib/format'
import type { Order } from '../types/domain'

export function CommissionsPage() {
  const { t, locale } = useI18n()
  const { orders, companies } = useAppState()
  const navigate = useNavigate()
  const [companyId, setCompanyId] = useState('all')

  const settled = useMemo(
    () => orders.filter((o) => (o.status === 'delivered' || o.status === 'closed') && (companyId === 'all' || o.companyId === companyId)),
    [orders, companyId],
  )

  const totals = useMemo(
    () => ({
      kassab: settled.reduce((s, o) => s + o.kassabCommission, 0),
      driver: settled.reduce((s, o) => s + o.driverCommission, 0),
      fees: settled.reduce((s, o) => s + o.deliveryFee, 0),
    }),
    [settled],
  )

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(settled, 12)

  const companyName = (id: string) => {
    const c = companies.find((x) => x.id === id)
    return c ? (locale === 'ar' ? c.nameAr : c.name) : '—'
  }

  const columns: Column<Order>[] = [
    { key: 'number', header: t('orders.number'), render: (o) => <span className="tnum font-semibold">{o.number}</span> },
    { key: 'company', header: t('orders.company'), render: (o) => <span className="text-ink-600">{companyName(o.companyId)}</span> },
    { key: 'value', header: t('commissions.orderAmount'), align: 'end', render: (o) => <span className="tnum">{formatMoney(o.orderValue, locale)}</span> },
    { key: 'price', header: t('commissions.companyPrice'), align: 'end', render: (o) => <span className="tnum">{formatMoney(o.deliveryFee, locale)}</span> },
    { key: 'kassab', header: t('commissions.kassab'), align: 'end', render: (o) => <span className="tnum font-medium text-brand-700">{formatMoney(o.kassabCommission, locale)}</span> },
    { key: 'driver', header: t('commissions.driverShare'), align: 'end', render: (o) => <span className="tnum text-ink-700">{formatMoney(o.driverCommission, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (o) => <OrderStatusBadge status={o.status} pulse={false} /> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('commissions.title')} subtitle={t('commissions.subtitle')} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t('commissions.totalKassab')} value={formatMoney(totals.kassab, locale)} tone="brand" icon={<Percent className="h-4 w-4" />} />
        <StatCard label={t('commissions.totalDriver')} value={formatMoney(totals.driver, locale)} />
        <StatCard label={t('commissions.net')} value={formatMoney(totals.kassab, locale)} tone="success" />
      </div>

      <Card title={t('commissions.breakdown')} className="mb-4">
        <div className="flex h-8 w-full overflow-hidden rounded-lg" role="img" aria-label={`${t('commissions.kassab')} ${formatMoney(totals.kassab, locale)}, ${t('commissions.driverShare')} ${formatMoney(totals.driver, locale)}`}>
          <div className="flex items-center justify-center bg-brand-600 text-xs font-semibold text-white" style={{ width: `${totals.fees ? (totals.kassab / totals.fees) * 100 : 0}%` }}>
            {totals.fees ? Math.round((totals.kassab / totals.fees) * 100) : 0}%
          </div>
          <div className="flex flex-1 items-center justify-center bg-ink-700 text-xs font-semibold text-white">
            {totals.fees ? Math.round((totals.driver / totals.fees) * 100) : 0}%
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
          <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-brand-600" />{t('commissions.kassab')}</span>
          <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-ink-700" />{t('commissions.driverShare')}</span>
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SelectField label={t('orders.filterCompany')} value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full sm:w-56">
            <option value="all">{t('common.all')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{locale === 'ar' ? c.nameAr : c.name}</option>
            ))}
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(o) => o.id}
          onRowClick={(o) => navigate(`/orders?open=${o.id}`)}
          emptyState={<EmptyState title={t('orders.empty')} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
