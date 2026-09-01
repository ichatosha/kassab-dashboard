import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

const baseInput =
  'h-9 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:bg-ink-50 disabled:text-ink-400'

interface LabeledProps {
  label?: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, className = '', ...rest }: LabeledProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink-600">
          {label}
        </label>
      )}
      <input id={id} className={`${baseInput} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/25' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
      {!error && hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  )
}

interface SelectFieldProps extends LabeledProps, SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export function SelectField({ label, error, className = '', children, ...rest }: SelectFieldProps) {
  const id = useId()
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink-600">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`${baseInput} cursor-pointer pe-8 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/25' : ''}`}
        aria-invalid={!!error}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function SearchInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
      <input type="search" className={`${baseInput} ps-9`} {...rest} />
    </div>
  )
}

export function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-ink-800">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${checked ? 'bg-brand-600' : 'bg-ink-200'}`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'start-[calc(100%-1.375rem)]' : 'start-0.5'}`}
        />
      </button>
    </label>
  )
}
