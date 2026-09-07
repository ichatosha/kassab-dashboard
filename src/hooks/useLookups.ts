import { useCallback, useMemo } from 'react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'

// Shared entity lookups. Every screen resolves names the same way, so a
// company or driver never appears under two different labels.
export function useLookups() {
  const { locale } = useI18n()
  const { companies, drivers, requests } = useAppState()

  const companyById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies])
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers])
  const requestById = useMemo(() => new Map(requests.map((r) => [r.id, r])), [requests])

  const companyName = useCallback(
    (id: string) => {
      const c = companyById.get(id)
      return c ? (locale === 'ar' ? c.nameAr : c.name) : '—'
    },
    [companyById, locale],
  )

  const driverName = useCallback(
    (id: string) => {
      const d = driverById.get(id)
      return d ? (locale === 'ar' ? d.nameAr : d.name) : '—'
    },
    [driverById, locale],
  )

  const contactName = useCallback(
    (id: string) => {
      const c = companyById.get(id)
      return c ? (locale === 'ar' ? c.contactNameAr : c.contactName) : '—'
    },
    [companyById, locale],
  )

  return { companyById, driverById, requestById, companyName, driverName, contactName }
}
