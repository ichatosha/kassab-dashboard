import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bike, Check } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { EGYPT_CITIES, brandLabel, cityName } from '../../lib/geo'
import { RegisterShell } from './RegisterShell'
import type { EmploymentType, MotorcycleBrand } from '../../types/domain'

const BRANDS: MotorcycleBrand[] = ['honda', 'yamaha', 'bajaj', 'sym', 'tvs', 'other']

// Five fields and a motorcycle. Anything else Kassab needs is collected
// later, during recruitment — not at the door.
export function RegisterDriverPage() {
  const { t, locale } = useI18n()
  const { dispatch } = useAppState()
  const { signInAs } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('Cairo')
  const [address, setAddress] = useState('')
  const [brand, setBrand] = useState<MotorcycleBrand>('honda')
  const [model, setModel] = useState('')
  const [experienceYears, setExperienceYears] = useState('0')
  const [availability, setAvailability] = useState<EmploymentType>('full_time')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = t('form.required')
    const ageNum = Number(age)
    if (!age || Number.isNaN(ageNum) || ageNum < 18 || ageNum > 60) next.age = t('form.ageInvalid')
    if (!/^[+0-9\s]{9,}$/.test(phone.trim())) next.phone = t('form.phoneInvalid')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = t('form.errEmail')
    if (!address.trim()) next.address = t('form.required')
    if (!model.trim()) next.model = t('form.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 500))

    const id = `drv-new-${Date.now().toString(36)}`
    dispatch({
      type: 'addDriver',
      id,
      input: {
        name: name.trim(),
        nameAr: nameAr.trim() || name.trim(),
        age: Number(age),
        city,
        address: address.trim(),
        phone: phone.trim(),
        brand,
        model: model.trim(),
        experienceYears: Number(experienceYears) || 0,
        availability,
      },
    })
    signInAs({
      id: `acc-${id}`,
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      email: email.trim(),
      role: 'driver',
      driverId: id,
    })
    toast(t('register.driverCreated'))
    navigate('/delivery')
  }

  return (
    <RegisterShell
      title={t('register.driverTitle')}
      subtitle={t('register.driverSub')}
      aside={
        <Card title={t('register.whatHappens')}>
          <ol className="space-y-3 text-sm text-ink-700">
            {(['register.dr1', 'register.dr2', 'register.dr3'] as TranslationKey[]).map((key) => (
              <li key={key} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t(key)}
              </li>
            ))}
          </ol>
        </Card>
      }
    >
      <Card>
        <form onSubmit={submit} noValidate className="space-y-5">
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t('form.personal')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label={t('form.fullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />
              <TextField
                label={t('register.nameAr')}
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                hint={t('register.optional')}
                dir="rtl"
              />
              <TextField
                label={t('form.age')}
                type="number"
                min={18}
                max={60}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                error={errors.age}
                required
              />
              <TextField
                label={t('form.phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                placeholder="+20 1XXXXXXXXX"
                dir="ltr"
                required
              />
              <SelectField label={t('common.city')} value={city} onChange={(e) => setCity(e.target.value)}>
                {EGYPT_CITIES.map((c) => (
                  <option key={c} value={c}>{cityName(c, locale)}</option>
                ))}
              </SelectField>
              <TextField
                label={t('form.address')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={errors.address}
                required
              />
              <TextField
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                hint={t('register.emailHint')}
                dir="ltr"
                className="sm:col-span-2"
                required
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <Bike className="h-3.5 w-3.5" aria-hidden />
              {t('form.motorcycle')}
            </h2>
            <p className="mb-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
              {t('register.motoNote')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField label={t('form.motoType')} value={brand} onChange={(e) => setBrand(e.target.value as MotorcycleBrand)}>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{brandLabel(b, locale)}</option>
                ))}
              </SelectField>
              <TextField
                label={t('form.motoModel')}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                error={errors.model}
                placeholder={t('register.modelPlaceholder')}
                required
              />
              <TextField
                label={t('form.experience')}
                type="number"
                min={0}
                max={30}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
              <SelectField label={t('form.availability')} value={availability} onChange={(e) => setAvailability(e.target.value as EmploymentType)}>
                {(['full_time', 'part_time', 'shifts'] as EmploymentType[]).map((v) => (
                  <option key={v} value={v}>{t(`emp.${v}` as TranslationKey)}</option>
                ))}
              </SelectField>
            </div>
          </section>

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? t('register.creating') : t('register.createDriver')}
          </Button>
          <p className="text-center text-xs text-ink-500">{t('register.demoNote')}</p>
        </form>
      </Card>
    </RegisterShell>
  )
}
