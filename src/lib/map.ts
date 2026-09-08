import type { GeoPoint } from '../types/domain'
import { cityCentre } from './geo'

// ── Map abstraction ───────────────────────────────────────────────────
// The UI never talks to a map vendor. It asks a MapProvider to turn
// coordinates into positions inside the view, so Google Maps, Mapbox or
// a tile server can replace this projection later without touching a
// single component.

export interface MapViewport {
  centre: GeoPoint
  /** Half-height of the view in degrees of latitude */
  spanLat: number
  /** Half-width of the view in degrees of longitude */
  spanLng: number
}

export interface MapProvider {
  id: string
  /** Coordinates to a 0..1 position inside the viewport */
  project(point: GeoPoint, viewport: MapViewport): { x: number; y: number }
  /** The reverse, for future drag-to-place interactions */
  unproject(pos: { x: number; y: number }, viewport: MapViewport): GeoPoint
  viewportFor(city: string, zoom?: number): MapViewport
}

// An equirectangular projection is accurate enough at city scale and needs
// no network, which is exactly what the demo requires.
export const localMapProvider: MapProvider = {
  id: 'kassab-local',

  project(point, viewport) {
    const x = (point.lng - (viewport.centre.lng - viewport.spanLng)) / (viewport.spanLng * 2)
    const y = ((viewport.centre.lat + viewport.spanLat) - point.lat) / (viewport.spanLat * 2)
    return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }
  },

  unproject(pos, viewport) {
    return {
      lng: viewport.centre.lng - viewport.spanLng + pos.x * viewport.spanLng * 2,
      lat: viewport.centre.lat + viewport.spanLat - pos.y * viewport.spanLat * 2,
    }
  },

  viewportFor(city, zoom = 1) {
    const centre = cityCentre(city)
    return { centre, spanLat: 0.045 / zoom, spanLng: 0.055 / zoom }
  },
}

/** Metres between two points — used for ETA and "distance to customer" */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** One step of a driver moving toward a destination, for the live demo feed */
export function stepToward(from: GeoPoint, to: GeoPoint, fraction: number): GeoPoint {
  return {
    lat: from.lat + (to.lat - from.lat) * fraction,
    lng: from.lng + (to.lng - from.lng) * fraction,
  }
}
