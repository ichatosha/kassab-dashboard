import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2, MapPin, Navigation, Package, Phone, Radio, ShieldCheck,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState, useLiveTracking } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { useDriverScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { ToggleField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { OrderStatusBadge, WorkStatusBadge } from '../../components/shared/StatusBadges'
import { TrackingMap } from '../../components/map/TrackingMap'
import { formatMoney, formatNumber, formatRelative } from '../../lib/format'
import { distanceKm } from '../../lib/map'
import type { DeliveryOrderStatus } from '../../types/domain'

// The driver side of tracking: what am I doing right now, and one button to
// move it forward. Location only leaves the phone while the driver is on
// shift and has said yes — the switch is here, not buried in settings.
export function DriverWorkPage() {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const { orders, liveStates, dispatch } = useAppState()

  // Positions only need to move while this screen is open
  useLiveTracking()
  const { driver, employer } = useDriverScope()
  const { companyName } = useLookups()
  const { toast } = useToast()

  const live = liveStates.find((l) => l.driverId === user?.driverId)
  const myOrders = useMemo(
    () => orders.filter((o) => o.driverId === user?.driverId),
    [orders, user],
  )
  const current = myOrders.find((o) =>
    ['assigned', 'picked_up', 'delivering'].includes(o.status),
  )
  const doneToday = myOrders.filter((o) => o.status === 'delivered').length
  const earnedToday = myOrders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + o.amount, 0)

  if (!driver) return <EmptyState title={t('notFound.title')} />

  // A driver who has not been placed yet has nothing to do here
  if (!driver.employment || !live) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={t('work.title')} subtitle={t('work.subtitle')} />
        <Card>
          <EmptyState
            title={t('work.notWorking')}
            hint={t('work.notWorkingHint')}
            icon={<Package className="h-6 w-6" />}
            action={<Link to="/delivery/jobs"><Button size="sm">{t('driver.findJobs')}</Button></Link>}
          />
        </Card>
      </div>
    )
  }

  const online = live.status !== 'offline'
  const nextStatus: DeliveryOrderStatus | null = current
    ? current.status === 'assigned' ? 'picked_up'
      : current.status === 'picked_up' ? 'delivering'
      : current.status === 'delivering' ? 'delivered'
      : null
    : null

  const advance = () => {
    if (!current || !nextStatus) return
    dispatch({ type: 'setOrderStatus', orderId: current.id, status: nextStatus })
    toast(t(`work.moved.${nextStatus}` as TranslationKey))
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('work.title')}
        subtitle={employer ? companyName(employer.id) : t('work.subtitle')}
        actions={<WorkStatusBadge status={live.status} />}
      />

      {/* Going on shift is the first thing a driver does, so it leads */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">
              {online ? t('work.onShift') : t('work.offShift')}
            </p>
            <p className="mt-0.5 text-xs text-ink-500">
              {online ? t('work.onShiftHint') : t('work.offShiftHint')}
            </p>
          </div>
          <Button
            variant={online ? 'secondary' : 'success'}
            icon={<Radio className="h-4 w-4" aria-hidden />}
            onClick={() => {
              const next = online ? 'offline' : 'available'
              dispatch({ type: 'setDriverWorkStatus', driverId: driver.id, status: next })
              toast(next === 'offline' ? t('work.wentOffline') : t('work.wentOnline'), next === 'offline' ? 'info' : 'success')
            }}
          >
            {online ? t('work.goOffline') : t('work.goOnline')}
          </Button>
        </div>

        <div className="mt-4 border-t border-ink-100 pt-3">
          <ToggleField
            label={t('work.shareLocation')}
            checked={live.shareLocation}
            onChange={(v) => {
              dispatch({ type: 'setLocationSharing', driverId: driver.id, sharing: v })
              toast(v ? t('work.sharingOn') : t('work.sharingOff'), v ? 'success' : 'info')
            }}
          />
          <p className="mt-1 flex items-start gap-2 text-xs leading-relaxed text-ink-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
            {t('work.locationPolicy')}
          </p>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('work.deliveriesToday')} value={formatNumber(doneToday, locale)} tone="success" />
        <StatCard label={t('work.collectedToday')} value={formatMoney(earnedToday, locale)} />
        <StatCard label={t('driver.monthlySalary')} value={formatMoney(driver.employment.salary, locale)} tone="brand" />
        <StatCard label={t('work.lastUpdate')} value={formatRelative(live.updatedAt, locale)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card title={t('work.currentJob')}>
          {current ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="tnum text-lg font-bold text-ink-950">{current.reference}</span>
                <OrderStatusBadge status={current.status} />
              </div>

              <dl className="mt-4 space-y-3">
                <div className="flex items-start gap-2.5 rounded-lg border border-ink-100 px-3 py-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                  <span className="min-w-0">
                    <dt className="text-xs text-ink-500">{t('track.pickup')}</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {locale === 'ar' ? current.pickupLabelAr : current.pickupLabel}
                    </dd>
                  </span>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg border border-ink-100 px-3 py-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  <span className="min-w-0">
                    <dt className="text-xs text-ink-500">{t('track.dropoff')}</dt>
                    <dd className="text-sm font-medium text-ink-900">
                      {locale === 'ar' ? current.dropoffLabelAr : current.dropoffLabel}
                    </dd>
                  </span>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg border border-ink-100 px-3 py-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                  <span className="min-w-0">
                    <dt className="text-xs text-ink-500">{t('orders.customer')}</dt>
                    <dd className="text-sm font-medium text-ink-900">{current.customerName}</dd>
                    <dd className="tnum text-xs text-ink-500" dir="ltr">{current.customerPhone}</dd>
                  </span>
                </div>
              </dl>

              <p className="tnum mt-3 flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                <span className="text-ink-600">{t('orders.amount')}</span>
                <span className="font-semibold text-ink-900">{formatMoney(current.amount, locale)}</span>
              </p>

              {live.shareLocation && (
                <p className="tnum mt-2 text-xs text-ink-500">
                  {distanceKm(live.point, current.dropoff) < 0.2
                    ? t('track.arriving')
                    : `${formatNumber(Math.round(distanceKm(live.point, current.dropoff) * 10) / 10, locale)} ${t('track.kmAway')}`}
                </p>
              )}

              <div className="mt-4 space-y-2">
                {nextStatus && (
                  <Button
                    className="h-11 w-full text-base"
                    icon={nextStatus === 'delivered'
                      ? <CheckCircle2 className="h-5 w-5" aria-hidden />
                      : <Navigation className="h-5 w-5" aria-hidden />}
                    onClick={advance}
                  >
                    {t(`work.action.${nextStatus}` as TranslationKey)}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    dispatch({ type: 'setOrderStatus', orderId: current.id, status: 'failed' })
                    toast(t('work.reportedFailed'), 'info')
                  }}
                >
                  {t('work.cannotDeliver')}
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              title={online ? t('work.noJob') : t('work.offShift')}
              hint={online ? t('work.noJobHint') : t('work.offShiftHint')}
              icon={<Package className="h-6 w-6" />}
            />
          )}
        </Card>

        <div className="space-y-4">
          {live.shareLocation ? (
            <TrackingMap
              states={[live]}
              orders={orders}
              city={live.city}
              selectedId={live.driverId}
              onSelect={() => {}}
              className="h-64"
            />
          ) : (
            <Card>
              <EmptyState title={t('work.mapOff')} hint={t('work.mapOffHint')} icon={<MapPin className="h-6 w-6" />} />
            </Card>
          )}

          <Card title={t('work.todayRuns')} padded={false}>
            {myOrders.length === 0 ? (
              <EmptyState title={t('work.noRuns')} />
            ) : (
              <ul className="max-h-64 divide-y divide-ink-100 overflow-y-auto scroll-thin">
                {myOrders.slice(0, 10).map((o) => (
                  <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="tnum block text-sm font-medium text-ink-900">{o.reference}</span>
                      <span className="block truncate text-xs text-ink-500">
                        {locale === 'ar' ? o.dropoffLabelAr : o.dropoffLabel}
                      </span>
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
