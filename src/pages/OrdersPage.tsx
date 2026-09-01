import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterX, PackageSearch } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { SearchInput, SelectField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader, Pagination, VehicleBadge } from '../components/ui/misc'
import { OrderStatusBadge } from '../components/shared/StatusBadges'
import { OrderDrawer } from '../features/orders/OrderDrawer'
import { usePagination } from '../hooks/usePagination'
import { formatDateTime, formatMoney } from '../lib/format'
import { orderStatusKey } from '../lib/status'
import type { Order, OrderStatus, PaymentMethod, VehicleType } from '../types/domain'

const ALL_STATUSES: OrderStatus[] = [
  'new', 'assigned', 'en_route_pickup', 'picked_up', 'en_route_customer',
  'delivered', 'closed', 'failed', 'cancelled', 'address_problem', 'customer_unavailable',
]

export function OrdersPage() {
  const { t, locale } = useI18n()
  const { orders, companies, drivers } = useAppState()
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [companyId, setCompanyId] = useState('all')
  const [driverId, setDriverId] = useState('all')
  const [vehicle, setVehicle] = useState('all')
  const [payment, setPayment] = useState('all')

  const openId = params.get('open')
  const openOrder = openId ? orders.find((o) => o.id === openId) ?? null : null

  const setOpen = (order: Order | null) => {
    const next = new URLSearchParams(params)
    if (order) next.set('open', order.id)
    else next.delete('open')
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (q && !o.number.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q) && !o.deliveryAddress.toLowerCase().includes(q)) return false
      if (status !== 'all' && o.status !== status) return false
      if (companyId !== 'all' && o.companyId !== companyId) return false
      if (driverId !== 'all' && o.driverId !== driverId) return false
      if (vehicle !== 'all' && o.vehicleType !== vehicle) return false
      if (payment !== 'all' && o.paymentMethod !== payment) return false
      return true
    })
  }, [orders, query, status, companyId, driverId, vehicle, payment])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 12)

  const hasFilters = query !== '' || status !== 'all' || companyId !== 'all' || driverId !== 'all' || vehicle !== 'all' || payment !== 'all'
  const clearFilters = () => {
    setQuery('')
    setStatus('all')
    setCompanyId('all')
    setDriverId('all')
    setVehicle('all')
    setPayment('all')
  }

  const companyName = (id: string) => {
    const c = companies.find((x) => x.id === id)
    return c ? (locale === 'ar' ? c.nameAr : c.name) : '—'
  }
  const driverName = (id?: string) => {
    if (!id) return null
    const d = drivers.find((x) => x.id === id)
    return d ? (locale === 'ar' ? d.nameAr : d.name) : null
  }

  const columns: Column<Order>[] = [
    { key: 'number', header: t('orders.number'), render: (o) => <span className="tnum font-semibold text-ink-900">{o.number}</span> },
    { key: 'customer', header: t('orders.customer'), render: (o) => <span className="text-ink-800">{o.customerName}</span> },
    { key: 'company', header: t('orders.company'), render: (o) => <span className="text-ink-600">{companyName(o.companyId)}</span> },
    { key: 'driver', header: t('orders.driver'), render: (o) => driverName(o.driverId) ?? <span className="text-xs italic text-ink-400">{t('orders.unassigned')}</span> },
    { key: 'vehicle', header: t('orders.vehicle'), render: (o) => <VehicleBadge type={o.vehicleType} /> },
    { key: 'amount', header: t('orders.amount'), align: 'end', render: (o) => <span className="tnum font-medium">{formatMoney(o.orderValue, locale)}</span> },
    { key: 'fee', header: t('orders.fee'), align: 'end', render: (o) => <span className="tnum text-ink-600">{formatMoney(o.deliveryFee, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (o) => <OrderStatusBadge status={o.status} /> },
    { key: 'created', header: t('orders.created'), render: (o) => <span className="tnum text-xs text-ink-500">{formatDateTime(o.createdAt, locale)}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t('common.search')}…`}
            aria-label={t('common.search')}
            className="w-full sm:w-64"
          />
          <SelectField label={t('orders.filterStatus')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{t(orderStatusKey(s))}</option>
            ))}
          </SelectField>
          <SelectField label={t('orders.filterCompany')} value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{locale === 'ar' ? c.nameAr : c.name}</option>
            ))}
          </SelectField>
          <SelectField label={t('orders.filterDriver')} value={driverId} onChange={(e) => setDriverId(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {drivers.filter((d) => d.status === 'approved').map((d) => (
              <option key={d.id} value={d.id}>{locale === 'ar' ? d.nameAr : d.name}</option>
            ))}
          </SelectField>
          <SelectField label={t('orders.filterVehicle')} value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full sm:w-36">
            <option value="all">{t('common.all')}</option>
            {(['motorcycle', 'car', 'tricycle'] as VehicleType[]).map((v) => (
              <option key={v} value={v}>{t(`vehicle.${v}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('orders.filterPayment')} value={payment} onChange={(e) => setPayment(e.target.value)} className="w-full sm:w-36">
            <option value="all">{t('common.all')}</option>
            {(['cash', 'wallet', 'bank_transfer', 'card'] as PaymentMethod[]).map((p) => (
              <option key={p} value={p}>{t(`payment.${p}` as TranslationKey)}</option>
            ))}
          </SelectField>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} icon={<FilterX className="h-4 w-4" aria-hidden />}>
              {t('common.clearFilters')}
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(o) => o.id}
          onRowClick={setOpen}
          stickyHeader
          emptyState={
            <EmptyState
              title={t('orders.empty')}
              hint={t('orders.emptyHint')}
              icon={<PackageSearch className="h-6 w-6" />}
              action={hasFilters ? <Button variant="secondary" size="sm" onClick={clearFilters}>{t('common.clearFilters')}</Button> : undefined}
            />
          }
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>

      <OrderDrawer order={openOrder} onClose={() => setOpen(null)} />
    </div>
  )
}
