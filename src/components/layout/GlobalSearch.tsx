import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ClipboardList, Search, User } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'

interface Result {
  id: string
  group: 'orders' | 'drivers' | 'companies'
  label: string
  sub: string
  to: string
}

export function GlobalSearch() {
  const { t, locale } = useI18n()
  const { orders, drivers, companies } = useAppState()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const out: Result[] = []
    orders
      .filter((o) => o.number.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((o) => out.push({ id: o.id, group: 'orders', label: o.number, sub: o.customerName, to: `/orders?q=${encodeURIComponent(o.number)}` }))
    drivers
      .filter((d) => d.name.toLowerCase().includes(q) || d.nameAr.includes(query.trim()) || d.phone.replace(/\s/g, '').includes(q))
      .slice(0, 4)
      .forEach((d) => out.push({ id: d.id, group: 'drivers', label: locale === 'ar' ? d.nameAr : d.name, sub: d.phone, to: `/drivers/${d.id}` }))
    companies
      .filter((c) => c.name.toLowerCase().includes(q) || c.nameAr.includes(query.trim()))
      .slice(0, 4)
      .forEach((c) => out.push({ id: c.id, group: 'companies', label: locale === 'ar' ? c.nameAr : c.name, sub: c.contactName, to: `/companies/${c.id}` }))
    return out
  }, [query, orders, drivers, companies, locale])

  const groups: Result['group'][] = ['orders', 'drivers', 'companies']
  const groupIcon = {
    orders: <ClipboardList className="h-3.5 w-3.5" aria-hidden />,
    drivers: <User className="h-3.5 w-3.5" aria-hidden />,
    companies: <Building2 className="h-3.5 w-3.5" aria-hidden />,
  }

  return (
    <div ref={rootRef} className="relative hidden w-full max-w-md md:block">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={t('header.searchPlaceholder')}
        aria-label={t('header.searchHint')}
        className="h-9 w-full rounded-lg border border-ink-200 bg-ink-50/60 ps-9 pe-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-11 z-30 max-h-96 overflow-y-auto scroll-thin rounded-xl border border-ink-200 bg-white py-2 shadow-pop animate-slide-up">
          {results.length === 0 && <p className="px-4 py-3 text-sm text-ink-500">{t('search.noResults')}</p>}
          {groups.map((g) => {
            const items = results.filter((r) => r.group === g)
            if (items.length === 0) return null
            return (
              <div key={g}>
                <p className="flex items-center gap-1.5 px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                  {groupIcon[g]}
                  {t(`search.${g}`)}
                </p>
                {items.map((r) => (
                  <button
                    key={r.id}
                    className="flex w-full cursor-pointer items-baseline justify-between gap-3 px-4 py-2 text-start transition-colors hover:bg-brand-50/50"
                    onClick={() => {
                      setOpen(false)
                      setQuery('')
                      navigate(r.to)
                    }}
                  >
                    <span className="text-sm font-medium text-ink-900">{r.label}</span>
                    <span className="truncate text-xs text-ink-500">{r.sub}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
