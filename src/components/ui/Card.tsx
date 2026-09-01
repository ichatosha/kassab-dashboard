import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: ReactNode
  actions?: ReactNode
  padded?: boolean
}

export function Card({ children, className = '', title, actions, padded = true }: CardProps) {
  return (
    <section className={`rounded-xl border border-ink-200/80 bg-white shadow-card ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
          {typeof title === 'string' ? (
            <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
          ) : (
            title
          )}
          {actions}
        </header>
      )}
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </section>
  )
}
