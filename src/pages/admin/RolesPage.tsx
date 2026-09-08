import { Check, Minus, ShieldCheck } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/misc'
import { EMPLOYEE_ROLES, PERMISSION_GROUPS, ROLE_PERMISSIONS } from '../../lib/permissions'
import { formatNumber } from '../../lib/format'

// The whole authorization model on one screen. Every check in the product
// resolves against this table, so it is the honest answer to "who can do
// what" rather than a diagram that drifts from the code.
export function RolesPage() {
  const { t, locale } = useI18n()
  const { employees } = useAppState()

  const headcount = (role: string) => employees.filter((e) => e.role === role).length

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('roles.title')} subtitle={t('roles.subtitle')} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {EMPLOYEE_ROLES.map((role) => (
          <Card key={role}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                  {role === 'platform_owner' && <ShieldCheck className="h-3.5 w-3.5 text-brand-600" aria-hidden />}
                  {t(`role.${role}` as TranslationKey)}
                </p>
                <p className="tnum mt-0.5 text-xs text-ink-500">
                  {formatNumber(headcount(role), locale)} {t('roles.people')}
                </p>
              </div>
              <span className="tnum shrink-0 rounded-md bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-700">
                {formatNumber(ROLE_PERMISSIONS[role].length, locale)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              {t(`roleDesc.${role}` as TranslationKey)}
            </p>
          </Card>
        ))}
      </div>

      <Card title={t('roles.matrix')} padded={false}>
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50/70">
                <th scope="col" className="px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {t('roles.permission')}
                </th>
                {EMPLOYEE_ROLES.map((role) => (
                  <th key={role} scope="col" className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
                    {t(`role.${role}` as TranslationKey)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) => (
                <>
                  <tr key={group.labelKey} className="border-b border-ink-100 bg-ink-50/40">
                    <td colSpan={EMPLOYEE_ROLES.length + 1} className="px-3 py-1.5 text-xs font-semibold text-ink-600">
                      {t(group.labelKey as TranslationKey)}
                    </td>
                  </tr>
                  {group.permissions.map((permission) => (
                    <tr key={permission} className="border-b border-ink-100 last:border-b-0">
                      <td className="px-3 py-2 align-middle">
                        <span className="font-mono text-xs text-ink-700">{permission}</span>
                      </td>
                      {EMPLOYEE_ROLES.map((role) => {
                        const granted = ROLE_PERMISSIONS[role].includes(permission)
                        return (
                          <td key={role} className="px-3 py-2 text-center align-middle">
                            <span className="sr-only">
                              {granted ? t('roles.granted') : t('roles.notGranted')}
                            </span>
                            {granted ? (
                              <Check className="mx-auto h-4 w-4 text-emerald-600" aria-hidden strokeWidth={3} />
                            ) : (
                              <Minus className="mx-auto h-4 w-4 text-ink-300" aria-hidden />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-3 text-xs leading-relaxed text-ink-500">{t('roles.note')}</p>
    </div>
  )
}
