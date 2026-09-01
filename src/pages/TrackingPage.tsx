import { useMemo, useState } from 'react'
import { Compass, Info, MapPin, Navigation, Phone, Radar } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader, Avatar, VehicleBadge } from '../components/ui/misc'
import { OrderStatusBadge } from '../components/shared/StatusBadges'
import { formatNumber } from '../lib/format'
import { cityName, zoneName } from '../lib/geo'
import type { Driver } from '../types/domain'

// Frontend-only geographic visualization. The <svg> below is the clean
// integration boundary that a Google Maps component will replace: it
// receives the same driver/pickup/destination props a real map would.
function NetworkMap({ drivers, selectedId, onSelect, regionLabel }: { drivers: Driver[]; selectedId: string | null; onSelect: (id: string) => void; regionLabel: string }) {
  const roadsH = [16, 30, 44, 58, 72, 86]
  const roadsV = [12, 26, 40, 54, 68, 82]
  const selected = drivers.find((d) => d.id === selectedId)

  return (
    <div dir="ltr" className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#eef1f5]">
      <svg viewBox="0 0 100 62" className="h-full w-full" role="img" aria-label="Live driver map (simulated)">
        {/* District blocks */}
        {roadsH.slice(0, -1).map((y, i) =>
          roadsV.slice(0, -1).map((x, j) => (
            <rect
              key={`${i}-${j}`}
              x={x + 1.2}
              y={(y * 62) / 100 + 1}
              width={roadsV[j + 1] - x - 2.4}
              height={((roadsH[i + 1] - y) * 62) / 100 - 2}
              rx={0.8}
              fill={(i + j) % 3 === 0 ? '#e3e8ee' : '#e8ecf2'}
            />
          )),
        )}
        {/* Roads */}
        {roadsH.map((y) => (
          <line key={`h${y}`} x1="0" y1={(y * 62) / 100} x2="100" y2={(y * 62) / 100} stroke="#fff" strokeWidth="1.6" />
        ))}
        {roadsV.map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="62" stroke="#fff" strokeWidth="1.6" />
        ))}
        {/* Nile-ish diagonal */}
        <path d="M38 0 C 36 14, 42 26, 39 38 C 37 47, 41 56, 39 62" stroke="#bcd7ef" strokeWidth="3.2" fill="none" opacity="0.8" />

        {/* Route for the selected driver */}
        {selected && (
          <>
            <path
              d={`M ${selected.position.x - 9} ${((selected.position.y - 12) * 62) / 100} L ${selected.position.x} ${(selected.position.y * 62) / 100} L ${selected.position.x + 11} ${((selected.position.y + 10) * 62) / 100}`}
              stroke="#d6242e"
              strokeWidth="0.9"
              strokeDasharray="2 1.2"
              fill="none"
            />
            {/* Pickup */}
            <circle cx={selected.position.x - 9} cy={((selected.position.y - 12) * 62) / 100} r="1.7" fill="#059669" stroke="#fff" strokeWidth="0.5" />
            {/* Destination */}
            <circle cx={selected.position.x + 11} cy={((selected.position.y + 10) * 62) / 100} r="1.7" fill="#d6242e" stroke="#fff" strokeWidth="0.5" />
          </>
        )}

        {/* Drivers */}
        {drivers.map((d) => {
          const cy = (d.position.y * 62) / 100
          const isSel = d.id === selectedId
          return (
            <g key={d.id} transform={`translate(${d.position.x} ${cy})`} className="cursor-pointer" onClick={() => onSelect(d.id)}>
              {isSel && <circle r="4" fill="#d6242e" opacity="0.15" />}
              <circle r={isSel ? 2.4 : 1.9} fill={isSel ? '#d6242e' : '#394253'} stroke="#fff" strokeWidth="0.6">
                {d.activity === 'delivering' && (
                  <animate attributeName="opacity" values="1;0.55;1" dur="1.8s" repeatCount="indefinite" />
                )}
              </circle>
              <g transform={`rotate(${d.position.heading})`}>
                <path d="M0 -3.4 L1.1 -1.6 L-1.1 -1.6 Z" fill={isSel ? '#d6242e' : '#394253'} />
              </g>
            </g>
          )
        })}
      </svg>
      <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-700 shadow-sm backdrop-blur">
        <Radar className="h-3.5 w-3.5 text-brand-600" aria-hidden />
        {regionLabel}
      </span>
    </div>
  )
}

