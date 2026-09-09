import type { GeoPoint } from '../types/domain'
import { distanceKm } from './map'

// ── Road routing ──────────────────────────────────────────────────────
// A driver does not travel in a straight line, so the map must not draw
// one. A RouteProvider turns two coordinates into the actual road
// geometry between them, and the live feed walks the driver along it.
//
// The default provider speaks OSRM, which needs no key. Google Directions
// and Mapbox Directions return the same thing in a different envelope:
// set VITE_ROUTE_PROVIDER=google plus VITE_ROUTE_KEY and the Google
// implementation below takes over, with no change anywhere else.

export interface RouteLeg {
  /** Road geometry from origin to destination, origin first */
  points: GeoPoint[]
  distanceKm: number
  /** True when no router answered and this is the straight line */
  approximate: boolean
}

export interface RouteProvider {
  id: string
  route(from: GeoPoint, to: GeoPoint): Promise<RouteLeg>
}

const straightLine = (from: GeoPoint, to: GeoPoint): RouteLeg => ({
  points: [from, to],
  distanceKm: distanceKm(from, to),
  approximate: true,
})

// ── OSRM (default: public, keyless) ──────────────────────────────────
const OSRM_BASE =
  import.meta.env.VITE_ROUTE_URL ?? 'https://router.project-osrm.org/route/v1/driving'

const osrmProvider: RouteProvider = {
  id: 'osrm',
  async route(from, to) {
    const path = `${from.lng},${from.lat};${to.lng},${to.lat}`
    const url = `${OSRM_BASE}/${path}?overview=full&geometries=geojson`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`route ${response.status}`)
    const data = await response.json()
    const leg = data?.routes?.[0]
    const coordinates: [number, number][] = leg?.geometry?.coordinates ?? []
    if (coordinates.length < 2) throw new Error('empty route')
    return {
      points: coordinates.map(([lng, lat]) => ({ lat, lng })),
      distanceKm: (leg.distance ?? 0) / 1000,
      approximate: false,
    }
  },
}

// ── Google Directions (opt-in) ───────────────────────────────────────
// Google returns the geometry as an encoded polyline rather than GeoJSON;
// decoding it is a dozen lines, which is cheaper than pulling in a client
// library for one call.
function decodePolyline(encoded: string): GeoPoint[] {
  const points: GeoPoint[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    for (const axis of ['lat', 'lng'] as const) {
      let result = 0
      let shift = 0
      let byte: number
      do {
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)
      const delta = result & 1 ? ~(result >> 1) : result >> 1
      if (axis === 'lat') lat += delta
      else lng += delta
    }
    points.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }
  return points
}

const googleProvider: RouteProvider = {
  id: 'google',
  async route(from, to) {
    const key = import.meta.env.VITE_ROUTE_KEY
    if (!key) throw new Error('no key')
    const url =
      'https://maps.googleapis.com/maps/api/directions/json'
      + `?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}`
      + `&mode=driving&key=${key}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`route ${response.status}`)
    const data = await response.json()
    const leg = data?.routes?.[0]
    const encoded = leg?.overview_polyline?.points
    if (!encoded) throw new Error('empty route')
    const metres = (leg.legs ?? []).reduce(
      (sum: number, l: { distance?: { value?: number } }) => sum + (l.distance?.value ?? 0), 0,
    )
    return { points: decodePolyline(encoded), distanceKm: metres / 1000, approximate: false }
  },
}

export const routeProvider: RouteProvider =
  import.meta.env.VITE_ROUTE_PROVIDER === 'google' ? googleProvider : osrmProvider

// One request per pair, kept for the session. Routes between two fixed
// points do not change while someone watches a delivery.
const cache = new Map<string, Promise<RouteLeg>>()

const key = (from: GeoPoint, to: GeoPoint) =>
  `${from.lat.toFixed(5)},${from.lng.toFixed(5)}>${to.lat.toFixed(5)},${to.lng.toFixed(5)}`

/** Road geometry between two points. Falls back to the straight line
 *  rather than failing, so the map always draws something. */
export function fetchRoute(from: GeoPoint, to: GeoPoint): Promise<RouteLeg> {
  const id = key(from, to)
  const hit = cache.get(id)
  if (hit) return hit
  const pending = routeProvider
    .route(from, to)
    .catch(() => straightLine(from, to))
  cache.set(id, pending)
  return pending
}

// ── Walking the route ────────────────────────────────────────────────

/** Total length of a set of road points. */
export function pathLengthKm(points: GeoPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += distanceKm(points[i - 1], points[i])
  return total
}

export interface RoutePosition {
  point: GeoPoint
  /** Index of the road point just behind the driver */
  index: number
  /** Road distance still to cover */
  remainingKm: number
}

/** Move a driver `km` further along the road, never past the end. This is
 *  what makes the marker follow streets instead of cutting across them. */
export function advanceAlong(points: GeoPoint[], index: number, from: GeoPoint, km: number): RoutePosition {
  if (points.length < 2) {
    return { point: from, index: 0, remainingKm: 0 }
  }

  let i = Math.min(Math.max(index, 0), points.length - 2)
  let current = from
  let budget = km

  while (budget > 0 && i < points.length - 1) {
    const next = points[i + 1]
    const gap = distanceKm(current, next)
    if (gap > budget) {
      const ratio = budget / gap
      current = {
        lat: current.lat + (next.lat - current.lat) * ratio,
        lng: current.lng + (next.lng - current.lng) * ratio,
      }
      budget = 0
    } else {
      current = next
      budget -= gap
      i += 1
    }
  }

  let remaining = 0
  for (let j = i; j < points.length - 1; j++) {
    remaining += distanceKm(j === i ? current : points[j], points[j + 1])
  }

  return { point: current, index: i, remainingKm: remaining }
}

/** Nearest point on the road to a loose coordinate. A position that came
 *  from a straight-line estimate sits between streets; snapping it puts
 *  the marker on the road the driver is actually using. */
export function snapToPath(points: GeoPoint[], point: GeoPoint): RoutePosition {
  if (points.length < 2) return { point, index: 0, remainingKm: 0 }

  let best = { point: points[0], index: 0, gap: Infinity }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const dLat = b.lat - a.lat
    const dLng = b.lng - a.lng
    const lengthSq = dLat * dLat + dLng * dLng
    // Where along this segment the perpendicular from the point lands
    const ratio = lengthSq === 0
      ? 0
      : Math.min(1, Math.max(0, ((point.lat - a.lat) * dLat + (point.lng - a.lng) * dLng) / lengthSq))
    const candidate = { lat: a.lat + dLat * ratio, lng: a.lng + dLng * ratio }
    const gap = distanceKm(point, candidate)
    if (gap < best.gap) best = { point: candidate, index: i, gap }
  }

  let remaining = 0
  for (let j = best.index; j < points.length - 1; j++) {
    remaining += distanceKm(j === best.index ? best.point : points[j], points[j + 1])
  }
  return { point: best.point, index: best.index, remainingKm: remaining }
}

/** Split a road at the driver, so the map can show what is behind them
 *  differently from what is still ahead. */
export function splitAt(points: GeoPoint[], index: number, at: GeoPoint) {
  const safe = Math.min(Math.max(index, 0), Math.max(0, points.length - 1))
  return {
    travelled: [...points.slice(0, safe + 1), at],
    remaining: [at, ...points.slice(safe + 1)],
  }
}
