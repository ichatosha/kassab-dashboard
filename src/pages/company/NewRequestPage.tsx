import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bike, Check, Info } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { formatMoney, formatNumber } from '../../lib/format'
import { EGYPT_CITIES, cityName } from '../../lib/geo'
import type { EmploymentType } from '../../types/domain'

const REQUIREMENTS: TranslationKey[] = [
  'req.motorcycle', 'req.license', 'req.smartphone', 'req.area', 'req.careful', 'req.experience',
]
const BENEFITS: TranslationKey[] = [
  'ben.bonus', 'ben.fuel', 'ben.insurance', 'ben.meal', 'ben.maintenance',
]

// A company describes the workforce it needs. The vehicle is not a choice:
// Kassab supplies motorcycle delivery drivers, so it is stated, not asked.
export function NewRequestPage() {
  const { t, locale, dir } = useI18n()
  const { dispatch } = useAppState()
  const { company, feeRate } = useCompanyScope()
  const { toast } = useToast()
  const navigate = useNavigate()
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  const [driversRequired, setDriversRequired] = useState(5)
  const [salary, setSalary] = useState(8000)
  const [bonuses, setBonuses] = useState(500)
  const [city, setCity] = useState(company?.city ?? 'Cairo')
  const [area, setArea] = useState('')
  const [workingHours, setWorkingHours] = useState('09:00 - 19:00')
  const [workingDays, setWorkingDays] = useState('6 days / week')
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time')
  const [experienceYears, setExperienceYears] = useState(0)
  const [requirements, setRequirements] = useState<string[]>(['req.motorcycle', 'req.license', 'req.smartphone'])
  const [benefits, setBenefits] = useState<string[]>(['ben.bonus'])
  const [deadlineDays, setDeadlineDays] = useState(14)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!company) return <EmptyState title={t('notFound.title')} />

  const toggle = (list: string[], set: (v: string[]) => void, key: string) =>
    set(list.includes(key) ? list.filter((k) => k !== key) : [...list, key])

  const monthlySalaries = driversRequired * salary
  const monthlyFee = Math.round(monthlySalaries * feeRate)

  const validate = () => {
    const next: Record<string, string> = {}
    if (driversRequired < 1 || driversRequired > 200) next.driversRequired = t('form.errDrivers')
    if (salary < 3000) next.salary = t('form.errSalary')
    if (!area.trim()) next.area = t('form.required')
    if (!workingHours.trim()) next.workingHours = t('form.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (publish: boolean) => {
    if (!validate()) return
    const id = `wfr-new-${Date.now().toString(36)}`
    dispatch({
      type: 'addRequest',
      id,
      input: {
        companyId: company.id,
        driversRequired,
        salary,
        bonuses,
        city,
        area: area.trim(),
        workingHours: workingHours.trim(),
        workingDays: workingDays.trim(),
        employmentType,
        experienceYears,
        requirementKeys: requirements,
        benefitKeys: benefits,
        deadlineDays,
        publish,
      },
    })
    toast(publish ? t('company.requestPublished') : t('company.requestSaved'))
    navigate('/company/requests')
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/company/requests')}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <BackIcon className="h-4 w-4" aria-hidden />
        {t('nav.myRequests')}
      </button>

      <PageHeader title={t('company.newRequest')} subtitle={t('company.newRequestSub')} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title={t('company.theRole')}>
            <p className="mb-4 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm font-medium text-ink-700">
              <Bike className="h-4 w-4 text-ink-500" aria-hidden />
              {t('form.position')}: {t('moto.deliveryDriver')}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t('form.driversNeeded')}
                type="number"
                min={1}
                max={200}
                value={driversRequired}
                onChange={(e) => setDriversRequired(Number(e.target.value))}
                error={errors.driversRequired}
              />
              <SelectField
                label={t('wfr.employmentType')}
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              >
                {(['full_time', 'part_time', 'shifts'] as EmploymentType[]).map((v) => (
                  <option key={v} value={v}>{t(`emp.${v}` as TranslationKey)}</option>
                ))}
              </SelectField>
              <TextField
                label={t('form.monthlySalary')}
                type="number"
                min={3000}
                step={500}
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                error={errors.salary}
                hint={t('form.salaryHint')}
              />
              <TextField
                label={t('opp.bonuses')}
                type="number"
                min={0}
                step={100}
                value={bonuses}
                onChange={(e) => setBonuses(Number(e.target.value))}
              />
            </div>
          </Card>

          <Card title={t('company.whereAndWhen')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label={t('common.city')} value={city} onChange={(e) => setCity(e.target.value)}>
                {EGYPT_CITIES.map((c) => (
                  <option key={c} value={c}>{cityName(c, locale)}</option>
                ))}
              </SelectField>
              <TextField
                label={t('common.area')}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={t('form.areaPlaceholder')}
                error={errors.area}
              />
              <TextField
                label={t('wfr.workingHours')}
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                error={errors.workingHours}
              />
              <TextField
                label={t('wfr.workingDays')}
                value={workingDays}
                onChange={(e) => setWorkingDays(e.target.value)}
              />
              <TextField
                label={t('opp.experience')}
                type="number"
                min={0}
                max={10}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                hint={t('form.experienceHint')}
              />
              <TextField
                label={t('form.deadlineDays')}
                type="number"
                min={3}
                max={90}
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
              />
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card title={t('opp.requirements')}>
              <div className="space-y-1">
                {REQUIREMENTS.map((key) => (
                  <CheckRow
                    key={key}
                    label={t(key)}
                    checked={requirements.includes(key)}
                    onChange={() => toggle(requirements, setRequirements, key)}
                  />
                ))}
              </div>
            </Card>
            <Card title={t('opp.benefits')}>
              <div className="space-y-1">
                {BENEFITS.map((key) => (
                  <CheckRow
                    key={key}
                    label={t(key)}
                    checked={benefits.includes(key)}
                    onChange={() => toggle(benefits, setBenefits, key)}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card title={t('company.costPreview')}>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{formatNumber(driversRequired, locale)} × {formatMoney(salary, locale)}</dt>
                <dd className="tnum font-medium text-ink-900">{formatMoney(monthlySalaries, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('company.kassabFee')}</dt>
                <dd className="tnum font-medium text-brand-700">{formatMoney(monthlyFee, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-ink-100 pt-2.5">
                <dt className="font-medium text-ink-800">{t('company.ifFullyStaffed')}</dt>
                <dd className="tnum text-base font-bold text-ink-950">
                  {formatMoney(monthlySalaries + monthlyFee, locale)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-700">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('company.costNote')}
            </p>
          </Card>

          <Card>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => submit(true)}>
                {t('company.publishRequest')}
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => submit(false)}>
                {t('company.saveDraft')}
              </Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-500">{t('company.publishNote')}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-ink-700 transition-colors hover:bg-ink-50">
      <span
        aria-hidden
        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300 bg-surface'
        }`}
        style={{ height: '1.125rem', width: '1.125rem' }}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      {label}
    </label>
  )
}
