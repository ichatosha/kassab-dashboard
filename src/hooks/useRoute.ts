import { useEffect } from 'react'
import { useAppState } from '../store/AppState'
import { fetchRoute } from '../lib/route'
import type { RouteLeg } from '../lib/route'
import type { DeliveryOrder } from '../types/domain'

// ── Road geometry for a delivery ──────────────────────────────────────
// Asks the router once per delivery and parks the answer in the store, so
// the map draws the real streets and the live feed has something to walk
// the driver along. Failures fall back to the straight line inside
// fetchRoute, so a caller never has to handle "no route".
export function useOrderRoute(order?: DeliveryOrder): RouteLeg | undefined {
  const { routes, dispatch } = useAppState()

  useEffect(() => {
    if (!order || routes[order.id]) return
    let live = true
    fetchRoute(order.pickup, order.dropoff).then((leg) => {
      if (live) dispatch({ type: 'setOrderRoute', orderId: order.id, leg })
    })
    return () => { live = false }
  }, [order, routes, dispatch])

  return order ? routes[order.id] : undefined
}

/** The same, for every delivery currently on screen. */
export function useOrderRoutes(orders: DeliveryOrder[]) {
  const { routes, dispatch } = useAppState()

  useEffect(() => {
    let live = true
    orders.forEach((order) => {
      if (routes[order.id]) return
      fetchRoute(order.pickup, order.dropoff).then((leg) => {
        if (live) dispatch({ type: 'setOrderRoute', orderId: order.id, leg })
      })
    })
    return () => { live = false }
  }, [orders, routes, dispatch])

  return routes
}
