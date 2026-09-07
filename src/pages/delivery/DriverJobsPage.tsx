import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bike, Briefcase, Check, Clock, FilterX, MapPin, Users } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useDriverScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader, VerifiedMark } from '../../components/ui/misc'
import { formatMoney, formatNumber, formatRelative } from '../../lib/format'
import { EGYPT_CITIES, cityName } from '../../lib/geo'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'
import type { EmploymentType } from '../../types/domain'

// The driver's job board. Same marketplace data as the admin view, but
// answering a different question: can I do this job, and what does it pay?
export function DriverJobsPage() {
  const { t, locale } = useI18n()
  const { driver, requests, appliedRequestIds } = useDriverScope()
  const { companyById, companyName } = useLookups()

  const [query, setQuery] = useState('')
  const [city, setCity] = useState(driver?.city ?? 'all')
  const [type, setType] = useState('all')
  const [minSalary, setMinSalary] = useState('all')

  const open = useMemo(
    () => requests.filter((r) => OPEN_REQUEST_STATUSES.includes(r.status)),
    [requests],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return open.filter((r) => {
      const name = companyName(r.companyId)
      if (q && !name.toLowerCase().includes(q) && !name.includes(query.trim())) return false
      if (city !== 'all' && r.city !== city) return false
      if (type !== 'all' && r.employmentType !== type) return false
      if (minSalary !== 'all' && r.salary < Number(minSalary)) return false
      return true
    })
  }, [open, query, city, type, minSalary, companyName])

  const hasFilters = query !== '' || city !== 'all' || type !== 'all' || minSalary !== 'all'
  const clear = () => { setQuery(''); setCity('all'); setType('all'); setMinSalary('all') }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('driver.findJobsTitle')}
        subtitle={t('driver.findJobsSub')}
        actions={
          <span className="tnum rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">
            {formatNumber(filtered.length, locale)} {t('driver.jobsAvailable')}
          </span>
        }
      />

      <Card padded={false} className="mb-4">
        <div className="flex flex-wrap items-end gap-2 p-4">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('driver.searchCompany')}
            aria-label={t('common.search')}
            className="w-full sm:w-64"
          />
          <SelectField label={t('opp.filterCity')} value={city} onChange={(e) => setCity(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {EGYPT_CITIES.map((c) => (
              <option key={c} value={c}>{cityName(c, locale)}</option>
            ))}
          </SelectField>
          <SelectField label={t('opp.filterType')} value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {(['full_time', 'part_time', 'shifts'] as EmploymentType[]).map((v) => (
              <option key={v} value={v}>{t(`emp.${v}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('opp.filterSalary')} value={minSalary} onChange={(e) => setMinSalary(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            {[7000, 7500, 8000, 8500, 9000].map((v) => (
              <option key={v} value={v}>{formatMoney(v, locale)}</option>
            ))}
          </SelectField>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clear} icon={<FilterX className="h-4 w-4" aria-hidden />}>
              {t('common.clearFilters')}
            </Button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={t('driver.noJobs')}
            hint={t('driver.noJobsHint')}
            icon={<Briefcase className="h-6 w-6" />}
            action={hasFilters ? <Button variant="secondary" size="sm" onClick={clear}>{t('common.clearFilters')}</Button> : undefined}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const company = companyById.get(r.companyId)
            const remaining = Math.max(0, r.driversRequired - r.driversHired)
            const applied = appliedRequestIds.has(r.id)
            return (
              <article key={r.id} className="flex flex-col rounded-xl border border-ink-200/80 bg-surface p-4 shadow-card transition-colors hover:border-brand-300">
                <div className="flex items-start gap-3">
                  <Avatar name={company?.name ?? '—'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-950">{companyName(r.companyId)}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2">
                      {company && <VerifiedMark verified={company.verified} />}
                      <span className="text-xs text-ink-500">{t(`biz.${company?.type ?? 'company'}` as TranslationKey)}</span>
                    </div>
                  </div>
                  {applied && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-500/25">
                      <Check className="h-3 w-3" aria-hidden />
                      {t('driver.applied')}
                    </span>
                  )}
                </div>

                <p className="tnum mt-3 text-xl font-bold text-brand-700">
                  {formatMoney(r.salary, locale)}
                  <span className="ms-1 text-xs font-medium text-ink-500">{t('common.perMonth')}</span>
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-ink-600">
                    <MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {cityName(r.city, locale)}
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-600">
                    <Clock className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {t(`emp.${r.employmentType}` as TranslationKey)}
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-600">
                    <Users className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    <span className="tnum">{formatNumber(remaining, locale)} {t('opp.remaining')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-600">
                    <Bike className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {t('moto.category')}
                  </div>
                </dl>

                <p className="mt-3 text-[11px] text-ink-400">{formatRelative(r.createdAt, locale)}</p>

                <Link
                  to={`/delivery/jobs/${r.id}`}
                  className="mt-4 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
                >
                  {applied ? t('driver.viewJob') : t('opp.apply')}
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
