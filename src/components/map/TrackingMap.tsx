import { useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { DeliveryOrder, DriverLiveState, GeoPoint } from '../../types/domain'
import { MAX_ZOOM, MIN_ZOOM, TILE_SIZE, centreOf, tileMapProvider, zoomToFit } from '../../lib/map'
import type { MapProvider } from '../../lib/map'
import { splitAt } from '../../lib/route'
import type { RouteLeg } from '../../lib/route'
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
  states, orders, routes, selectedId, onSelect, city,
  provider = tileMapProvider, className = '',
}: {
  states: DriverLiveState[]
  orders: DeliveryOrder[]
  /** Road geometry per delivery id, so a trip follows real streets */
  routes?: Record<string, RouteLeg>
  selectedId?: string
  onSelect: (driverId: string) => void
  city: string
  provider?: MapProvider
  className?: string
}) {
  const { t } = useI18n()
  const [zoomChoice, setZoomChoice] = useState<number | null>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Measured once and on resize, and used for one thing only: picking a
  // zoom that fits the trip. Marker placement still needs no measurement.
  useEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const visible = useMemo(
    () => states.filter((s) => s.shareLocation && s.city === city),
    [states, city],
  )

  const selected = visible.find((s) => s.driverId === selectedId)
  const selectedOrder = selected?.orderId
    ? orders.find((o) => o.id === selected.orderId)
    : undefined

  const base = provider.defaultView(city)

  // Centre on the selected trip when there is one, otherwise on the drivers
  const leg = selectedOrder ? routes?.[selectedOrder.id] : undefined

  // Frame the selected trip; fall back to the city view with none selected
  const fitted = useMemo(() => {
    if (!selected || !selectedOrder) return base.zoom
    const span = leg?.points.length
      ? [selected.point, ...leg.points]
      : [selected.point, selectedOrder.pickup, selectedOrder.dropoff]
    return zoomToFit(span, size.width, size.height, provider)
  }, [selected, selectedOrder, leg, size.width, size.height, provider, base.zoom])

  const zoom = zoomChoice ?? fitted

  const centre: GeoPoint = useMemo(() => {
    if (selected && selectedOrder) {
      // Frame the whole road, so a long trip is not half off-screen
      const span = leg?.points.length
        ? [selected.point, ...leg.points]
        : [selected.point, selectedOrder.pickup, selectedOrder.dropoff]
      return centreOf(span) ?? base.centre
    }
    return centreOf(visible.map((s) => s.point)) ?? base.centre
  }, [selected, selectedOrder, leg, visible, base.centre])

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

  // The road, split at the driver: behind them, and still to come
  const road = useMemo(() => {
    if (!selected || !selectedOrder) return { travelled: [], remaining: [] }
    const points = leg?.points?.length
      ? leg.points
      : [selectedOrder.pickup, selectedOrder.dropoff]
    return splitAt(points, selected.routeIndex ?? 0, selected.point)
  }, [selected, selectedOrder, leg])

  const fullRoad = [...road.travelled, ...road.remaining.slice(1)]

  // Pixel path, measured from the centre of the container
  const polyline = (points: GeoPoint[]) =>
    points.map((point) => {
      const { dx, dy } = offset(point)
      return `${dx},${dy}`
    }).join(' ')

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
    <div
      ref={frame}
      className={`relative overflow-hidden rounded-xl border border-ink-200 bg-ink-100 ${className}`}
    >
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

      {/* The selected trip, drawn along the streets the driver is using:
          solid for the road already covered, dashed for what is left. */}
      {selected && selectedOrder && (
        <>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {/* Coordinates are measured from the centre of the map, the
                same origin the markers use, so nothing needs measuring */}
            <g style={{ transform: 'translate(50%, 50%)', transformBox: 'view-box' }}>
              {/* A casing under the road keeps it readable over any tile */}
              <polyline
                points={polyline(fullRoad)}
                fill="none"
                className="stroke-white dark:stroke-night-950"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
              />
              <polyline
                points={polyline(road.travelled)}
                fill="none"
                className="stroke-ink-700"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
              <polyline
                points={polyline(road.remaining)}
                fill="none"
                className="stroke-brand-600"
                strokeWidth="4"
                strokeDasharray="7 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
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

      {/* Say so when no router answered, rather than passing a straight
          line off as the road the driver is taking */}
      {selected && selectedOrder && leg?.approximate && (
        <p className="absolute bottom-0 start-0 z-20 max-w-[60%] bg-surface/85 px-1.5 py-0.5 text-[10px] leading-tight text-ink-500">
          {t('track.roadApprox')}
        </p>
      )}

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
