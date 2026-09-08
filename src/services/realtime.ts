// ── Realtime abstraction ──────────────────────────────────────────────
// The UI subscribes to channels, never to a transport. Today a local
// ticker emits driver movement so the operations map behaves like a live
// feed; tomorrow the same interface is satisfied by Supabase Realtime,
// a WebSocket, or server-sent events, with no component changes.

export type RealtimeChannel =
  | 'driver.location'
  | 'order.status'
  | 'integration.event'
  | 'application.status'

export interface RealtimeEvent<T = unknown> {
  channel: RealtimeChannel
  at: string
  payload: T
}

export type RealtimeHandler<T = unknown> = (event: RealtimeEvent<T>) => void

export interface RealtimeClient {
  id: string
  subscribe<T>(channel: RealtimeChannel, handler: RealtimeHandler<T>): () => void
  publish<T>(channel: RealtimeChannel, payload: T): void
}

function createLocalClient(): RealtimeClient {
  const handlers = new Map<RealtimeChannel, Set<RealtimeHandler<never>>>()

  return {
    id: 'local-ticker',

    subscribe(channel, handler) {
      const set = handlers.get(channel) ?? new Set()
      set.add(handler as RealtimeHandler<never>)
      handlers.set(channel, set)
      return () => {
        set.delete(handler as RealtimeHandler<never>)
      }
    },

    publish(channel, payload) {
      const set = handlers.get(channel)
      if (!set) return
      const event = { channel, at: new Date().toISOString(), payload }
      set.forEach((handler) => (handler as RealtimeHandler<typeof payload>)(event))
    },
  }
}

export const realtime: RealtimeClient = createLocalClient()
