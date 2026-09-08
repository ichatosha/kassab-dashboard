import { useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { SearchInput, SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader, Pagination } from '../../components/ui/misc'
import { usePagination } from '../../hooks/usePagination'
import { formatDate, formatRelative } from '../../lib/format'
import type { AuditLogEntry } from '../../types/domain'

// Who changed what, and when. Several Kassab staff share the platform, so
// every sensitive action is attributable.
export function AuditLogPage() {
  const { t, locale } = useI18n()
  const { auditLog, employees } = useAppState()

  const [query, setQuery] = useState('')
  const [actor, setActor] = useState('all')
  const [entity, setEntity] = useState('all')

  const entities = useMemo(
    () => Array.from(new Set(auditLog.map((a) => a.entity))).sort(),
    [auditLog],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return auditLog.filter((a) => {
      if (q && ![a.entityLabel, a.entityLabelAr, a.actorName, a.action].some((v) => v.toLowerCase().includes(q) || v.includes(query.trim()))) return false
      if (actor !== 'all' && a.actorId !== actor) return false
      if (entity !== 'all' && a.entity !== entity) return false
      return true
    })
  }, [auditLog, query, actor, entity])

  const { page, setPage, pageCount, pageRows, total, pageSize } = usePagination(filtered, 15)

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'actor',
      header: t('audit.actor'),
      render: (a) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={a.actorName} size="sm" />
          <span className="text-sm font-medium text-ink-900">
            {locale === 'ar' ? a.actorNameAr : a.actorName}
          </span>
        </span>
      ),
    },
    {
      key: 'action',
      header: t('audit.action'),
      render: (a) => (
        <span className="text-sm text-ink-800">{t(`audit.${a.action}` as TranslationKey)}</span>
      ),
    },
    {
      key: 'entity',
      header: t('audit.entity'),
      render: (a) => (
        <span className="min-w-0">
          <span className="block truncate text-sm text-ink-700">
            {locale === 'ar' ? a.entityLabelAr : a.entityLabel}
          </span>
          <span className="block truncate font-mono text-[11px] text-ink-400">{a.entityId}</span>
        </span>
      ),
    },
    {
      key: 'at',
      header: t('audit.when'),
      render: (a) => (
        <span className="text-xs text-ink-500">
          <span className="block">{formatRelative(a.at, locale)}</span>
          <span className="tnum block text-ink-400">{formatDate(a.at, locale)}</span>
        </span>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('audit.title')} subtitle={t('audit.subtitle')} />

      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t('common.search')}…`}
            aria-label={t('common.search')}
            className="w-full sm:w-64"
          />
          <SelectField label={t('audit.actor')} value={actor} onChange={(e) => setActor(e.target.value)} className="w-full sm:w-52">
            <option value="all">{t('common.all')}</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{locale === 'ar' ? e.nameAr : e.name}</option>
            ))}
          </SelectField>
          <SelectField label={t('audit.entity')} value={entity} onChange={(e) => setEntity(e.target.value)} className="w-full sm:w-44">
            <option value="all">{t('common.all')}</option>
            {entities.map((e) => (
              <option key={e} value={e}>{t(`audit.entity.${e}` as TranslationKey)}</option>
            ))}
          </SelectField>
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(a) => a.id}
          stickyHeader
          emptyState={<EmptyState title={t('audit.empty')} icon={<ScrollText className="h-6 w-6" />} />}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
      </Card>
    </div>
  )
}
