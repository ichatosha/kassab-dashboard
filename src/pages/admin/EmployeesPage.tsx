import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ShieldCheck, UserCog } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { SearchInput, SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader } from '../../components/ui/misc'
import { EmployeeStatusBadge } from '../../components/shared/StatusBadges'
import { EmployeeFormModal } from '../../features/employees/EmployeeFormModal'
import { EMPLOYEE_ROLES } from '../../lib/permissions'
import { formatDate, formatNumber, formatRelative } from '../../lib/format'
import type { Employee } from '../../types/domain'

// Kassab's own staff. Deliberately separate from drivers and from company
// users — this table is about who operates the platform.
export function EmployeesPage() {
  const { t, locale } = useI18n()
  const { employees, dispatch } = useAppState()
  const { can, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [formOpen, setFormOpen] = useState(false)

  const mayManage = can('employees.manage')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return employees.filter((e) => {
      if (q && ![e.name, e.nameAr, e.username, e.email].some((v) => v.toLowerCase().includes(q) || v.includes(query.trim()))) return false
      if (role !== 'all' && e.role !== role) return false
      if (status !== 'all' && e.status !== status) return false
      return true
    })
  }, [employees, query, role, status])

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: t('emp.name'),
      render: (e) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={e.name} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink-900">
              {locale === 'ar' ? e.nameAr : e.name}
            </span>
            <span className="block truncate text-xs text-ink-500" dir="ltr">{e.username}</span>
          </span>
        </span>
      ),
    },
    { key: 'email', header: t('auth.email'), render: (e) => <span className="text-xs text-ink-600" dir="ltr">{e.email}</span> },
    {
      key: 'role',
      header: t('emp.role'),
      render: (e) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-700">
          {e.role === 'platform_owner' && <ShieldCheck className="h-3.5 w-3.5 text-brand-600" aria-hidden />}
          {t(`role.${e.role}` as TranslationKey)}
        </span>
      ),
    },
    { key: 'department', header: t('emp.department'), render: (e) => <span className="text-ink-600">{locale === 'ar' ? e.departmentAr : e.department}</span> },
    { key: 'status', header: t('common.status'), render: (e) => <EmployeeStatusBadge status={e.status} /> },
    {
      key: 'lastLogin',
      header: t('emp.lastLogin'),
      render: (e) => (
        <span className="text-xs text-ink-500">
          {e.lastLoginAt ? formatRelative(e.lastLoginAt, locale) : t('emp.never')}
        </span>
      ),
    },
    { key: 'createdAt', header: t('emp.createdAt'), render: (e) => <span className="tnum text-xs text-ink-500">{formatDate(e.createdAt, locale)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (e) => {
        if (!mayManage) return null
        // Nobody can lock the platform owner out of their own platform
        const isSelf = user?.employeeId === e.id
        const protectedOwner = e.role === 'platform_owner'
        return (
          <span onClick={(ev) => ev.stopPropagation()}>
            <Button
              size="sm"
              variant="secondary"
              disabled={isSelf || protectedOwner}
              onClick={() => {
                const next = e.status === 'active' ? 'disabled' : 'active'
                dispatch({ type: 'setEmployeeStatus', employeeId: e.id, status: next })
                toast(next === 'active' ? t('emp.enabled') : t('emp.disabled'), next === 'active' ? 'success' : 'info')
              }}
            >
              {e.status === 'active' ? t('emp.disable') : t('emp.enable')}
            </Button>
          </span>
        )
      },
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('emp.title')}
        subtitle={t('emp.subtitle')}
        actions={
          mayManage && (
            <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setFormOpen(true)}>
              {t('emp.add')}
            </Button>
          )
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('emp.total')} value={formatNumber(employees.length, locale)} />
        <StatCard label={t('emp.active')} value={formatNumber(employees.filter((e) => e.status === 'active').length, locale)} tone="success" />
        <StatCard label={t('emp.recruiters')} value={formatNumber(employees.filter((e) => e.role === 'recruitment_admin').length, locale)} />
        <StatCard label={t('emp.disabledCount')} value={formatNumber(employees.filter((e) => e.status === 'disabled').length, locale)} />
      </div>

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t('common.search')}…`}
            aria-label={t('common.search')}
            className="w-full sm:w-64"
          />
          <SelectField label={t('emp.role')} value={role} onChange={(e) => setRole(e.target.value)} className="w-full sm:w-48">
            <option value="all">{t('common.all')}</option>
            {EMPLOYEE_ROLES.map((r) => (
              <option key={r} value={r}>{t(`role.${r}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            <option value="active">{t('empStatus.active')}</option>
            <option value="disabled">{t('empStatus.disabled')}</option>
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          onRowClick={(e) => navigate(`/admin/employees/${e.id}`)}
          stickyHeader
          emptyState={<EmptyState title={t('emp.empty')} icon={<UserCog className="h-6 w-6" />} />}
        />
      </Card>

      {formOpen && <EmployeeFormModal onClose={() => setFormOpen(false)} />}
    </div>
  )
}
