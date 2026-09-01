import type { ReactNode } from 'react'
import { Bike, Car, Star, Truck } from 'lucide-react'
import type { VehicleType } from '../../types/domain'
import { useI18n } from '../../i18n'
import { vehicleKey } from '../../lib/status'
import { formatNumber } from '../../lib/format'
import { Button } from './Button'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-ink-950">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-14 w-14 text-lg' }
  // Deterministic hue from the name keeps avatars stable across renders
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 11) % 360
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ backgroundColor: `hsl(${hue} 45% 45%)` }}
    >
      {initials}
    </span>
  )
}

const vehicleIcons: Record<VehicleType, ReactNode> = {
  motorcycle: <Bike className="h-3.5 w-3.5" aria-hidden />,
  car: <Car className="h-3.5 w-3.5" aria-hidden />,
  tricycle: <Truck className="h-3.5 w-3.5" aria-hidden />,
}

export function VehicleBadge({ type }: { type: VehicleType }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
      {vehicleIcons[type]}
      {t(vehicleKey(type))}
    </span>
  )
}

export function RatingStars({ value, count }: { value: number; count?: number }) {
  const { locale } = useI18n()
  if (value <= 0) return <span className="text-xs text-ink-400">—</span>
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span className="tnum text-sm font-medium text-ink-900">{value.toFixed(1)}</span>
      {count !== undefined && <span className="tnum text-xs text-ink-400">({formatNumber(count, locale)})</span>}
    </span>
  )
}

export function Pagination({ page, pageCount, onChange, total, pageSize }: { page: number; pageCount: number; onChange: (p: number) => void; total: number; pageSize: number }) {
  const { t, locale } = useI18n()
  if (pageCount <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
      <p className="tnum text-xs text-ink-500">
        {formatNumber(from, locale)}–{formatNumber(to, locale)} {t('common.of')} {formatNumber(total, locale)} {t('common.results')}
      </p>
      <div className="flex items-center gap-1.5">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          {t('common.previous')}
        </Button>
        <span className="tnum px-2 text-xs text-ink-600">
          {formatNumber(page, locale)} / {formatNumber(pageCount, locale)}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 border-b border-ink-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
            active === tab.id
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
