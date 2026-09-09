import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, PlugZap, RefreshCw, Settings2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useAuth } from '../../store/auth'
import { useLookups } from '../../hooks/useLookups'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { SelectField } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader } from '../../components/ui/misc'
import { IntegrationStatusBadge } from '../../components/shared/StatusBadges'
import { providerById } from '../../mocks/integrations'
import { formatNumber, formatRelative } from '../../lib/format'
import type { CompanyIntegration } from '../../types/domain'

// Kassab watches the health of every company connection, because a broken
// feed means the workforce it placed goes dark on the map.
export function AdminIntegrationsPage() {
  const { t, locale } = useI18n()
  const { companies, integrations, syncLogs, externalIdentities, dispatch } = useAppState()
  const { can } = useAuth()
  const { companyName } = useLookups()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [status, setStatus] = useState('all')

  const mayManage = can('integrations.manage')

  const filtered = useMemo(
    () => integrations.filter((i) => status === 'all' || i.status === status),
    [integrations, status],
  )

  const kpis = useMemo(() => ({
    connected: integrations.filter((i) => i.status === 'connected' || i.status === 'syncing').length,
    errors: integrations.filter((i) => i.status === 'error').length,
    native: integrations.filter((i) => i.method === 'native' && i.status !== 'disconnected').length,
    orders: integrations.reduce((s, i) => s + i.ordersToday, 0),
  }), [integrations])

  const unconnected = useMemo(
    () => companies.filter(
      (c) => !integrations.some((i) => i.companyId === c.id && i.status !== 'disconnected'),
    ),
    [companies, integrations],
  )

  const linkedFor = (integrationId: string) =>
    externalIdentities.filter((x) => x.integrationId === integrationId && x.status === 'linked').length

  const columns: Column<CompanyIntegration>[] = [
    {
      key: 'company',
      header: t('int.company'),
      render: (i) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={companyName(i.companyId)} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink-900">{companyName(i.companyId)}</span>
            <span className="block truncate text-xs text-ink-500">
              {locale === 'ar' ? providerById(i.providerId)?.nameAr : providerById(i.providerId)?.name}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'method',
      header: t('int.method'),
      render: (i) => (
        <Badge tone={i.method === 'native' ? 'brand' : 'neutral'}>
          {t(`intMethod.${i.method}` as TranslationKey)}
        </Badge>
      ),
    },
    { key: 'status', header: t('common.status'), render: (i) => <IntegrationStatusBadge status={i.status} /> },
    {
      key: 'lastSync',
      header: t('int.lastSync'),
      render: (i) => (
        <span className="text-xs text-ink-500">
          {i.lastSyncAt ? formatRelative(i.lastSyncAt, locale) : '—'}
        </span>
      ),
    },
    { key: 'orders', header: t('int.ordersToday'), align: 'end', render: (i) => <span className="tnum">{formatNumber(i.ordersToday, locale)}</span> },
    { key: 'linked', header: t('int.linkedDrivers'), align: 'center', render: (i) => <span className="tnum">{formatNumber(linkedFor(i.id), locale)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (i) => (
        <span onClick={(e) => e.stopPropagation()} className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'testIntegration', integrationId: i.id })
              toast(t('int.testPassed'))
            }}
          >
            {t('int.test')}
          </Button>
          {mayManage && i.status !== 'disconnected' && (
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => {
                dispatch({ type: 'syncIntegration', integrationId: i.id })
                toast(t('int.synced'))
              }}
            >
              {t('int.sync')}
            </Button>
          )}
          <Link to={`/admin/integrations/${i.companyId}`}>
            <Button size="sm" icon={<Settings2 className="h-3.5 w-3.5" aria-hidden />}>
              {t('int.setup')}
            </Button>
          </Link>
        </span>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('int.adminTitle')}
        subtitle={t('int.adminSubtitle')}
        actions={
          <SelectField label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            <option value="all">{t('common.all')}</option>
            {(['connected', 'syncing', 'error', 'disconnected'] as const).map((s) => (
              <option key={s} value={s}>{t(`intStatus.${s}` as TranslationKey)}</option>
            ))}
          </SelectField>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('int.connected')} value={formatNumber(kpis.connected, locale)} tone="success" />
        <StatCard label={t('int.onKassab')} value={formatNumber(kpis.native, locale)} tone="brand" hint={t('int.onKassabHint')} />
        <StatCard label={t('int.ordersReceived')} value={formatNumber(kpis.orders, locale)} />
        <StatCard
          label={t('int.failing')}
          value={formatNumber(kpis.errors, locale)}
          tone={kpis.errors > 0 ? 'danger' : 'default'}
        />
      </div>

      <Card padded={false} className="mb-4">
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(i) => i.id}
          onRowClick={(i) => navigate(`/admin/integrations/${i.companyId}`)}
          stickyHeader
          emptyState={<EmptyState title={t('int.empty')} icon={<PlugZap className="h-6 w-6" />} />}
        />
      </Card>

      <Card title={t('int.needSetup')} className="mb-4">
        <p className="mb-3 text-xs leading-relaxed text-ink-500">{t('int.needSetupHint')}</p>
        {unconnected.length === 0 ? (
          <EmptyState title={t('int.allConnected')} icon={<PlugZap className="h-6 w-6" />} />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {unconnected.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={companyName(c.id)} size="sm" />
                  <span className="truncate text-sm font-medium text-ink-900">{companyName(c.id)}</span>
                </span>
                <Link to={`/admin/integrations/${c.id}`} className="shrink-0">
                  <Button size="sm" variant="secondary" icon={<Settings2 className="h-3.5 w-3.5" aria-hidden />}>
                    {t('int.setup')}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title={t('int.recentEvents')}
        padded={false}
        actions={
          <Link to="/admin/workforce-tracking" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            {t('nav.workforceTracking')}
          </Link>
        }
      >
        <ul className="max-h-96 divide-y divide-ink-100 overflow-y-auto scroll-thin">
          {syncLogs.slice(0, 25).map((log) => {
            const integration = integrations.find((i) => i.id === log.integrationId)
            return (
              <li key={log.id} className="flex items-start gap-3 px-4 py-2.5">
                <span
                  aria-hidden
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${log.ok ? 'bg-emerald-500' : 'bg-red-600'}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink-800">
                    {locale === 'ar' ? log.messageAr : log.message}
                  </span>
                  <span className="block truncate text-xs text-ink-500">
                    {integration ? companyName(integration.companyId) : log.integrationId}
                    {' · '}
                    {t(`intLog.${log.kind}` as TranslationKey)}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-ink-400">{formatRelative(log.at, locale)}</span>
              </li>
            )
          })}
          {syncLogs.length === 0 && (
            <li className="px-4 py-6">
              <EmptyState title={t('int.noEvents')} icon={<Activity className="h-6 w-6" />} />
            </li>
          )}
        </ul>
      </Card>
    </div>
  )
}
