import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Plus } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { OrderStatusBadge } from '../../components/shared/StatusBadges'
import { NewOrderModal } from '../../features/orders/NewOrderModal'
import { formatMoney, formatNumber, formatRelative } from '../../lib/format'
import type { DeliveryOrder } from '../../types/domain'

// The order desk for a company running on Kassab tracking. They create a
// delivery, hand it to one of their Kassab drivers, and the driver moves it
// along from the driver app — no external system involved.
export function CompanyOrdersPage() {
  const { t, locale } = useI18n()
  const { orders, integrations, liveStates, dispatch } = useAppState()
  const { company, drivers } = useCompanyScope()
  const { driverName } = useLookups()
  const { toast } = useToast()
  const [status, setStatus] = useState('all')
  const [formOpen, setFormOpen] = useState(false)

  const integration = integrations.find(
    (i) => i.companyId === company?.id && i.status !== 'disconnected',
  )
  const isNative = integration?.method === 'native'

  const myOrders = useMemo(
    () => orders.filter((o) => o.companyId === company?.id),
    [orders, company],
  )
  const filtered = useMemo(
    () => myOrders.filter((o) => status === 'all' || o.status === status),
    [myOrders, status],
  )

  const kpis = useMemo(() => ({
    today: myOrders.length,
    active: myOrders.filter((o) => ['assigned', 'picked_up', 'delivering'].includes(o.status)).length,
    waiting: myOrders.filter((o) => o.status === 'new').length,
    delivered: myOrders.filter((o) => o.status === 'delivered').length,
  }), [myOrders])

  const availableDrivers = drivers.filter((d) => {
    const live = liveStates.find((l) => l.driverId === d.id)
    return !live || live.status === 'available' || live.status === 'offline'
  })

  if (!company) return <EmptyState title={t('notFound.title')} />

  if (!integration) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />
        <Card>
          <EmptyState
            title={t('orders.needsIntegration')}
            hint={t('orders.needsIntegrationHint')}
            icon={<Package className="h-6 w-6" />}
            action={
              <Link to="/company/integrations">
                <Button size="sm">{t('nav.integrations')}</Button>
              </Link>
            }
          />
        </Card>
      </div>
    )
  }

  const columns: Column<DeliveryOrder>[] = [
    {
      key: 'reference',
      header: t('orders.reference'),
      render: (o) => (
        <span className="min-w-0">
          <span className="tnum block font-semibold text-ink-900">{o.reference}</span>
          <span className="block text-xs text-ink-500">{formatRelative(o.createdAt, locale)}</span>
        </span>
      ),
    },
    {
      key: 'customer',
      header: t('orders.customer'),
      render: (o) => (
        <span className="min-w-0">
          <span className="block truncate text-sm text-ink-800">{o.customerName}</span>
          <span className="tnum block text-xs text-ink-500" dir="ltr">{o.customerPhone}</span>
        </span>
      ),
    },
    {
      key: 'dropoff',
      header: t('orders.dropoffAddress'),
      render: (o) => (
        <span className="block max-w-56 truncate text-sm text-ink-600">
          {locale === 'ar' ? o.dropoffLabelAr : o.dropoffLabel}
        </span>
      ),
    },
    {
      key: 'driver',
      header: t('orders.driver'),
      render: (o) => (
        o.driverId
          ? <span className="text-sm text-ink-800">{driverName(o.driverId)}</span>
          : <span className="text-xs text-ink-400">{t('orders.unassigned')}</span>
      ),
    },
    { key: 'amount', header: t('orders.amount'), align: 'end', render: (o) => <span className="tnum">{formatMoney(o.amount, locale)}</span> },
    {
      key: 'source',
      header: t('orders.source'),
      render: (o) => (
        <Badge tone={o.source === 'kassab' ? 'brand' : 'neutral'}>
          {t(`orders.source.${o.source}` as TranslationKey)}
        </Badge>
      ),
    },
    { key: 'status', header: t('common.status'), render: (o) => <OrderStatusBadge status={o.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (o) => {
        if (o.status !== 'new' || availableDrivers.length === 0) return null
        return (
          <span onClick={(e) => e.stopPropagation()}>
            <SelectField
              label=""
              value=""
              aria-label={t('orders.assign')}
              onChange={(e) => {
                if (!e.target.value) return
                dispatch({ type: 'assignOrder', orderId: o.id, driverId: e.target.value })
                toast(t('orders.assigned'))
              }}
              className="w-40"
            >
              <option value="">{t('orders.assign')}</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>{locale === 'ar' ? d.nameAr : d.name}</option>
              ))}
            </SelectField>
          </span>
        )
      },
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('orders.title')}
        subtitle={isNative ? t('orders.subtitleNative') : t('orders.subtitleIntegration')}
        actions={
          isNative && (
            <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setFormOpen(true)}>
              {t('orders.new')}
            </Button>
          )
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('orders.total')} value={formatNumber(kpis.today, locale)} />
        <StatCard label={t('orders.inProgress')} value={formatNumber(kpis.active, locale)} tone="brand" />
        <StatCard
          label={t('orders.waiting')}
          value={formatNumber(kpis.waiting, locale)}
          tone={kpis.waiting > 0 ? 'danger' : 'default'}
          hint={kpis.waiting > 0 ? t('orders.waitingHint') : undefined}
        />
        <StatCard label={t('orderStatus.delivered')} value={formatNumber(kpis.delivered, locale)} tone="success" />
      </div>

      {!isNative && (
        <p className="mb-4 rounded-lg bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-sky-700">
          {t('orders.externalNote')}
        </p>
      )}

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-48">
            <option value="all">{t('common.all')}</option>
            {(['new', 'assigned', 'picked_up', 'delivering', 'delivered', 'failed'] as const).map((s) => (
              <option key={s} value={s}>{t(`orderStatus.${s}` as TranslationKey)}</option>
            ))}
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(o) => o.id}
          stickyHeader
          emptyState={
            <EmptyState
              title={t('orders.empty')}
              hint={isNative ? t('orders.emptyHint') : undefined}
              icon={<Package className="h-6 w-6" />}
              action={isNative ? <Button size="sm" onClick={() => setFormOpen(true)}>{t('orders.new')}</Button> : undefined}
            />
          }
        />
      </Card>

      {formOpen && (
        <NewOrderModal companyId={company.id} city={company.city} onClose={() => setFormOpen(false)} />
      )}
    </div>
  )
}
