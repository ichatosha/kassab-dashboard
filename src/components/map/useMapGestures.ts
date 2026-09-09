import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject, WheelEvent as ReactWheelEvent } from 'react'
import { MAX_LATITUDE, MAX_ZOOM, MIN_ZOOM } from '../../lib/map'
import type { MapProvider } from '../../lib/map'
import type { GeoPoint } from '../../types/domain'

// ── Map gestures ──────────────────────────────────────────────────────
// Drag to move, wheel or pinch to zoom, double-click to zoom in. The map
// follows the drivers on its own until someone takes hold of it; from
// that moment the view is theirs and stops being recentred underneath
// them, until they hand it back with reset().

export interface MapView {
  centre: GeoPoint
  zoom: number
}

/** Pixels of movement below which a press is a click, not a drag. */
const DRAG_SLOP = 4

/** Where a pointer sits relative to the centre of the map it fired on. */
function centreOffset(element: HTMLElement, clientX: number, clientY: number) {
  const box = element.getBoundingClientRect()
  return {
    x: clientX - box.left - box.width / 2,
    y: clientY - box.top - box.height / 2,
  }
}

const clampLat = (lat: number) => Math.min(MAX_LATITUDE, Math.max(-MAX_LATITUDE, lat))
const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))

export function useMapGestures({
  frame, provider, autoCentre, autoZoom,
}: {
  frame: RefObject<HTMLDivElement | null>
  provider: MapProvider
  /** Where the map looks when nobody has taken hold of it */
  autoCentre: GeoPoint
  autoZoom: number
}) {
  const [manual, setManual] = useState<MapView | null>(null)
  const [dragging, setDragging] = useState(false)

  const view = manual ?? { centre: autoCentre, zoom: autoZoom }

  // Gesture bookkeeping, none of which belongs in render
  const moved = useRef(false)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchDistance = useRef<number | null>(null)
  const last = useRef<{ x: number; y: number } | null>(null)

  // Every move is expressed against whatever the view was, so the
  // handlers never need to read a mutable copy of it during render.
  const from = useCallback(
    (previous: MapView | null): MapView => previous ?? { centre: autoCentre, zoom: autoZoom },
    [autoCentre, autoZoom],
  )

  const panBy = useCallback((dxPixels: number, dyPixels: number) => {
    setManual((previous) => {
      const { centre, zoom } = from(previous)
      const px = provider.toWorldPixels(centre, zoom)
      const next = provider.toGeoPoint({ x: px.x - dxPixels, y: px.y - dyPixels }, zoom)
      return { centre: { lat: clampLat(next.lat), lng: next.lng }, zoom }
    })
  }, [provider, from])

  /** Zoom keeping whatever is under the pointer where it is. Without the
   *  anchor, zooming with the wheel walks the map away from the cursor.
   *  The anchor is given as an offset from the centre of the map. */
  const zoomAt = useCallback((delta: number, offsetX?: number, offsetY?: number) => {
    setManual((previous) => {
      const { centre, zoom } = from(previous)
      const next = clampZoom(zoom + delta)
      if (next === zoom) return previous
      if (offsetX === undefined || offsetY === undefined) {
        return { centre, zoom: next }
      }

      const before = provider.toWorldPixels(centre, zoom)
      const anchor = provider.toGeoPoint(
        { x: before.x + offsetX, y: before.y + offsetY }, zoom,
      )
      const anchorPx = provider.toWorldPixels(anchor, next)
      const centred = provider.toGeoPoint(
        { x: anchorPx.x - offsetX, y: anchorPx.y - offsetY }, next,
      )
      return { centre: { lat: clampLat(centred.lat), lng: centred.lng }, zoom: next }
    })
  }, [provider, from])

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    // A press on a control belongs to that control. Capturing the pointer
    // on the container would redirect the rest of the gesture away from
    // the button and swallow its click.
    if ((event.target as HTMLElement).closest('button, a')) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 1) {
      moved.current = false
      last.current = { x: event.clientX, y: event.clientY }
      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinchDistance.current = Math.hypot(a.x - b.x, a.y - b.y)
    }
  }, [])

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    // Two fingers: pinch. A quarter either way is one zoom level, which
    // keeps zoom whole so the tiles stay crisp.
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const start = pinchDistance.current
      if (start) {
        const ratio = distance / start
        if (ratio > 1.25 || ratio < 0.8) {
          moved.current = true
          const mid = centreOffset(event.currentTarget, (a.x + b.x) / 2, (a.y + b.y) / 2)
          zoomAt(ratio > 1 ? 1 : -1, mid.x, mid.y)
          pinchDistance.current = distance
        }
      }
      return
    }

    const previous = last.current
    if (!previous) return
    const dx = event.clientX - previous.x
    const dy = event.clientY - previous.y
    if (!moved.current && Math.hypot(dx, dy) < DRAG_SLOP) return
    moved.current = true
    last.current = { x: event.clientX, y: event.clientY }
    panBy(dx, dy)
  }, [panBy, zoomAt])

  const endPointer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinchDistance.current = null
    if (pointers.current.size === 0) {
      last.current = null
      setDragging(false)
    }
  }, [])

  const onWheel = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    if (event.deltaY === 0) return
    const at = centreOffset(event.currentTarget, event.clientX, event.clientY)
    zoomAt(event.deltaY < 0 ? 1 : -1, at.x, at.y)
  }, [zoomAt])

  const onDoubleClick = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return
    const at = centreOffset(event.currentTarget, event.clientX, event.clientY)
    zoomAt(1, at.x, at.y)
  }, [zoomAt])

  // The browser scrolls the page on wheel unless a non-passive listener
  // says otherwise, and React's onWheel is registered passive.
  useEffect(() => {
    const element = frame.current
    if (!element) return
    const block = (event: Event) => event.preventDefault()
    element.addEventListener('wheel', block, { passive: false })
    return () => element.removeEventListener('wheel', block)
  }, [frame])

  const consumedDrag = useCallback(() => moved.current, [])
  const reset = useCallback(() => setManual(null), [])
  const zoomBy = useCallback((delta: number) => zoomAt(delta), [zoomAt])

  return {
    view,
    /** True once the reader has moved the map themselves */
    moved: manual !== null,
    dragging,
    /** A press that became a drag should not also count as a click */
    consumedDrag,
    reset,
    zoomBy,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onPointerLeave: endPointer,
      onWheel,
      onDoubleClick,
    },
  }
}
