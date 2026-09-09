import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader } from '../../components/ui/misc'
import { EmployeeStatusBadge } from '../../components/shared/StatusBadges'
import { EMPLOYEE_ROLES, ROLE_PERMISSIONS } from '../../lib/permissions'
import { formatDate, formatRelative } from '../../lib/format'
import type { EmployeeRole } from '../../types/domain'

export function EmployeeDetailPage() {
  const { id } = useParams()
  const { t, locale, dir } = useI18n()
  const { employees, auditLog, dispatch } = useAppState()
  const { can, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  const employee = employees.find((e) => e.id === id)
  const [role, setRole] = useState<EmployeeRole>(employee?.role ?? 'support')

  if (!employee) {
    return (
      <EmptyState
        title={t('notFound.title')}
        action={<Link to="/admin/employees" className="text-sm font-medium text-brand-600">{t('nav.employees')}</Link>}
      />
    )
  }

  const mayManage = can('employees.manage')
  const isSelf = user?.employeeId === employee.id
  const activity = auditLog.filter((a) => a.actorId === employee.id).slice(0, 8)
  const permissions = ROLE_PERMISSIONS[employee.role]

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/admin/employees')}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <BackIcon className="h-4 w-4" aria-hidden />
        {t('nav.employees')}
      </button>

      <PageHeader
        title={locale === 'ar' ? employee.nameAr : employee.name}
        subtitle={`${employee.code} · ${t(`role.${employee.role}` as TranslationKey)}`}
        actions={<EmployeeStatusBadge status={employee.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={employee.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-ink-950">
                  {locale === 'ar' ? employee.nameAr : employee.name}
                </h2>
                <p className="text-sm text-ink-500">
                  {locale === 'ar' ? employee.departmentAr : employee.department}
                </p>
              </div>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: t('emp.username'), value: employee.username, ltr: true },
                { label: t('auth.email'), value: employee.email, ltr: true },
                { label: t('common.phone'), value: employee.phone, ltr: true },
                { label: t('emp.role'), value: t(`role.${employee.role}` as TranslationKey) },
                { label: t('emp.lastLogin'), value: employee.lastLoginAt ? formatRelative(employee.lastLoginAt, locale) : t('emp.never') },
                { label: t('emp.createdAt'), value: formatDate(employee.createdAt, locale) },
              ].map((row) => (
                <div key={row.label} className="rounded-lg border border-ink-100 px-3 py-2.5">
                  <dt className="text-xs text-ink-500">{row.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink-900" dir={row.ltr ? 'ltr' : undefined}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title={t('emp.activity')} padded={false}>
            {activity.length === 0 ? (
              <EmptyState title={t('emp.noActivity')} />
            ) : (
              <ul className="divide-y divide-ink-100">
                {activity.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 px-4 py-2.5">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink-800">
                        {t(`audit.${entry.action}` as TranslationKey)}
                      </span>
                      <span className="block truncate text-xs text-ink-500">
                        {locale === 'ar' ? entry.entityLabelAr : entry.entityLabel}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-400">{formatRelative(entry.at, locale)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title={t('emp.permissions')}>
            <p className="mb-3 text-xs text-ink-500">{t('emp.fromRole')}</p>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((p) => (
                <span key={p} className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-[10px] text-ink-700">
                  {p}
                </span>
              ))}
            </div>
            <Link to="/admin/roles" className="mt-4 block">
              <Button variant="secondary" className="w-full" icon={<ShieldCheck className="h-4 w-4" aria-hidden />}>
                {t('nav.roles')}
              </Button>
            </Link>
          </Card>

          {mayManage && (
            <Card title={t('emp.manage')}>
              <div className="space-y-3">
                <SelectField
                  label={t('emp.changeRole')}
                  value={role}
                  onChange={(e) => setRole(e.target.value as EmployeeRole)}
                  disabled={isSelf}
                >
                  {EMPLOYEE_ROLES.map((r) => (
                    <option key={r} value={r}>{t(`role.${r}` as TranslationKey)}</option>
                  ))}
                </SelectField>
                <Button
                  className="w-full"
                  disabled={isSelf || role === employee.role}
                  onClick={() => {
                    dispatch({ type: 'updateEmployee', employeeId: employee.id, changes: { role } })
                    toast(t('emp.roleChanged'))
                  }}
                >
                  {t('emp.saveRole')}
                </Button>
                <Button
                  variant={employee.status === 'active' ? 'danger' : 'success'}
                  className="w-full"
                  disabled={isSelf || employee.role === 'platform_owner'}
                  onClick={() => {
                    const next = employee.status === 'active' ? 'disabled' : 'active'
                    dispatch({ type: 'setEmployeeStatus', employeeId: employee.id, status: next })
                    toast(next === 'active' ? t('emp.enabled') : t('emp.disabled'), next === 'active' ? 'success' : 'info')
                  }}
                >
                  {employee.status === 'active' ? t('emp.disable') : t('emp.enable')}
                </Button>
                {isSelf && <p className="text-xs text-ink-500">{t('emp.cannotEditSelf')}</p>}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
