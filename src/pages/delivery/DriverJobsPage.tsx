import { useMemo, useState } from 'react'
import { Briefcase, FilterX } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useDriverScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { formatMoney, formatNumber } from '../../lib/format'
import { EGYPT_CITIES, cityName } from '../../lib/geo'
import { OPEN_REQUEST_STATUSES } from '../../lib/status'
import { JobCard } from './JobCard'
import type { EmploymentType } from '../../types/domain'

// The driver's job board. Same marketplace data as the admin view, but
// answering a different question: can I do this job, and what does it pay?
export function DriverJobsPage() {
  const { t, locale } = useI18n()
  const { driver, requests, appliedRequestIds } = useDriverScope()
  const { companyName } = useLookups()

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
          {filtered.map((r) => (
            <JobCard key={r.id} request={r} applied={appliedRequestIds.has(r.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
