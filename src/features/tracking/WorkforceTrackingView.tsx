import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bike, MapPin, Radio, Users } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useLookups } from '../../hooks/useLookups'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, MotorcycleBadge, PageHeader, RatingStars } from '../../components/ui/misc'
import { OrderStatusBadge, WorkStatusBadge } from '../../components/shared/StatusBadges'
import { TrackingMap } from '../../components/map/TrackingMap'
import { formatMoney, formatNumber, formatPercent, formatRelative } from '../../lib/format'
import { cityName } from '../../lib/geo'
import { distanceKm } from '../../lib/map'
import type { DriverLiveState } from '../../types/domain'

// ── Workforce operations centre ───────────────────────────────────────
// Shared by Kassab staff and by an employer. The only difference is the
// slice of drivers handed in: a company sees its own workforce, Kassab
// sees every driver it placed. This is workforce visibility, not dispatch —
// nothing here assigns work or prices a delivery.
export function WorkforceTrackingView({
  title, subtitle, states, driverHref, showCompany = true,
}: {
  title: string
  subtitle: string
  states: DriverLiveState[]
  /** Where a driver name links to, if the viewer may open profiles */
  driverHref?: (driverId: string) => string
  showCompany?: boolean
}) {
  const { t, locale } = useI18n()
  const { orders, drivers } = useAppState()
  const { driverById, driverName, companyName } = useLookups()

  const cities = useMemo(
    () => Array.from(new Set(states.map((s) => s.city))).sort(),
    [states],
  )
  const [cityChoice, setCityChoice] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

  // Derived, not synced: if the chosen city stops having drivers, fall back
  // to the first one that does rather than re-rendering to fix it up.
  const city = cityChoice && cities.includes(cityChoice) ? cityChoice : (cities[0] ?? 'Cairo')

  const inCity = useMemo(() => states.filter((s) => s.city === city), [states, city])

  const kpis = useMemo(() => ({
    working: states.filter((s) => s.status !== 'offline').length,
    onDelivery: states.filter((s) => s.status === 'on_delivery').length,
    available: states.filter((s) => s.status === 'available').length,
    offline: states.filter((s) => s.status === 'offline').length,
    delayed: states.filter((s) => s.status === 'delayed').length,
    active: states.filter((s) => s.orderId).length,
  }), [states])

  const selected = states.find((s) => s.driverId === selectedId)
  const selectedDriver = selected ? driverById.get(selected.driverId) : undefined
  const selectedOrder = selected?.orderId ? orders.find((o) => o.id === selected.orderId) : undefined

  // Busy drivers first — those are the ones an operator acts on
  const ordered = useMemo(
    () => [...inCity].sort((a, b) => {
      const rank = (s: DriverLiveState) =>
        s.status === 'delayed' ? 0 : s.status === 'on_delivery' ? 1 : s.status === 'at_pickup' ? 2 : s.status === 'available' ? 3 : 4
      return rank(a) - rank(b)
    }),
    [inCity],
  )

  if (states.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={title} subtitle={subtitle} />
        <Card>
          <EmptyState
            title={t('track.empty')}
            hint={t('track.emptyHint')}
            icon={<Radio className="h-6 w-6" />}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
              {t('track.live')}
            </span>
            <SelectField
              label={t('common.city')}
              value={city}
              onChange={(e) => { setCityChoice(e.target.value); setSelectedId(undefined) }}
              className="w-40"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{cityName(c, locale)}</option>
              ))}
            </SelectField>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label={t('track.working')} value={formatNumber(kpis.working, locale)} tone="success" />
        <StatCard label={t('track.onDelivery')} value={formatNumber(kpis.onDelivery, locale)} tone="brand" />
        <StatCard label={t('track.availableNow')} value={formatNumber(kpis.available, locale)} />
        <StatCard label={t('track.activeDeliveries')} value={formatNumber(kpis.active, locale)} />
        <StatCard
          label={t('track.delayed')}
          value={formatNumber(kpis.delayed, locale)}
          tone={kpis.delayed > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <TrackingMap
            states={states}
            orders={orders}
            city={city}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="h-[22rem] lg:h-[30rem]"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-600">
            {(['on_delivery', 'at_pickup', 'available', 'delayed', 'offline'] as const).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-full ${
                    s === 'on_delivery' ? 'bg-brand-600'
                      : s === 'at_pickup' ? 'bg-amber-500'
                      : s === 'available' ? 'bg-emerald-500'
                      : s === 'delayed' ? 'bg-red-600' : 'bg-ink-400'
                  }`}
                />
                {t(`workStatus.${s}` as TranslationKey)}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {selected && selectedDriver ? (
            <Card title={t('track.driverDetail')}>
              <div className="flex items-center gap-3">
                <Avatar name={selectedDriver.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-ink-950">
                    {driverName(selected.driverId)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <WorkStatusBadge status={selected.status} />
                    <RatingStars value={selectedDriver.performance.rating} />
                  </div>
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                {showCompany && selected.companyId && (
                  <Row label={t('drivers.company')} value={companyName(selected.companyId)} />
                )}
                <Row label={t('moto.category')} value={<MotorcycleBadge motorcycle={selectedDriver.motorcycle} />} />
                <Row
                  label={t('drivers.successRate')}
                  value={<span className="tnum text-emerald-700">{formatPercent(selectedDriver.performance.deliverySuccessRate, locale)}</span>}
                />
                <Row
                  label={t('track.deliveriesToday')}
                  value={<span className="tnum">{formatNumber(selected.deliveriesToday, locale)}</span>}
                />
                <Row label={t('track.lastUpdate')} value={formatRelative(selected.updatedAt, locale)} />
              </dl>

              {selectedOrder ? (
                <div className="mt-4 rounded-lg border border-ink-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="tnum text-sm font-semibold text-ink-900">{selectedOrder.reference}</span>
                    <OrderStatusBadge status={selectedOrder.status} />
                  </div>
                  <dl className="mt-2.5 space-y-1.5 text-xs">
                    <div className="flex items-start gap-2 text-ink-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
                      <span>
                        <span className="block text-ink-500">{t('track.pickup')}</span>
                        {locale === 'ar' ? selectedOrder.pickupLabelAr : selectedOrder.pickupLabel}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-ink-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />
                      <span>
                        <span className="block text-ink-500">{t('track.dropoff')}</span>
                        {locale === 'ar' ? selectedOrder.dropoffLabelAr : selectedOrder.dropoffLabel}
                      </span>
                    </div>
                  </dl>
                  <p className="tnum mt-2.5 border-t border-ink-100 pt-2 text-xs text-ink-500">
                    {distanceKm(selected.point, selectedOrder.dropoff) < 0.2
                      ? t('track.arriving')
                      : `${formatNumber(Math.round(distanceKm(selected.point, selectedOrder.dropoff) * 10) / 10, locale)} ${t('track.kmAway')}`}
                    {' · '}
                    {formatMoney(selectedOrder.amount, locale)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
                  {t('track.noActiveOrder')}
                </p>
              )}

              {driverHref && (
                <Link to={driverHref(selected.driverId)} className="mt-4 block">
                  <Button variant="secondary" className="w-full">{t('apps.viewProfile')}</Button>
                </Link>
              )}
            </Card>
          ) : (
            <Card title={t('track.driverDetail')}>
              <EmptyState title={t('track.selectDriver')} icon={<Bike className="h-6 w-6" />} />
            </Card>
          )}

          <Card title={`${t('track.driversInCity')} (${formatNumber(ordered.length, locale)})`} padded={false}>
            {ordered.length === 0 ? (
              <EmptyState title={t('track.noDriversHere')} icon={<Users className="h-6 w-6" />} />
            ) : (
              <ul className="max-h-80 divide-y divide-ink-100 overflow-y-auto scroll-thin">
                {ordered.map((s) => {
                  const order = s.orderId ? orders.find((o) => o.id === s.orderId) : undefined
                  const driver = drivers.find((d) => d.id === s.driverId)
                  return (
                    <li key={s.driverId}>
                      <button
                        onClick={() => setSelectedId(s.driverId)}
                        className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-start transition-colors ${
                          s.driverId === selectedId ? 'bg-brand-50/60' : 'hover:bg-ink-50'
                        }`}
                      >
                        <Avatar name={driver?.name ?? '—'} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink-900">
                            {driverName(s.driverId)}
                          </span>
                          <span className="tnum block truncate text-xs text-ink-500">
                            {order ? order.reference : t('track.noJob')} · {formatRelative(s.updatedAt, locale)}
                          </span>
                        </span>
                        <WorkStatusBadge status={s.status} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  )
}
