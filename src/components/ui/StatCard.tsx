import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  hint?: ReactNode
  tone?: 'default' | 'success' | 'danger' | 'brand'
}

const toneText: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-ink-950',
  success: 'text-emerald-700',
  danger: 'text-red-700',
  brand: 'text-brand-700',
}

export function StatCard({ label, value, icon, hint, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        {icon && <span className="text-ink-400" aria-hidden>{icon}</span>}
      </div>
      <p className={`tnum mt-2 text-2xl font-bold leading-none ${toneText[tone]}`}>{value}</p>
      {hint && <p className="mt-2 text-xs text-ink-500">{hint}</p>}
    </div>
  )
}
