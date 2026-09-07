import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Send } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useToast } from '../../components/ui/Toast'
import { brandLabel } from '../../lib/geo'
import { formatMoney } from '../../lib/format'
import type { EmploymentType, WorkforceRequest } from '../../types/domain'

interface Props {
  request: WorkforceRequest
  onClose: () => void
}

// The application form starts from an existing driver profile — the demo
// stands in for the driver app's logged-in session.
export function ApplyModal({ request, onClose }: Props) {
  const { t, locale } = useI18n()
  const { drivers, applications, dispatch } = useAppState()
  const { toast } = useToast()

  // Only drivers who could actually take this job and have not applied yet
  const candidates = useMemo(() => {
    const already = new Set(
      applications.filter((a) => a.requestId === request.id).map((a) => a.driverId),
    )
    return drivers.filter((d) => d.status === 'available' && !already.has(d.id))
  }, [drivers, applications, request.id])

  const [driverId, setDriverId] = useState(candidates[0]?.id ?? '')
  const driver = drivers.find((d) => d.id === driverId)

  const [age, setAge] = useState(String(driver?.age ?? ''))
  const [address, setAddress] = useState(driver?.address ?? '')
  const [phone, setPhone] = useState(driver?.phone ?? '')
  const [experience, setExperience] = useState(String(driver?.performance.experienceYears ?? 0))
  const [availability, setAvailability] = useState<EmploymentType>(driver?.availability ?? 'full_time')
  const [area, setArea] = useState(driver?.preferredArea ?? '')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  // Switching applicant refills the form from that driver's profile
  const selectDriver = (id: string) => {
    const d = drivers.find((x) => x.id === id)
    setDriverId(id)
    if (d) {
      setAge(String(d.age))
      setAddress(d.address)
      setPhone(d.phone)
      setExperience(String(d.performance.experienceYears))
      setAvailability(d.availability)
      setArea(d.preferredArea)
    }
    setErrors({})
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!driverId) next.driver = t('form.required')
    const ageNum = Number(age)
    if (!age || Number.isNaN(ageNum) || ageNum < 18 || ageNum > 60) next.age = t('form.ageInvalid')
    if (!address.trim()) next.address = t('form.required')
    if (!/^[+0-9\s]{9,}$/.test(phone.trim())) next.phone = t('form.phoneInvalid')
    if (!area.trim()) next.area = t('form.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 500))
    dispatch({
      type: 'submitApplication',
      input: {
        driverId,
        requestId: request.id,
        availability,
        preferredArea: area.trim(),
        experienceYears: Number(experience) || 0,
        note: note.trim() || undefined,
      },
    })
    setBusy(false)
    setDone(true)
    toast(t('form.success'))
  }

  if (done) {
    return (
      <Modal open onClose={onClose} title={t('form.success')}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="rounded-full bg-emerald-50 p-3 text-emerald-600" aria-hidden>
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="text-sm font-medium text-ink-900">{t('form.success')}</p>
          <p className="max-w-sm text-sm text-ink-500">{t('form.successBody')}</p>
          <div className="mt-2 flex gap-2">
            <Link
              to="/applications"
              className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              {t('form.viewApplications')}
            </Link>
            <Button variant="secondary" onClick={onClose}>{t('common.close')}</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={t('form.title')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" form="apply-form" disabled={busy || candidates.length === 0} icon={<Send className="h-4 w-4" aria-hidden />}>
            {busy ? t('form.submitting') : t('form.submit')}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-xl bg-ink-50 px-4 py-3">
        <p className="text-sm font-semibold text-ink-900">
          {locale === 'ar' ? request.positionAr : request.position}
        </p>
        <p className="tnum mt-0.5 text-sm text-brand-700">
          {formatMoney(request.salary, locale)} <span className="text-xs text-ink-500">{t('common.perMonth')}</span>
        </p>
      </div>

      {candidates.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-500">{t('drivers.emptyAvailable')}</p>
      ) : (
        <form id="apply-form" onSubmit={submit} noValidate className="space-y-5">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{t('form.personal')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField label={t('form.selectDriver')} value={driverId} onChange={(e) => selectDriver(e.target.value)} className="sm:col-span-2">
                {candidates.map((d) => (
                  <option key={d.id} value={d.id}>{locale === 'ar' ? d.nameAr : d.name}</option>
                ))}
              </SelectField>
              <TextField label={t('form.fullName')} value={driver ? (locale === 'ar' ? driver.nameAr : driver.name) : ''} disabled />
              <TextField label={t('form.age')} type="number" min={18} max={60} value={age} onChange={(e) => setAge(e.target.value)} error={errors.age} required />
              <TextField label={t('form.address')} value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} className="sm:col-span-2" required />
              <TextField label={t('form.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} dir="ltr" required />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{t('form.motorcycle')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label={t('form.motoType')} value={driver ? brandLabel(driver.motorcycle.brand, locale) : ''} disabled />
              <TextField label={t('form.motoModel')} value={driver?.motorcycle.model ?? ''} disabled />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{t('form.additional')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label={t('form.experience')} type="number" min={0} max={30} value={experience} onChange={(e) => setExperience(e.target.value)} />
              <SelectField label={t('form.availability')} value={availability} onChange={(e) => setAvailability(e.target.value as EmploymentType)}>
                {(['full_time', 'part_time', 'shifts'] as EmploymentType[]).map((v) => (
                  <option key={v} value={v}>{t(`emp.${v}` as TranslationKey)}</option>
                ))}
              </SelectField>
              <TextField label={t('form.preferredArea')} value={area} onChange={(e) => setArea(e.target.value)} error={errors.area} className="sm:col-span-2" required />
              <TextField label={t('form.notes')} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('form.notesPlaceholder')} className="sm:col-span-2" />
            </div>
          </section>
        </form>
      )}
    </Modal>
  )
}
