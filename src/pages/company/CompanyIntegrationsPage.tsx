import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, Check, Info, Link2, PlugZap, RefreshCw, Server, Unplug, Webhook,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/misc'
import { IntegrationStatusBadge } from '../../components/shared/StatusBadges'
import { ConnectIntegrationModal } from '../../features/integrations/ConnectIntegrationModal'
import { ApiAccessCard } from '../../features/integrations/ApiAccessCard'
import { integrationProviders, providerById } from '../../mocks/integrations'
import { formatNumber, formatRelative } from '../../lib/format'

// Two ways to get delivery visibility: connect the system the company
// already runs, or — when there is no such system — run the deliveries on
// Kassab itself. Both end in the same place: orders Kassab can see, and a
// driver moving on the tracking map.
export function CompanyIntegrationsPage() {
  const { t, locale } = useI18n()
  const { integrations, syncLogs, externalIdentities, dispatch } = useAppState()
  const { company, drivers } = useCompanyScope()
  const { toast } = useToast()
  const [connectOpen, setConnectOpen] = useState<'system' | 'kassab' | null>(null)

  const integration = useMemo(
    () => integrations.find((i) => i.companyId === company?.id && i.status !== 'disconnected'),
    [integrations, company],
  )
  const provider = integration ? providerById(integration.providerId) : undefined
  const isNative = integration?.method === 'native'
  const logs = useMemo(
    () => syncLogs.filter((l) => l.integrationId === integration?.id).slice(0, 12),
    [syncLogs, integration],
  )
  const linked = externalIdentities.filter((x) => x.companyId === company?.id)

  if (!company) return <EmptyState title={t('notFound.title')} />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('int.companyTitle')}
        subtitle={t('int.companySubtitle')}
        actions={integration && <IntegrationStatusBadge status={integration.status} />}
      />

      {!integration ? (
        // Nothing connected yet: offer both routes side by side, with the
        // no-system route stated plainly rather than buried.
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-brand-200">
            <div className="flex items-start gap-3">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Server className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-ink-950">{t('int.haveSystem')}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{t('int.haveSystemBody')}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {(['int.point1', 'int.point2', 'int.point3'] as TranslationKey[]).map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-ink-700">
                  <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {integrationProviders.filter((p) => p.kind !== 'kassab').map((p) => (
                <span key={p.id} className="rounded-md bg-ink-100 px-2 py-1 text-xs font-medium text-ink-700">
                  {locale === 'ar' ? p.nameAr : p.name}
                </span>
              ))}
            </div>
            <Button className="mt-4 w-full" onClick={() => setConnectOpen('system')}>
              {t('int.connectSystem')}
            </Button>
          </Card>

          <Card className="border-emerald-200">
            <div className="flex items-start gap-3">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <PlugZap className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-ink-950">{t('int.noSystem')}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{t('int.noSystemBody')}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {(['int.kassab1', 'int.kassab2', 'int.kassab3'] as TranslationKey[]).map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-ink-700">
                  <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-700">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('int.kassabNote')}
            </p>
            <Button variant="success" className="mt-4 w-full" onClick={() => setConnectOpen('kassab')}>
              {t('int.useKassab')}
            </Button>
          </Card>

          <div className="lg:col-span-2">
            <ApiAccessCard companyId={company.id} />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label={t('int.ordersToday')} value={formatNumber(integration.ordersToday, locale)} tone="brand" />
            <StatCard label={t('int.activeDrivers')} value={formatNumber(drivers.length, locale)} tone="success" />
            <StatCard
              label={t('int.lastSync')}
              value={integration.lastSyncAt ? formatRelative(integration.lastSyncAt, locale) : '—'}
            />
            <StatCard
              label={t('int.linkedDrivers')}
              value={isNative ? '—' : formatNumber(linked.filter((l) => l.status === 'linked').length, locale)}
              hint={isNative ? t('int.nativeNoLink') : undefined}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Card title={t('int.connection')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isNative ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'
                      }`}
                    >
                      {isNative ? <PlugZap className="h-5 w-5" /> : <Server className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink-950">
                        {locale === 'ar' ? provider?.nameAr : provider?.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {t(`intMethod.${integration.method}` as TranslationKey)}
                        {' · '}
                        {t(`intEnv.${integration.environment}` as TranslationKey)}
                      </p>
                    </div>
                  </div>
                  <IntegrationStatusBadge status={integration.status} />
                </div>

                {integration.errorMessageKey && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {t(integration.errorMessageKey as TranslationKey)}
                  </p>
                )}

                <dl className="mt-4 space-y-2 text-sm">
                  {integration.baseUrl && (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-ink-500">{t('int.baseUrl')}</dt>
                      <dd className="truncate font-mono text-xs text-ink-800" dir="ltr">{integration.baseUrl}</dd>
                    </div>
                  )}
                  {integration.maskedKey && (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-ink-500">{t('int.apiKey')}</dt>
                      <dd className="font-mono text-xs text-ink-800" dir="ltr">{integration.maskedKey}</dd>
                    </div>
                  )}
                  {integration.webhookUrl && (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="flex items-center gap-1.5 text-ink-500">
                        <Webhook className="h-3.5 w-3.5" aria-hidden />
                        {t('int.webhookUrl')}
                      </dt>
                      <dd className="truncate font-mono text-xs text-ink-800" dir="ltr">{integration.webhookUrl}</dd>
                    </div>
                  )}
                  {integration.connectedAt && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-500">{t('int.connectedOn')}</dt>
                      <dd className="text-ink-800">{formatRelative(integration.connectedAt, locale)}</dd>
                    </div>
                  )}
                </dl>

                {integration.maskedKey && (
                  <p className="mt-3 text-[11px] leading-relaxed text-ink-400">{t('int.secretNote')}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      dispatch({ type: 'testIntegration', integrationId: integration.id })
                      toast(t('int.testPassed'))
                    }}
                  >
                    {t('int.test')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RefreshCw className="h-3.5 w-3.5" aria-hidden />}
                    onClick={() => {
                      dispatch({ type: 'syncIntegration', integrationId: integration.id })
                      toast(t('int.synced'))
                    }}
                  >
                    {t('int.sync')}
                  </Button>
                  {isNative && (
                    <Link to="/company/orders">
                      <Button size="sm">{t('int.openOrders')}</Button>
                    </Link>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Unplug className="h-3.5 w-3.5" aria-hidden />}
                    onClick={() => {
                      dispatch({ type: 'disconnectIntegration', integrationId: integration.id })
                      toast(t('int.disconnected'), 'info')
                    }}
                  >
                    {t('int.disconnect')}
                  </Button>
                </div>
              </Card>

              <Card title={t('int.logs')} padded={false}>
                {logs.length === 0 ? (
                  <EmptyState title={t('int.noEvents')} icon={<Activity className="h-6 w-6" />} />
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {logs.map((log) => (
                      <li key={log.id} className="flex items-start gap-3 px-4 py-2.5">
                        <span
                          aria-hidden
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${log.ok ? 'bg-emerald-500' : 'bg-red-600'}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-ink-800">
                            {locale === 'ar' ? log.messageAr : log.message}
                          </span>
                          <span className="block text-xs text-ink-500">
                            {t(`intLog.${log.kind}` as TranslationKey)}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-ink-400">{formatRelative(log.at, locale)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <ApiAccessCard companyId={company.id} />

              {!isNative && (
                <Card title={t('int.driverLinks')}>
                  <p className="mb-3 text-xs leading-relaxed text-ink-500">{t('int.driverLinksNote')}</p>
                  {linked.length === 0 ? (
                    <EmptyState title={t('int.noLinks')} icon={<Link2 className="h-6 w-6" />} />
                  ) : (
                    <ul className="space-y-2">
                      {linked.slice(0, 8).map((l) => {
                        const driver = drivers.find((d) => d.id === l.kassabDriverId)
                        return (
                          <li key={l.kassabDriverId} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-ink-900">
                                {driver ? (locale === 'ar' ? driver.nameAr : driver.name) : l.externalName}
                              </span>
                              <span className="block font-mono text-[11px] text-ink-500" dir="ltr">
                                {driver?.code} → {l.externalDriverId}
                              </span>
                            </span>
                            <Badge tone={l.status === 'linked' ? 'success' : 'warning'}>
                              {t(`int.link.${l.status}` as TranslationKey)}
                            </Badge>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </Card>
              )}

              <Card title={t('int.whatKassabSees')}>
                <ul className="space-y-2 text-sm text-ink-700">
                  {(['int.sees1', 'int.sees2', 'int.sees3', 'int.sees4'] as TranslationKey[]).map((key) => (
                    <li key={key} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] leading-relaxed text-ink-400">{t('int.ownershipNote')}</p>
                <Link to="/company/workforce-tracking" className="mt-4 block">
                  <Button variant="secondary" className="w-full">{t('nav.workforceTracking')}</Button>
                </Link>
              </Card>
            </div>
          </div>
        </>
      )}

      {connectOpen && (
        <ConnectIntegrationModal
          companyId={company.id}
          mode={connectOpen}
          onClose={() => setConnectOpen(null)}
        />
      )}
    </div>
  )
}
