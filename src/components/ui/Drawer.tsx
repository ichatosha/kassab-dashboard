import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  label?: string
}

export function Drawer({ open, onClose, title, children, footer, wide, label }: DrawerProps) {
  const { t } = useI18n()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
      <button
        aria-label={t('common.close')}
        className="absolute inset-0 cursor-default bg-ink-950/40 animate-fade-in"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`absolute inset-y-0 end-0 flex w-full flex-col bg-white shadow-drawer outline-none animate-drawer-in ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div className="min-w-0 flex-1">{title}</div>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="cursor-pointer rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-ink-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  )
}
