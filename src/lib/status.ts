import type {
  DriverAccountStatus,
  InvoiceStatus,
  OrderStatus,
  VehicleType,
} from '../types/domain'
import type { TranslationKey } from '../i18n'

// Badge tone → Tailwind classes. Tones carry semantic meaning and are
// paired with text labels everywhere (never color alone).
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand' | 'violet'

export const toneClasses: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
}

export const orderStatusTone: Record<OrderStatus, Tone> = {
  new: 'brand',
  assigned: 'info',
  en_route_pickup: 'info',
  picked_up: 'violet',
  en_route_customer: 'violet',
  delivered: 'success',
  closed: 'neutral',
  failed: 'danger',
  cancelled: 'danger',
  address_problem: 'warning',
  customer_unavailable: 'warning',
}

export const orderStatusKey = (s: OrderStatus): TranslationKey =>
  `status.${s}` as TranslationKey

export const driverStatusTone: Record<DriverAccountStatus, Tone> = {
  pending_review: 'warning',
  approved: 'success',
  rejected: 'danger',
  suspended: 'neutral',
}

export const invoiceStatusTone: Record<InvoiceStatus, Tone> = {
  paid: 'success',
  due: 'warning',
  overdue: 'danger',
}

export const PROBLEM_STATUSES: OrderStatus[] = [
  'failed',
  'cancelled',
  'address_problem',
  'customer_unavailable',
]

export const ACTIVE_STATUSES: OrderStatus[] = [
  'new',
  'assigned',
  'en_route_pickup',
  'picked_up',
  'en_route_customer',
]

export const LIFECYCLE: OrderStatus[] = [
  'new',
  'assigned',
  'en_route_pickup',
  'picked_up',
  'en_route_customer',
  'delivered',
  'closed',
]

export const nextStatus = (s: OrderStatus): OrderStatus | null => {
  const idx = LIFECYCLE.indexOf(s)
  if (idx === -1 || idx === LIFECYCLE.length - 1) return null
  return LIFECYCLE[idx + 1]
}

export const vehicleKey = (v: VehicleType): TranslationKey => `vehicle.${v}` as TranslationKey

// Chart palette — colorblind-aware, consistent across the app
export const chartColors = {
  revenue: '#d6242e',
  commission: '#0e7490',
  orders: '#4f46e5',
  payouts: '#b45309',
  grid: '#e5e9f0',
  axis: '#8593ab',
}
