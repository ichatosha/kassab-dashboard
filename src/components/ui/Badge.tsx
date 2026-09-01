import type { ReactNode } from 'react'
import { toneClasses } from '../../lib/status'
import type { Tone } from '../../lib/status'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  dot?: boolean
  pulse?: boolean
  className?: string
}

export function Badge({ tone = 'neutral', children, dot, pulse, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]} ${className}`}
    >
      {dot && (
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? 'animate-pulse-dot' : ''}`}
        />
      )}
      {children}
    </span>
  )
}
