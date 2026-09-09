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
import { SelectField, TextField } from '../components/ui/Field'
import { PageHeader } from '../components/ui/misc'
import { brandLabel, cityName, EGYPT_CITIES } from '../lib/geo'
import type { MotorcycleBrand } from '../types/domain'

const BRANDS: MotorcycleBrand[] = ['honda', 'yamaha', 'bajaj', 'sym', 'tvs', 'other']

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const { companies, dispatch } = useAppState()
  const { user, role } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // The fee rate is the one setting on this page that changes what the
  // rest of the platform calculates, so it is the one that can be saved.
  const currentRate = Math.round((companies[0]?.kassabFeeRate ?? 0.125) * 100 * 10) / 10
  const [feeRate, setFeeRate] = useState(currentRate)
  const dirty = feeRate !== currentRate

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={
          <Button
            icon={<Save className="h-4 w-4" aria-hidden />}
            disabled={!dirty || feeRate < 0 || feeRate > 100}
            onClick={() => {
              dispatch({ type: 'setFeeRate', rate: feeRate / 100 })
              toast(t('settings.feeSaved'))
            }}
          >
            {t('common.save')}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
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

        <Card title={t('settings.feeDefaults')}>
          <TextField
            label={t('settings.feeRate')}
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={feeRate}
            onChange={(e) => setFeeRate(Number(e.target.value))}
            hint={t('settings.feeRateHint')}
          />
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
