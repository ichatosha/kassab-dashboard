import { useMemo } from 'react'
import type { DeliveryOrder, DriverLiveState, GeoPoint } from '../../types/domain'
import { localMapProvider } from '../../lib/map'
import type { MapProvider } from '../../lib/map'
import { useI18n } from '../../i18n'

// ── Tracking map ──────────────────────────────────────────────────────
// Renders driver positions through a MapProvider, so the projection is the
// only thing tying this to a vendor. Swapping in Google Maps or Mapbox
// means giving this component a different provider and a tile layer
// underneath — the markers, selection and route stay exactly as they are.

const STATUS_FILL: Record<DriverLiveState['status'], string> = {
  on_delivery: 'fill-brand-600',
  at_pickup: 'fill-amber-500',
  available: 'fill-emerald-500',
  delayed: 'fill-red-600',
  offline: 'fill-ink-400',
}

export function TrackingMap({
  states, orders, selectedId, onSelect, city, provider = localMapProvider, className = '',
}: {
  states: DriverLiveState[]
  orders: DeliveryOrder[]
  selectedId?: string
  onSelect: (driverId: string) => void
  city: string
  provider?: MapProvider
  className?: string
}) {
  const { t } = useI18n()
  const viewport = useMemo(() => provider.viewportFor(city), [provider, city])

  const placed = useMemo(
    () =>
      states
        .filter((s) => s.shareLocation && s.city === city)
        .map((s) => ({ state: s, pos: provider.project(s.point, viewport) })),
    [states, city, provider, viewport],
  )

  const selected = placed.find((p) => p.state.driverId === selectedId)
  const selectedOrder = selected?.state.orderId
    ? orders.find((o) => o.id === selected.state.orderId)
    : undefined

  const project = (point: GeoPoint) => provider.project(point, viewport)
  const pct = (n: number) => `${(n * 100).toFixed(2)}%`

  return (
    <div className={`relative overflow-hidden rounded-xl border border-ink-200 bg-ink-50 ${className}`}>
      {/* Street grid stands in for tiles until a map vendor is wired up */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <pattern id="kassab-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M8 0H0V8" className="stroke-ink-200" strokeWidth="0.25" fill="none" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#kassab-grid)" />
        <path d="M0 34 H100" className="stroke-ink-200" strokeWidth="1.4" fill="none" />
        <path d="M0 71 H100" className="stroke-ink-200" strokeWidth="1.1" fill="none" />
        <path d="M26 0 V100" className="stroke-ink-200" strokeWidth="1.4" fill="none" />
        <path d="M63 0 V100" className="stroke-ink-200" strokeWidth="1.1" fill="none" />
        <path d="M0 92 Q38 78 100 88" className="stroke-sky-700/25" strokeWidth="2.5" fill="none" />
      </svg>

      {/* The selected run: branch, customer, and the line between them */}
      {selected && selectedOrder && (
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <line
            x1={pct(project(selectedOrder.pickup).x)}
            y1={pct(project(selectedOrder.pickup).y)}
            x2={pct(project(selectedOrder.dropoff).x)}
            y2={pct(project(selectedOrder.dropoff).y)}
            className="stroke-brand-500"
            strokeWidth="2"
            strokeDasharray="5 4"
            opacity="0.6"
          />
        </svg>
      )}

      {selected && selectedOrder && (
        <>
          <Pin pos={project(selectedOrder.pickup)} label={t('track.pickup')} tone="ink" />
          <Pin pos={project(selectedOrder.dropoff)} label={t('track.dropoff')} tone="brand" />
        </>
      )}

      {placed.map(({ state, pos }) => {
        const isSelected = state.driverId === selectedId
        const live = state.status === 'on_delivery' || state.status === 'at_pickup'
        return (
          <button
            key={state.driverId}
            onClick={() => onSelect(state.driverId)}
            aria-label={`${state.driverId} — ${t(`workStatus.${state.status}` as Parameters<typeof t>[0])}`}
            aria-pressed={isSelected}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            style={{ left: pct(pos.x), top: pct(pos.y) }}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              {live && (
                <span
                  aria-hidden
                  className={`absolute inline-flex h-full w-full animate-pulse-dot rounded-full opacity-40 ${
                    state.status === 'on_delivery' ? 'bg-brand-500' : 'bg-amber-500'
                  }`}
                />
              )}
              <svg viewBox="0 0 16 16" className={`relative h-4 w-4 ${STATUS_FILL[state.status]}`}>
                <circle
                  cx="8" cy="8" r={isSelected ? 7 : 5.5}
                  className={isSelected ? 'stroke-ink-950' : 'stroke-surface'}
                  strokeWidth="2"
                />
              </svg>
            </span>
          </button>
        )
      })}

      {placed.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-ink-500">
          {t('track.noDriversHere')}
        </p>
      )}
    </div>
  )
}

function Pin({
  pos, label, tone,
}: { pos: { x: number; y: number }; label: string; tone: 'ink' | 'brand' }) {
  return (
    <span
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
      style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
    >
      <span
        className={`block whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-card ${
          tone === 'brand' ? 'bg-brand-600' : 'bg-night-800'
        }`}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={`mx-auto block h-2 w-0.5 ${tone === 'brand' ? 'bg-brand-600' : 'bg-night-800'}`}
      />
    </span>
  )
}