export function TrackingPage() {
  const { t, locale } = useI18n()
  const { drivers, orders } = useAppState()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeDrivers = useMemo(
    () => drivers.filter((d) => d.status === 'approved' && d.connection === 'online'),
    [drivers],
  )
  const delivering = activeDrivers.filter((d) => d.activity === 'delivering')
  const selected = activeDrivers.find((d) => d.id === selectedId) ?? null
  const currentOrder = selected
    ? orders.find((o) => o.driverId === selected.id && ['assigned', 'en_route_pickup', 'picked_up', 'en_route_customer'].includes(o.status)) ?? null
    : null

  const headingLabel = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return dirs[Math.round(deg / 45) % 8]
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('tracking.title')}
        subtitle={t('tracking.subtitle')}
        actions={
          <Badge tone="violet" dot pulse>
            {formatNumber(delivering.length, locale)} {t('tracking.activeDeliveries')}
          </Badge>
        }
      />
      <p className="mb-4 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs text-sky-800">
        <Info className="h-4 w-4 shrink-0" aria-hidden />
        {t('tracking.mapNote')}
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NetworkMap drivers={activeDrivers} selectedId={selectedId} onSelect={setSelectedId} regionLabel={`${cityName("Cairo", locale)} · ${cityName("Giza", locale)}`} />
        </div>

        <div className="space-y-4">
          <Card title={t('tracking.driverInfo')}>
            {!selected ? (
              <p className="py-6 text-center text-sm text-ink-500">{t('tracking.selectDriver')}</p>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <Avatar name={selected.name} size="lg" />
                  <div className="min-w-0">
                    <p className="text-base font-bold text-ink-950">{locale === 'ar' ? selected.nameAr : selected.name}</p>
                    <p className="tnum flex items-center gap-1 text-xs text-ink-500" dir="ltr">
                      <Phone className="h-3 w-3" aria-hidden />
                      {selected.phone}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <VehicleBadge type={selected.vehicle.type} />
                  <Badge tone={selected.activity === 'delivering' ? 'violet' : 'success'} dot pulse>
                    {t(selected.activity === 'delivering' ? 'driverStatus.delivering' : 'driverStatus.online')}
                  </Badge>
                  <Badge tone="neutral">
                    <Compass className="h-3 w-3" aria-hidden /> {t('tracking.heading')}: {headingLabel(selected.position.heading)}
                  </Badge>
                </div>
                {currentOrder && (
                  <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50/60 p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">{t('tracking.currentOrder')}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="tnum text-sm font-bold text-ink-900">{currentOrder.number}</span>
                      <OrderStatusBadge status={currentOrder.status} />
                    </div>
                    {currentOrder.etaMins != null && (
                      <p className="tnum mt-1 text-xs text-ink-500">
                        {t('orders.eta')}: {formatNumber(currentOrder.etaMins, locale)} {t('common.min')}
                      </p>
                    )}
                    <div className="mt-2 space-y-1.5 text-xs text-ink-600">
                      <p className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                        <span><b>{t('tracking.pickupPoint')}:</b> {currentOrder.pickupAddress}</span>
                      </p>
                      <p className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
                        <span><b>{t('tracking.dropoffPoint')}:</b> {currentOrder.deliveryAddress}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card title={t('tracking.activeDeliveries')} padded={false}>
            {delivering.length === 0 ? (
              <EmptyState title={t('tracking.noActive')} icon={<Navigation className="h-6 w-6" />} />
            ) : (
              <ul className="max-h-72 divide-y divide-ink-100 overflow-y-auto scroll-thin">
                {delivering.map((d) => (
                  <li key={d.id}>
                    <button
                      className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-start transition-colors hover:bg-brand-50/40 ${d.id === selectedId ? 'bg-brand-50/60' : ''}`}
                      onClick={() => setSelectedId(d.id)}
                    >
                      <Avatar name={d.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{locale === 'ar' ? d.nameAr : d.name}</span>
                        <span className="block text-xs text-ink-500">{zoneName(d.zone, locale)}</span>
                      </span>
                      <VehicleBadge type={d.vehicle.type} />
                    </button>
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
