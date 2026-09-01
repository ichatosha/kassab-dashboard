import { useState } from 'react'
import { Save } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useAuth } from '../store/auth'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SelectField, TextField, ToggleField } from '../components/ui/Field'
import { PageHeader, VehicleBadge } from '../components/ui/misc'

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const { zonePricing, vehiclePricing } = useAppState()
  const { user } = useAuth()
  const { toast } = useToast()

  const [platformName, setPlatformName] = useState('Kassab Logistics Services')
  const [supportPhone, setSupportPhone] = useState('+20 2 19919')
  const [notifNew, setNotifNew] = useState(true)
  const [notifFail, setNotifFail] = useState(true)
  const [notifApprove, setNotifApprove] = useState(true)
  const [commission, setCommission] = useState(25)

  const save = () => toast(t('common.saved'))

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={
          <Button icon={<Save className="h-4 w-4" aria-hidden />} onClick={save}>
            {t('common.save')}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t('settings.general')}>
          <div className="space-y-4">
            <TextField label={t('settings.platformName')} value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            <TextField label={t('settings.supportPhone')} value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} dir="ltr" />
            <TextField label={t('settings.defaultCurrency')} value="EGP — Egyptian Pound" disabled />
          </div>
        </Card>

        <Card title={t('settings.language')}>
          <SelectField label={t('settings.langChoice')} value={locale} onChange={(e) => setLocale(e.target.value as 'en' | 'ar')}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </SelectField>
        </Card>

        <Card title={t('settings.notifications')}>
          <ToggleField label={t('settings.notifNewOrders')} checked={notifNew} onChange={setNotifNew} />
          <ToggleField label={t('settings.notifFailures')} checked={notifFail} onChange={setNotifFail} />
          <ToggleField label={t('settings.notifApprovals')} checked={notifApprove} onChange={setNotifApprove} />
        </Card>

        <Card title={t('settings.pricingDefaults')}>
          <div className="space-y-4">
            <TextField
              label={t('settings.defaultCommission')}
              type="number"
              min={0}
              max={100}
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
            />
            <TextField label={t('settings.defaultDriverShare')} type="number" value={100 - commission} disabled />
          </div>
        </Card>

        <Card title={t('settings.vehicleTypes')}>
          <div className="flex flex-wrap gap-2">
            {vehiclePricing.map((v) => (
              <VehicleBadge key={v.id} type={v.type} />
            ))}
          </div>
        </Card>

        <Card title={t('settings.zones')}>
          <div className="flex flex-wrap gap-2">
            {zonePricing.map((z) => (
              <Badge key={z.id} tone={z.active ? 'neutral' : 'warning'}>
                {locale === 'ar' ? z.zoneAr : z.zone}
              </Badge>
            ))}
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
