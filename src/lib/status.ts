import type {
  ApplicationStatus, DeliveryOrderStatus, DriverStatus, DriverWorkStatus,
  EmployeeStatus, IntegrationStatus, InvoiceStatus, PaymentStatus,
  PayoutStatus, WorkforceRequestStatus,
} from '../types/domain'
import type { TranslationKey } from '../i18n'

// Badge tone → Tailwind classes. Tones carry semantic meaning and are
// always paired with a text label (never color alone).
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand' | 'violet'

// Background and text follow the theme through CSS variables; only the
// ring needs a dark variant, because the -200 shades stay fixed.
export const toneClasses: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200 dark:ring-sky-500/25',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:ring-emerald-500/25',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200 dark:ring-amber-500/25',
  danger: 'bg-red-50 text-red-700 ring-red-200 dark:ring-red-500/25',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200 dark:ring-brand-500/25',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:ring-violet-500/25',
}

// ── Hiring pipeline ───────────────────────────────────────────────────
export const PIPELINE_STAGES: ApplicationStatus[] = [
  'new', 'under_review', 'contacted', 'interview', 'accepted', 'hired',
]

export const ALL_APPLICATION_STATUSES: ApplicationStatus[] = [
  ...PIPELINE_STAGES, 'rejected', 'withdrawn',
]

export const applicationTone: Record<ApplicationStatus, Tone> = {
  new: 'brand',
  under_review: 'info',
  contacted: 'info',
  interview: 'violet',
  accepted: 'success',
  hired: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
}

export const applicationKey = (s: ApplicationStatus): TranslationKey =>
  `appStatus.${s}` as TranslationKey

export const nextStage = (s: ApplicationStatus): ApplicationStatus | null => {
  const i = PIPELINE_STAGES.indexOf(s)
  if (i === -1 || i === PIPELINE_STAGES.length - 1) return null
  return PIPELINE_STAGES[i + 1]
}

// ── Workforce requests ────────────────────────────────────────────────
export const requestTone: Record<WorkforceRequestStatus, Tone> = {
  draft: 'neutral',
  open: 'success',
  reviewing: 'info',
  partially_filled: 'warning',
  filled: 'brand',
  closed: 'neutral',
  cancelled: 'danger',
}

export const requestKey = (s: WorkforceRequestStatus): TranslationKey =>
  `reqStatus.${s}` as TranslationKey

export const OPEN_REQUEST_STATUSES: WorkforceRequestStatus[] = [
  'open', 'reviewing', 'partially_filled',
]

// ── Drivers ───────────────────────────────────────────────────────────
export const driverTone: Record<DriverStatus, Tone> = {
  available: 'success',
  hired: 'brand',
  under_review: 'warning',
  suspended: 'neutral',
}

export const driverKey = (s: DriverStatus): TranslationKey =>
  `driverStatus.${s}` as TranslationKey

// ── Finance ───────────────────────────────────────────────────────────
export const paymentTone: Record<PaymentStatus, Tone> = {
  paid: 'success',
  pending: 'warning',
  partially_paid: 'info',
  overdue: 'danger',
}

export const paymentKey = (s: PaymentStatus): TranslationKey =>
  `payStatus.${s}` as TranslationKey

export const payoutTone: Record<PayoutStatus, Tone> = {
  paid: 'success',
  pending: 'warning',
  processing: 'info',
}

export const payoutKey = (s: PayoutStatus): TranslationKey =>
  `payoutStatus.${s}` as TranslationKey

export const invoiceTone: Record<InvoiceStatus, Tone> = {
  paid: 'success',
  due: 'warning',
  overdue: 'danger',
}

export const invoiceKey = (s: InvoiceStatus): TranslationKey =>
  `invStatus.${s}` as TranslationKey

// Chart palette — consistent across every analytics surface. Grid and axis
// read from the theme variables so charts stay legible in dark mode.
export const chartColors = {
  revenue: '#d6242e',
  salary: '#0e7490',
  hires: '#4f46e5',
  payments: '#b45309',
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
}

// ── Operations statuses ───────────────────────────────────────────────
export const workStatusTone: Record<DriverWorkStatus, Tone> = {
  available: 'success',
  on_delivery: 'brand',
  at_pickup: 'warning',
  delayed: 'danger',
  offline: 'neutral',
}

export const orderStatusTone: Record<DeliveryOrderStatus, Tone> = {
  new: 'info',
  assigned: 'violet',
  picked_up: 'warning',
  delivering: 'brand',
  delivered: 'success',
  failed: 'danger',
  cancelled: 'neutral',
}

export const integrationStatusTone: Record<IntegrationStatus, Tone> = {
  connected: 'success',
  syncing: 'info',
  error: 'danger',
  disconnected: 'neutral',
  not_connected: 'neutral',
}

export const employeeStatusTone: Record<EmployeeStatus, Tone> = {
  active: 'success',
  disabled: 'neutral',
}

// Stages a delivery moves through, in order
export const ORDER_FLOW: DeliveryOrderStatus[] = [
  'new', 'assigned', 'picked_up', 'delivering', 'delivered',
]
