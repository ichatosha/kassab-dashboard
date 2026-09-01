import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightCircle, MapPin, Phone, UserPlus, XCircle } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Avatar, VehicleBadge } from '../../components/ui/misc'
import { OrderStatusBadge } from '../../components/shared/StatusBadges'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useToast } from '../../components/ui/Toast'
import { formatDateTime, formatMoney, formatNumber } from '../../lib/format'
import { ACTIVE_STATUSES, nextStatus, orderStatusKey } from '../../lib/status'
import type { Order } from '../../types/domain'
import { AssignDriverModal } from './AssignDriverModal'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{title}</h3>
      {children}
    </section>
  )
}

function Row({ label, value, ltr }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className={`text-sm font-medium text-ink-900 ${ltr ? 'tnum' : ''}`} dir={ltr ? 'ltr' : undefined}>
        {value}
      </dd>
    </div>
  )
}

export function OrderDrawer({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { t, locale } = useI18n()
  const { companies, drivers, dispatch } = useAppState()
  const { toast } = useToast()
  const [assignOpen, setAssignOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!order) return null

  const company = companies.find((c) => c.id === order.companyId)
  const driver = drivers.find((d) => d.id === order.driverId)
  const next = nextStatus(order.status)
  const isActive = ACTIVE_STATUSES.includes(order.status)

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        wide
        label={`${t('orders.detailsTitle')} ${order.number}`}
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span className="tnum text-base font-bold text-ink-950">{order.number}</span>
            <OrderStatusBadge status={order.status} />
            {order.etaMins != null && (
              <Badge tone="info">
                {t('orders.eta')}: {formatNumber(order.etaMins, locale)} {t('common.min')}
              </Badge>
            )}
          </div>
        }
        footer={
          <div className="flex flex-wrap items-center gap-2">
            {!order.driverId && isActive && (
              <Button size="sm" icon={<UserPlus className="h-4 w-4" aria-hidden />} onClick={() => setAssignOpen(true)}>
                {t('orders.assignDriver')}
              </Button>
            )}
            {order.driverId && isActive && (
              <>
                <Button size="sm" variant="secondary" onClick={() => setAssignOpen(true)}>
                  {t('orders.reassign')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    dispatch({ type: 'cancelAssignment', orderId: order.id })
                    toast(t('orders.assignmentCancelled'), 'info')
                  }}
                >
                  {t('orders.cancelAssignment')}
                </Button>
              </>
            )}
            {next && order.driverId && (
              <Button
                size="sm"
                variant="success"
                icon={<ArrowRightCircle className="h-4 w-4" aria-hidden />}
                onClick={() => {
                  dispatch({ type: 'advanceOrder', orderId: order.id })
                  toast(t('orders.statusUpdated'))
                }}
              >
                {t('orders.advanceStatus')}: {t(orderStatusKey(next))}
              </Button>
            )}
            {isActive && (
              <Button size="sm" variant="danger" icon={<XCircle className="h-4 w-4" aria-hidden />} onClick={() => setConfirmCancel(true)}>
                {t('orders.cancelOrder')}
              </Button>
            )}
          </div>
        }
      >
        {order.problemReason && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">{t('orders.problemReason')}</p>
            <p className="mt-1 text-sm text-amber-900">{order.problemReason}</p>
          </div>
        )}

        <Section title={t('orders.summary')}>
          <dl className="rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-2">
            <Row label={t('orders.company')} value={
              company ? (
                <Link to={`/companies/${company.id}`} className="text-brand-700 hover:underline">
                  {locale === 'ar' ? company.nameAr : company.name}
                </Link>
              ) : '—'
            } />
            <Row label={t('orders.created')} value={formatDateTime(order.createdAt, locale)} />
            {order.deliveredAt && <Row label={t('orders.deliveredAt')} value={formatDateTime(order.deliveredAt, locale)} />}
            <Row label={t('orders.packages')} value={formatNumber(order.packages, locale)} />
            <Row label={t('orders.weight')} value={`${formatNumber(order.weightKg, locale)} kg`} />
            <Row label={t('orders.vehicle')} value={<VehicleBadge type={order.vehicleType} />} />
          </dl>
        </Section>

        <Section title={t('orders.customerInfo')}>
          <div className="flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3">
            <Avatar name={order.customerName} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900">{order.customerName}</p>
              <p className="tnum flex items-center gap-1 text-xs text-ink-500" dir="ltr">
                <Phone className="h-3 w-3" aria-hidden />
                {order.customerPhone}
              </p>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <p className="flex items-start gap-2 text-sm text-ink-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              <span>
                <span className="block text-xs font-medium text-ink-400">{t('orders.pickup')}</span>
                {order.pickupAddress}
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-ink-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
              <span>
                <span className="block text-xs font-medium text-ink-400">{t('orders.delivery')}</span>
                {order.deliveryAddress}
              </span>
            </p>
          </div>
        </Section>

        <Section title={t('orders.driver')}>
          {driver ? (
            <Link to={`/drivers/${driver.id}`} className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-100 px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/30">
              <Avatar name={driver.name} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{locale === 'ar' ? driver.nameAr : driver.name}</p>
                <p className="tnum text-xs text-ink-500" dir="ltr">{driver.phone}</p>
              </div>
              <VehicleBadge type={driver.vehicle.type} />
            </Link>
          ) : (
            <p className="rounded-xl border border-dashed border-ink-200 px-4 py-3 text-sm text-ink-500">{t('orders.unassigned')}</p>
          )}
        </Section>

        <Section title={t('orders.pricing')}>
          <dl className="rounded-xl border border-ink-100 px-4 py-2">
            <Row label={t('orders.orderValue')} value={formatMoney(order.orderValue, locale)} ltr />
            <Row label={t('orders.fee')} value={formatMoney(order.deliveryFee, locale)} ltr />
            <Row label={t('orders.kassabShare')} value={formatMoney(order.kassabCommission, locale)} ltr />
            <Row label={t('orders.driverShare')} value={formatMoney(order.driverCommission, locale)} ltr />
            <Row label={t('orders.payment')} value={t(`payment.${order.paymentMethod}` as TranslationKey)} />
          </dl>
        </Section>

        {order.notes && (
          <Section title={t('orders.notes')}>
            <p className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700">{order.notes}</p>
          </Section>
        )}

        <Section title={t('orders.timeline')}>
          <ol className="relative ms-2 border-s-2 border-ink-100 ps-5">
            {[...order.timeline].reverse().map((ev, i) => (
              <li key={i} className="relative pb-4 last:pb-0">
                <span
                  aria-hidden
                  className={`absolute -start-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${i === 0 ? 'bg-brand-500' : 'bg-ink-300'}`}
                />
                <p className="text-sm font-medium text-ink-900">{t(orderStatusKey(ev.status))}</p>
                <p className="text-xs text-ink-500">
                  {formatDateTime(ev.at, locale)}
                  {ev.by ? ` · ${ev.by}` : ''}
                </p>
                {ev.note && <p className="mt-0.5 text-xs text-ink-500">{ev.note}</p>}
              </li>
            ))}
          </ol>
        </Section>
      </Drawer>

      {assignOpen && <AssignDriverModal order={order} onClose={() => setAssignOpen(false)} />}
      <ConfirmDialog
        open={confirmCancel}
        title={t('orders.cancelConfirmTitle')}
        body={t('orders.cancelConfirmBody')}
        danger
        confirmLabel={t('orders.cancelOrder')}
        onConfirm={() => {
          dispatch({ type: 'cancelOrder', orderId: order.id })
          toast(t('orders.statusUpdated'), 'info')
        }}
        onClose={() => setConfirmCancel(false)}
      />
    </>
  )
}
