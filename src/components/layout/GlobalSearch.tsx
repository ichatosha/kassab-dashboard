import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Building2, FileText, Search, User, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'

type Group = 'drivers' | 'companies' | 'opportunities' | 'applications'

interface Result {
  id: string
  group: Group
  label: string
  sub: string
  to: string
}

const GROUPS: Group[] = ['drivers', 'companies', 'opportunities', 'applications']

const groupIcon: Record<Group, ReactNode> = {
  drivers: <User className="h-3.5 w-3.5" aria-hidden />,
  companies: <Building2 className="h-3.5 w-3.5" aria-hidden />,
  opportunities: <Briefcase className="h-3.5 w-3.5" aria-hidden />,
  applications: <FileText className="h-3.5 w-3.5" aria-hidden />,
}

// Searches drivers, companies, opportunities and applications at once.
function useSearchResults(query: string): Result[] {
  const { locale } = useI18n()
  const { drivers, companies, requests, applications } = useAppState()

  return useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const raw = query.trim()
    const out: Result[] = []
    const companyName = (id: string) => {
      const c = companies.find((x) => x.id === id)
      return c ? (locale === 'ar' ? c.nameAr : c.name) : ''
    }

    drivers
      .filter((d) => d.name.toLowerCase().includes(q) || d.nameAr.includes(raw) || d.phone.replace(/\s/g, '').includes(q) || d.code.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((d) => out.push({ id: d.id, group: 'drivers', label: locale === 'ar' ? d.nameAr : d.name, sub: d.phone, to: `/admin/drivers/profile/${d.id}` }))

    companies
      .filter((c) => c.name.toLowerCase().includes(q) || c.nameAr.includes(raw))
      .slice(0, 4)
      .forEach((c) => out.push({ id: c.id, group: 'companies', label: locale === 'ar' ? c.nameAr : c.name, sub: c.city, to: `/admin/companies/${c.id}` }))

    requests
      .filter((r) => r.number.toLowerCase().includes(q) || companyName(r.companyId).toLowerCase().includes(q) || companyName(r.companyId).includes(raw))
      .slice(0, 4)
      .forEach((r) => out.push({ id: r.id, group: 'opportunities', label: r.number, sub: companyName(r.companyId), to: `/admin/opportunities/${r.id}` }))

    applications
      .filter((a) => a.number.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((a) => {
        const d = drivers.find((x) => x.id === a.driverId)
        out.push({
          id: a.id,
          group: 'applications',
          label: a.number,
          sub: d ? (locale === 'ar' ? d.nameAr : d.name) : '',
          to: `/admin/applications?open=${a.id}`,
        })
      })

    return out
  }, [query, drivers, companies, requests, applications, locale])
}

function ResultList({ results, onPick }: { results: Result[]; onPick: (to: string) => void }) {
  const { t } = useI18n()
  if (results.length === 0) return <p className="px-4 py-3 text-sm text-ink-500">{t('search.noResults')}</p>
  return (
    <>
      {GROUPS.map((g) => {
        const items = results.filter((r) => r.group === g)
        if (items.length === 0) return null
        return (
          <div key={g}>
            <p className="flex items-center gap-1.5 px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
              {groupIcon[g]}
              {t(`search.${g}` as TranslationKey)}
            </p>
            {items.map((r) => (
              <button
                key={r.id}
                className="flex w-full cursor-pointer items-baseline justify-between gap-3 px-4 py-2.5 text-start transition-colors hover:bg-brand-50/50"
                onClick={() => onPick(r.to)}
              >
                <span className="text-sm font-medium text-ink-900">{r.label}</span>
                <span className="truncate text-xs text-ink-500">{r.sub}</span>
              </button>
            ))}
          </div>
        )
      })}
    </>
  )
}

// Desktop: a search field sitting in the header.
export function GlobalSearch() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const results = useSearchResults(query)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

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
        className="h-9 w-full rounded-lg border border-ink-200 bg-ink-50/60 ps-9 pe-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/25"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-11 z-30 max-h-96 overflow-y-auto scroll-thin rounded-xl border border-ink-200 bg-surface py-2 shadow-pop animate-slide-up">
          <ResultList
            results={results}
            onPick={(to) => {
              setOpen(false)
              setQuery('')
              navigate(to)
            }}
          />
        </div>
      )}
    </div>
  )
}

// Phones: a search button that opens a full-screen sheet, so search is
// actually reachable on mobile instead of disappearing with the field.
export function MobileSearch() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const results = useSearchResults(query)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t('header.searchHint')}
        className="shrink-0 cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 md:hidden"
      >
        <Search className="h-5 w-5" aria-hidden />
      </button>

      {/* Rendered at the body: the header's backdrop-blur would otherwise
          become the containing block and clip this to the header's height. */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-50 flex flex-col bg-canvas md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t('header.searchHint')}
        >
          <div className="flex items-center gap-2 border-b border-ink-200 bg-surface px-3 py-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('header.searchPlaceholder')}
                aria-label={t('header.searchHint')}
                className="h-11 w-full rounded-lg border border-ink-200 bg-ink-50/60 ps-9 pe-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
            <button
              onClick={close}
              aria-label={t('common.close')}
              className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scroll-thin py-2">
            {query.trim().length < 2 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-500">{t('header.searchHint')}</p>
            ) : (
              <ResultList
                results={results}
                onPick={(to) => {
                  close()
                  navigate(to)
                }}
              />
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
