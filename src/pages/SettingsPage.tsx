import { useState } from 'react'
import { Bike, Eye, EyeOff, Info, Save } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { ADMIN_ROLES, ENGAGEMENT_ROLES, useAuth } from '../store/auth'
import { useTheme } from '../store/theme'
import type { Theme } from '../store/theme'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SelectField, TextField, ToggleField } from '../components/ui/Field'
import { PageHeader } from '../components/ui/misc'
import { brandLabel, cityName, EGYPT_CITIES } from '../lib/geo'
import type { MotorcycleBrand } from '../types/domain'

const BRANDS: MotorcycleBrand[] = ['honda', 'yamaha', 'bajaj', 'sym', 'tvs', 'other']

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const { companies } = useAppState()
  const { user, role } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [platformName, setPlatformName] = useState('Kassab Logistics Services')
  const [supportPhone, setSupportPhone] = useState('+20 2 19919')
  const [notifApplications, setNotifApplications] = useState(true)
  const [notifRequests, setNotifRequests] = useState(true)
  const [notifPayments, setNotifPayments] = useState(true)
  const [feeRate, setFeeRate] = useState(Math.round((companies[0]?.kassabFeeRate ?? 0.125) * 100 * 10) / 10)
  const [referenceSalary, setReferenceSalary] = useState(8000)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={
          <Button icon={<Save className="h-4 w-4" aria-hidden />} onClick={() => toast(t('common.saved'))}>
            {t('common.save')}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t('settings.general')}>
          <div className="space-y-4">
            <TextField label={t('settings.platformName')} value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            <TextField label={t('settings.supportPhone')} value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} dir="ltr" />
            <TextField label={t('settings.currency')} value="EGP — Egyptian Pound" disabled />
          </div>
        </Card>

        <Card title={t('settings.language')}>
          <div className="space-y-4">
            <SelectField label={t('settings.langChoice')} value={locale} onChange={(e) => setLocale(e.target.value as 'en' | 'ar')}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </SelectField>
            <SelectField label={t('theme.label')} value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
              <option value="light">{t('theme.light')}</option>
              <option value="dark">{t('theme.dark')}</option>
            </SelectField>
          </div>
        </Card>

        <Card title={t('settings.notifications')}>
          <ToggleField label={t('settings.notifApplications')} checked={notifApplications} onChange={setNotifApplications} />
          <ToggleField label={t('settings.notifRequests')} checked={notifRequests} onChange={setNotifRequests} />
          <ToggleField label={t('settings.notifPayments')} checked={notifPayments} onChange={setNotifPayments} />
        </Card>

        <Card title={t('settings.feeDefaults')}>
          <div className="space-y-4">
            <TextField
              label={t('settings.feeRate')}
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={feeRate}
              onChange={(e) => setFeeRate(Number(e.target.value))}
            />
            <TextField
              label={t('settings.defaultSalary')}
              type="number"
              min={0}
              step={100}
              value={referenceSalary}
              onChange={(e) => setReferenceSalary(Number(e.target.value))}
            />
          </div>
        </Card>

        <Card title={t('settings.motorcycles')}>
          <p className="mb-3 flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('settings.vehicleNote')}
          </p>
          <div className="flex flex-wrap gap-2">
            {BRANDS.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2 py-1 text-xs font-medium text-ink-700">
                <Bike className="h-3.5 w-3.5" aria-hidden />
                {brandLabel(b, locale)}
              </span>
            ))}
          </div>
        </Card>

        <Card title={t('settings.cities')}>
          <div className="flex flex-wrap gap-2">
            {EGYPT_CITIES.map((c) => (
              <Badge key={c} tone="neutral">{cityName(c, locale)}</Badge>
            ))}
          </div>
        </Card>

        <Card title={t('settings.access')} className="lg:col-span-2">
          <p className="mb-3 flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('settings.accessNote')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ADMIN_ROLES.map((r) => {
              const sees = ENGAGEMENT_ROLES.includes(r)
              const isMe = r === role
              return (
                <div
                  key={r}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
                    isMe ? 'border-brand-300 bg-brand-50' : 'border-ink-100'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink-900">
                      {t(`role.${r}` as TranslationKey)}
                    </span>
                    {isMe && <span className="text-xs text-brand-700">{t('settings.yourRole')}</span>}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${
                      sees ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {sees ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
                    {sees ? t('settings.canSeeEngagement') : t('settings.cannotSeeEngagement')}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title={t('settings.profile')} className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label={t('drivers.name')} value={user?.name ?? ''} disabled />
            <TextField label={t('auth.email')} value={user?.email ?? ''} disabled dir="ltr" />
          </div>
        </Card>
      </div>
    </div>
  )
}
