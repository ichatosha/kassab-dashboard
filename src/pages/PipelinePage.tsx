import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Columns3 } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { SelectField } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, RatingStars } from '../components/ui/misc'
import { formatMoney, formatNumber, formatRelative } from '../lib/format'
import { PIPELINE_STAGES, applicationKey, applicationTone, toneClasses } from '../lib/status'
import type { Application, ApplicationStatus } from '../types/domain'

export function PipelinePage() {
  const { t, locale, dir } = useI18n()
  const { applications, companies, dispatch } = useAppState()
  const { driverById, requestById, driverName, companyName } = useLookups()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [companyId, setCompanyId] = useState('all')

  const scoped = useMemo(
    () => applications.filter((a) => companyId === 'all' || a.companyId === companyId),
    [applications, companyId],
  )

  const byStage = useMemo(() => {
    const map = new Map<ApplicationStatus, Application[]>()
    PIPELINE_STAGES.forEach((s) => map.set(s, []))
    scoped.forEach((a) => {
      if (map.has(a.status)) map.get(a.status)!.push(a)
    })
    return map
  }, [scoped])

  const move = (application: Application, direction: 1 | -1) => {
    const index = PIPELINE_STAGES.indexOf(application.status)
    const target = PIPELINE_STAGES[index + direction]
    if (!target) return
    dispatch({ type: 'setApplicationStatus', applicationId: application.id, status: target })
    toast(target === 'hired' ? t('apps.hiredToast') : t('apps.statusChanged'))
  }

  // In RTL the visual "forward" arrow points left
  const ForwardIcon = dir === 'rtl' ? ChevronLeft : ChevronRight
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('pipeline.title')}
        subtitle={t('pipeline.subtitle')}
        actions={
          <SelectField
            label={t('pipeline.filterCompany')}
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-52"
          >
            <option value="all">{t('common.all')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{locale === 'ar' ? c.nameAr : c.name}</option>
            ))}
          </SelectField>
        }
      />

      {/* Stages scroll sideways on small screens, snapping column by column */}
      <div className="snap-x snap-mandatory overflow-x-auto scroll-thin pb-2">
        <div className="grid min-w-[62rem] grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const items = byStage.get(stage) ?? []
            const isFirst = PIPELINE_STAGES.indexOf(stage) === 0
            const isLast = PIPELINE_STAGES.indexOf(stage) === PIPELINE_STAGES.length - 1
            return (
              <section key={stage} className="flex snap-start flex-col rounded-xl border border-ink-200/80 bg-ink-50/50">
                <header className="flex items-center justify-between gap-2 border-b border-ink-200/70 px-3 py-2.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${toneClasses[applicationTone[stage]]}`}>
                    {t(applicationKey(stage))}
                  </span>
                  <span className="tnum text-xs font-semibold text-ink-500">{formatNumber(items.length, locale)}</span>
                </header>
                <div className="flex-1 space-y-2 p-2">
                  {items.length === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-ink-400">{t('pipeline.empty')}</p>
                  )}
                  {items.map((a) => {
                    const driver = driverById.get(a.driverId)
                    const request = requestById.get(a.requestId)
                    return (
                      <article key={a.id} className="rounded-lg border border-ink-200 bg-surface p-2.5 shadow-card">
                        <button
                          className="flex w-full cursor-pointer items-center gap-2 text-start"
                          onClick={() => navigate(`/applications?open=${a.id}`)}
                        >
                          <Avatar name={driver?.name ?? '—'} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-ink-900">{driverName(a.driverId)}</span>
                            <span className="block truncate text-[11px] text-ink-500">{companyName(a.companyId)}</span>
                          </span>
                        </button>
                        <div className="mt-2 flex items-center justify-between gap-1">
                          {driver && <RatingStars value={driver.performance.rating} />}
                          {request && (
                            <span className="tnum text-[11px] font-medium text-ink-600">
                              {formatMoney(request.salary, locale)}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-1 border-t border-ink-100 pt-2">
                          <span className="text-[10px] text-ink-400">{formatRelative(a.updatedAt, locale)}</span>
                          <span className="flex gap-1">
                            <button
                              onClick={() => move(a, -1)}
                              disabled={isFirst}
                              aria-label={t('pipeline.moveBack')}
                              title={t('pipeline.moveBack')}
                              className="cursor-pointer rounded p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <BackIcon className="h-3.5 w-3.5" aria-hidden />
                            </button>
                            <button
                              onClick={() => move(a, 1)}
                              disabled={isLast}
                              aria-label={t('pipeline.moveNext')}
                              title={t('pipeline.moveNext')}
                              className="cursor-pointer rounded p-1 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ForwardIcon className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </span>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {scoped.length === 0 && (
        <Card className="mt-4">
          <EmptyState title={t('apps.empty')} icon={<Columns3 className="h-6 w-6" />} />
        </Card>
      )}
    </div>
  )
}
