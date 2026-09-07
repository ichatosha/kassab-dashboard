import { useI18n } from '../../i18n'
import { useAuth } from '../../store/auth'
import { useDriverScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { useTheme } from '../../store/theme'
import type { Theme } from '../../store/theme'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { SelectField, TextField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, MotorcycleBadge, PageHeader, RatingStars, VerifiedMark } from '../../components/ui/misc'
import { DriverBadge } from '../../components/shared/StatusBadges'
import { formatDate, formatMoney, formatNumber, formatPercent } from '../../lib/format'
import { brandLabel, cityName } from '../../lib/geo'

// The driver's own profile: the five fields they registered with, plus the
// record they have built since. Deliberately short — this is not an HR file.
export function DriverAccountPage() {
  const { t, locale, setLocale } = useI18n()
  const { user } = useAuth()
  const { driver, employer } = useDriverScope()
  const { companyName } = useLookups()
  const { theme, setTheme } = useTheme()

  if (!driver) return <EmptyState title={t('notFound.title')} />

  const p = driver.performance

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('driver.profileTitle')}
        subtitle={t('driver.profileSub')}
        actions={<DriverBadge status={driver.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={driver.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-ink-950">
                  {locale === 'ar' ? driver.nameAr : driver.name}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <RatingStars value={p.rating} count={p.ratingCount} />
                  <VerifiedMark verified={driver.verified} />
                </div>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: t('form.fullName'), value: locale === 'ar' ? driver.nameAr : driver.name },
                { label: t('form.age'), value: `${formatNumber(driver.age, locale)} ${t('common.years')}` },
                { label: t('form.phone'), value: driver.phone, ltr: true },
                { label: t('form.address'), value: driver.address },
                { label: t('common.city'), value: cityName(driver.city, locale) },
                { label: t('form.motoType'), value: `${brandLabel(driver.motorcycle.brand, locale)} ${driver.motorcycle.model}` },
                { label: t('drivers.code'), value: driver.code, ltr: true },
                { label: t('drivers.registered'), value: formatDate(driver.registeredAt, locale) },
              ].map((row) => (
                <div key={row.label} className="rounded-lg border border-ink-100 px-3 py-2.5">
                  <dt className="text-xs text-ink-500">{row.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink-900" dir={row.ltr ? 'ltr' : undefined}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title={t('driver.myRecord')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label={t('drivers.completedDeliveries')} value={formatNumber(p.completedDeliveries, locale)} tone="success" />
              <StatCard label={t('drivers.successRate')} value={p.completedDeliveries > 0 ? formatPercent(p.deliverySuccessRate, locale) : '—'} tone="brand" />
              <StatCard label={t('drivers.failedDeliveries')} value={formatNumber(p.failedDeliveries, locale)} />
              <StatCard label={t('drivers.cancelledDeliveries')} value={formatNumber(p.cancelledDeliveries, locale)} />
            </div>
            {p.completedDeliveries === 0 && (
              <p className="mt-3 text-xs text-ink-500">{t('driver.noHistoryHint')}</p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title={t('moto.category')}>
            <MotorcycleBadge motorcycle={driver.motorcycle} />
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('moto.type')}</dt>
                <dd className="font-medium text-ink-900">{brandLabel(driver.motorcycle.brand, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('moto.model')}</dt>
                <dd className="font-medium text-ink-900">{driver.motorcycle.model}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{t('moto.plate')}</dt>
                <dd className="font-medium text-ink-900" dir="rtl">{driver.motorcycle.plate ?? '—'}</dd>
              </div>
            </dl>
          </Card>

          <Card title={t('driver.employment')}>
            {driver.employment && employer ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">{t('drivers.company')}</dt>
                  <dd className="font-medium text-ink-900">{companyName(driver.employment.companyId)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">{t('driver.monthlySalary')}</dt>
                  <dd className="tnum font-semibold text-ink-900">{formatMoney(driver.employment.salary, locale)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">{t('drivers.startDate')}</dt>
                  <dd className="tnum font-medium text-ink-900">{formatDate(driver.employment.startDate, locale)}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-ink-500">{t('driver.notHiredYet')}</p>
            )}
          </Card>

          <Card title={t('settings.account')}>
            <div className="space-y-4">
              <TextField label={t('auth.email')} value={user?.email ?? ''} disabled dir="ltr" />
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
        </div>
      </div>
    </div>
  )
}
