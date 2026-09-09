import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppState } from '../store/AppState'

// ── Real device GPS ───────────────────────────────────────────────────
// The driver's own phone is the only honest source of where the driver
// is. This wraps the browser's Geolocation API: the position it reports
// goes straight into the live state and overrides the simulated feed for
// that driver. Nothing is sent anywhere — the coordinates stay in this
// browser, which is also why only the driver's own screen can turn it on.

export type GpsStatus = 'idle' | 'requesting' | 'live' | 'denied' | 'unavailable' | 'error'

export function useDeviceLocation(driverId?: string) {
  const { dispatch } = useAppState()
  const [status, setStatus] = useState<GpsStatus>('idle')
  const [accuracyM, setAccuracyM] = useState<number | null>(null)
  const watchId = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    setStatus('idle')
    setAccuracyM(null)
  }, [])

  const start = useCallback(() => {
    if (!driverId) return
    // Geolocation needs a secure context; the API is simply absent otherwise
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    setStatus('requesting')
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setStatus('live')
        setAccuracyM(Math.round(position.coords.accuracy))
        dispatch({
          type: 'reportDriverPosition',
          driverId,
          point: { lat: position.coords.latitude, lng: position.coords.longitude },
          accuracyM: Math.round(position.coords.accuracy),
        })
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error')
        watchId.current = null
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
  }, [driverId, dispatch])

  // Never leave a watch running behind a screen the driver has left
  useEffect(() => stop, [stop])

  return { status, accuracyM, start, stop, active: status === 'live' || status === 'requesting' }
}
