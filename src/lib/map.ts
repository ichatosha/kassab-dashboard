import type { GeoPoint } from '../types/domain'
import { cityCentre } from './geo'

// ── Map abstraction ───────────────────────────────────────────────────
// The UI never talks to a map vendor. It asks a MapProvider for tiles and
// for the pixel position of a coordinate, so Google Maps or Mapbox can
// replace this without touching a component. The default provider serves
// standard Web Mercator raster tiles, which is what every vendor speaks.

export const TILE_SIZE = 256

export interface MapView {
  centre: GeoPoint
  zoom: number
}

export interface MapProvider {
  id: string
  /** Attribution the provider requires to be shown */
  attribution: string
  attributionHref: string
  /** Tile image for a slot in the Web Mercator grid */
  tileUrl(zoom: number, x: number, y: number): string
  /** Coordinate to absolute pixel position at this zoom */
  toWorldPixels(point: GeoPoint, zoom: number): { x: number; y: number }
  defaultView(city: string): MapView
}

// The tile server is configurable: point VITE_MAP_TILE_URL at a paid
// provider (or a Google/Mapbox raster endpoint) for production traffic.
const TILE_TEMPLATE =
  import.meta.env.VITE_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION ?? '© OpenStreetMap contributors'
const ATTRIBUTION_HREF =
  import.meta.env.VITE_MAP_ATTRIBUTION_HREF ?? 'https://www.openstreetmap.org/copyright'

export const tileMapProvider: MapProvider = {
  id: 'raster-tiles',
  attribution: ATTRIBUTION,
  attributionHref: ATTRIBUTION_HREF,

  tileUrl(zoom, x, y) {
    return TILE_TEMPLATE
      .replace('{z}', String(zoom))
      .replace('{x}', String(x))
      .replace('{y}', String(y))
  },

  // Standard Web Mercator — the same maths every tile provider uses, so
  // markers line up whichever tile server is configured.
  toWorldPixels(point, zoom) {
    const scale = TILE_SIZE * 2 ** zoom
    const x = ((point.lng + 180) / 360) * scale
    const latRad = (point.lat * Math.PI) / 180
    const y =
      (0.5 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / (2 * Math.PI)) * scale
    return { x, y }
  },

  defaultView(city) {
    return { centre: cityCentre(city), zoom: 13 }
  },
}

export const MIN_ZOOM = 11
export const MAX_ZOOM = 17

/** The closest zoom at which every point still fits the viewport. A trip
 *  the reader cannot see is not tracking, so the map frames the road
 *  rather than sitting at a fixed city zoom. */
export function zoomToFit(
  points: GeoPoint[],
  width: number,
  height: number,
  provider: MapProvider,
  padding = 56,
): number {
  if (points.length < 2 || width <= 0 || height <= 0) return 13
  const usableW = Math.max(32, width - padding * 2)
  const usableH = Math.max(32, height - padding * 2)

  for (let zoom = MAX_ZOOM; zoom > MIN_ZOOM; zoom--) {
    let minX = Infinity; let maxX = -Infinity
    let minY = Infinity; let maxY = -Infinity
    for (const point of points) {
      const { x, y } = provider.toWorldPixels(point, zoom)
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    if (maxX - minX <= usableW && maxY - minY <= usableH) return zoom
  }
  return MIN_ZOOM
}

/** Kilometres between two points — used for ETA and distance to customer */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** One step of a driver moving toward a destination, for the live feed */
export function stepToward(from: GeoPoint, to: GeoPoint, fraction: number): GeoPoint {
  return {
    lat: from.lat + (to.lat - from.lat) * fraction,
    lng: from.lng + (to.lng - from.lng) * fraction,
  }
}

/** Centre of a set of points, so a whole trip fits in view */
export function centreOf(points: GeoPoint[]): GeoPoint | null {
  if (points.length === 0) return null
  return {
    lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
    lng: points.reduce((s, p) => s + p.lng, 0) / points.length,
  }
}
