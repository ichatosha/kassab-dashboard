import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { DeliveryOrder, DriverLiveState, GeoPoint } from '../../types/domain'
import { MAX_ZOOM, MIN_ZOOM, TILE_SIZE, centreOf, tileMapProvider } from '../../lib/map'
import type { MapProvider } from '../../lib/map'
import { useI18n } from '../../i18n'

// ── Tracking map ──────────────────────────────────────────────────────
// Real streets, from Web Mercator raster tiles. Everything vendor-specific
// lives in the MapProvider, so swapping in Google Maps or Mapbox is a
// config change (VITE_MAP_TILE_URL) rather than a rewrite. Positions are
// placed from the container centre with calc(), so the map needs no
// measurement pass and cannot land in the wrong place on first paint.

const STATUS_COLOR: Record<DriverLiveState['status'], string> = {
  on_delivery: 'bg-brand-600',
  at_pickup: 'bg-amber-500',
  available: 'bg-emerald-500',
  delayed: 'bg-red-600',
  offline: 'bg-ink-400',
}

// Enough tiles to cover the largest panel the map is used in
const COLS = 5
const ROWS = 4

export function TrackingMap({
  states, orders, selectedId, onSelect, city, provider = tileMapProvider, className = '',
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
  const [zoomChoice, setZoomChoice] = useState<number | null>(null)

  const visible = useMemo(
    () => states.filter((s) => s.shareLocation && s.city === city),
    [states, city],
  )

  const selected = visible.find((s) => s.driverId === selectedId)
  const selectedOrder = selected?.orderId
    ? orders.find((o) => o.id === selected.orderId)
    : undefined

  const base = provider.defaultView(city)
  const zoom = zoomChoice ?? base.zoom

  // Centre on the selected trip when there is one, otherwise on the drivers
  const centre: GeoPoint = useMemo(() => {
    if (selected && selectedOrder) {
      return centreOf([selected.point, selectedOrder.pickup, selectedOrder.dropoff]) ?? base.centre
    }
    return centreOf(visible.map((s) => s.point)) ?? base.centre
  }, [selected, selectedOrder, visible, base.centre])

  const centrePx = provider.toWorldPixels(centre, zoom)

  // Offset in pixels from the centre of the container
  const offset = (point: GeoPoint) => {
    const px = provider.toWorldPixels(point, zoom)
    return { dx: px.x - centrePx.x, dy: px.y - centrePx.y }
  }
  const at = (point: GeoPoint) => {
    const { dx, dy } = offset(point)
    return { left: `calc(50% + ${dx}px)`, top: `calc(50% + ${dy}px)` }
  }

  const tiles = useMemo(() => {
    const centreTileX = Math.floor(centrePx.x / TILE_SIZE)
    const centreTileY = Math.floor(centrePx.y / TILE_SIZE)
    const max = 2 ** zoom
    const out: { key: string; url: string; dx: number; dy: number }[] = []

    for (let i = -Math.floor(COLS / 2); i <= Math.floor(COLS / 2); i++) {
      for (let j = -Math.floor(ROWS / 2); j <= Math.floor(ROWS / 2); j++) {
        const tx = centreTileX + i
        const ty = centreTileY + j
        if (ty < 0 || ty >= max) continue
        const wrappedX = ((tx % max) + max) % max
        out.push({
          key: `${zoom}/${tx}/${ty}`,
          url: provider.tileUrl(zoom, wrappedX, ty),
          dx: tx * TILE_SIZE - centrePx.x,
          dy: ty * TILE_SIZE - centrePx.y,
        })
      }
    }
    return out
  }, [centrePx.x, centrePx.y, zoom, provider])

  return (
    <div className={`relative overflow-hidden rounded-xl border border-ink-200 bg-ink-100 ${className}`}>
      {/* Tile layer. Dark mode darkens the imagery so markers stay readable */}
      <div
        aria-hidden
        className="absolute inset-0 dark:opacity-80 dark:[filter:invert(1)_hue-rotate(180deg)_brightness(0.95)_contrast(0.9)]"
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            width={TILE_SIZE}
            height={TILE_SIZE}
            className="absolute max-w-none select-none"
            style={{
              left: `calc(50% + ${tile.dx}px)`,
              top: `calc(50% + ${tile.dy}px)`,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        ))}
      </div>

      {/* The selected trip: branch, customer, and the line between them */}
      {selected && selectedOrder && (
        <>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <line
              x1={`calc(50% + ${offset(selectedOrder.pickup).dx}px)`}
              y1={`calc(50% + ${offset(selectedOrder.pickup).dy}px)`}
              x2={`calc(50% + ${offset(selected.point).dx}px)`}
              y2={`calc(50% + ${offset(selected.point).dy}px)`}
              className="stroke-ink-700"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.55"
            />
            <line
              x1={`calc(50% + ${offset(selected.point).dx}px)`}
              y1={`calc(50% + ${offset(selected.point).dy}px)`}
              x2={`calc(50% + ${offset(selectedOrder.dropoff).dx}px)`}
              y2={`calc(50% + ${offset(selectedOrder.dropoff).dy}px)`}
              className="stroke-brand-600"
              strokeWidth="3"
              strokeDasharray="6 5"
              strokeLinecap="round"
            />
          </svg>
          <Pin style={at(selectedOrder.pickup)} label={t('track.pickup')} tone="ink" />
          <Pin style={at(selectedOrder.dropoff)} label={t('track.dropoff')} tone="brand" />
        </>
      )}

      {visible.map((state) => {
        const isSelected = state.driverId === selectedId
        const live = state.status === 'on_delivery' || state.status === 'at_pickup'
        return (
          <button
            key={state.driverId}
            onClick={() => onSelect(state.driverId)}
            aria-label={`${state.driverId} — ${t(`workStatus.${state.status}` as Parameters<typeof t>[0])}`}
            aria-pressed={isSelected}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            style={at(state.point)}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              {live && (
                <span
                  aria-hidden
                  className={`absolute inline-flex h-5 w-5 animate-pulse-dot rounded-full opacity-40 ${
                    state.status === 'on_delivery' ? 'bg-brand-500' : 'bg-amber-500'
                  }`}
                />
              )}
              <span
                aria-hidden
                className={`relative block rounded-full ring-2 transition-all ${STATUS_COLOR[state.status]} ${
                  isSelected ? 'h-4 w-4 ring-ink-950' : 'h-3 w-3 ring-white'
                }`}
              />
            </span>
          </button>
        )
      })}

      {/* Zoom */}
      <div className="absolute end-2 top-2 z-20 flex flex-col overflow-hidden rounded-lg border border-ink-200 bg-surface shadow-card">
        <button
          onClick={() => setZoomChoice(Math.min(MAX_ZOOM, zoom + 1))}
          disabled={zoom >= MAX_ZOOM}
          aria-label={t('track.zoomIn')}
          className="cursor-pointer p-1.5 text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
        <button
          onClick={() => setZoomChoice(Math.max(MIN_ZOOM, zoom - 1))}
          disabled={zoom <= MIN_ZOOM}
          aria-label={t('track.zoomOut')}
          className="cursor-pointer border-t border-ink-200 p-1.5 text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <a
        href={provider.attributionHref}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-0 end-0 z-20 bg-surface/85 px-1.5 py-0.5 text-[10px] text-ink-500 hover:text-ink-800"
        dir="ltr"
      >
        {provider.attribution}
      </a>

      {visible.length === 0 && (
        <p className="absolute inset-0 z-20 flex items-center justify-center bg-surface/70 px-6 text-center text-sm text-ink-600">
          {t('track.noDriversHere')}
        </p>
      )}
    </div>
  )
}

function Pin({
  style, label, tone,
}: { style: { left: string; top: string }; label: string; tone: 'ink' | 'brand' }) {
  return (
    <span
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
      style={style}
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
