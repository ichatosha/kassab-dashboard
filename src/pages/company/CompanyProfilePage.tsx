import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAuth } from '../../store/auth'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { useTheme } from '../../store/theme'
import type { Theme } from '../../store/theme'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { SelectField, TextField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader, VerifiedMark } from '../../components/ui/misc'
import { CompanyBadge } from '../../components/shared/StatusBadges'
import { formatDate, formatPercent } from '../../lib/format'
import { cityName } from '../../lib/geo'

export function CompanyProfilePage() {
  const { t, locale, setLocale } = useI18n()
  const { user } = useAuth()
  const { company, feeRate } = useCompanyScope()
  const { theme, setTheme } = useTheme()

  if (!company) return <EmptyState title={t('notFound.title')} />

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('company.profileTitle')} subtitle={t('company.profileSub')} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={company.name} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-ink-950">
                {locale === 'ar' ? company.nameAr : company.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <CompanyBadge status={company.status} />
                <VerifiedMark verified={company.verified} />
                <Badge tone="info">{t(`biz.${company.type}` as TranslationKey)}</Badge>
              </div>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { label: t('companies.code'), value: company.code },
              { label: t('common.city'), value: cityName(company.city, locale) },
              { label: t('common.address'), value: company.address },
              { label: t('companies.contact'), value: locale === 'ar' ? company.contactNameAr : company.contactName },
              { label: t('common.phone'), value: company.phone },
              { label: t('auth.email'), value: company.email },
              { label: t('drivers.registered'), value: formatDate(company.registeredAt, locale) },
              { label: t('company.kassabFee'), value: formatPercent(feeRate * 100, locale) },
            ].map((row) => (
              <div key={row.label} className="rounded-lg border border-ink-100 px-3 py-2.5">
                <dt className="text-xs text-ink-500">{row.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-900" dir={row.label === t('common.phone') || row.label === t('auth.email') ? 'ltr' : undefined}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-4">
          <Card title={t('settings.account')}>
            <div className="space-y-4">
              <TextField label={t('drivers.name')} value={locale === 'ar' ? (user?.nameAr ?? '') : (user?.name ?? '')} disabled />
              <TextField label={t('auth.email')} value={user?.email ?? ''} disabled dir="ltr" />
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
        </div>
      </div>
    </div>
  )
}
