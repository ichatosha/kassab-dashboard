import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Check } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { EGYPT_CITIES, cityName } from '../../lib/geo'
import { RegisterShell } from './RegisterShell'
import type { BusinessType } from '../../types/domain'

const TYPES: BusinessType[] = ['restaurant', 'pharmacy', 'retail', 'ecommerce', 'company']

// An employer signs up and lands straight in their own portal, where the
// next step — publishing a workforce request — is waiting for them.
export function RegisterCompanyPage() {
  const { t, locale } = useI18n()
  const { dispatch } = useAppState()
  const { signInAs } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [type, setType] = useState<BusinessType>('restaurant')
  const [city, setCity] = useState('Cairo')
  const [address, setAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = t('form.required')
    if (!address.trim()) next.address = t('form.required')
    if (!contactName.trim()) next.contactName = t('form.required')
    if (!/^[+0-9\s]{9,}$/.test(phone.trim())) next.phone = t('form.phoneInvalid')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = t('form.errEmail')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 500))

    const id = `cmp-new-${Date.now().toString(36)}`
    dispatch({
      type: 'addCompany',
      id,
      input: {
        name: name.trim(),
        nameAr: nameAr.trim() || name.trim(),
        type,
        city,
        address: address.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      },
    })
    signInAs({
      id: `acc-${id}`,
      name: contactName.trim(),
      nameAr: contactName.trim(),
      email: email.trim(),
      role: 'company_owner',
      companyId: id,
    })
    toast(t('register.companyCreated'))
    navigate('/company')
  }

  return (
    <RegisterShell
      title={t('register.companyTitle')}
      subtitle={t('register.companySub')}
      aside={
        <Card title={t('register.whatHappens')}>
          <ol className="space-y-3 text-sm text-ink-700">
            {(['register.co1', 'register.co2', 'register.co3'] as TranslationKey[]).map((key) => (
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
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              {t('register.companyDetails')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label={t('register.companyName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />
              <TextField
                label={t('register.companyNameAr')}
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                hint={t('register.optional')}
                dir="rtl"
              />
              <SelectField label={t('companies.type')} value={type} onChange={(e) => setType(e.target.value as BusinessType)}>
                {TYPES.map((v) => (
                  <option key={v} value={v}>{t(`biz.${v}` as TranslationKey)}</option>
                ))}
              </SelectField>
              <SelectField label={t('common.city')} value={city} onChange={(e) => setCity(e.target.value)}>
                {EGYPT_CITIES.map((c) => (
                  <option key={c} value={c}>{cityName(c, locale)}</option>
                ))}
              </SelectField>
              <TextField
                label={t('common.address')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={errors.address}
                className="sm:col-span-2"
                required
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t('register.contactDetails')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label={t('companies.contact')}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                error={errors.contactName}
                required
              />
              <TextField
                label={t('common.phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                placeholder="+20 1XXXXXXXXX"
                dir="ltr"
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

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? t('register.creating') : t('register.createCompany')}
          </Button>
          <p className="text-center text-xs text-ink-500">{t('register.demoNote')}</p>
        </form>
      </Card>
    </RegisterShell>
  )
}
