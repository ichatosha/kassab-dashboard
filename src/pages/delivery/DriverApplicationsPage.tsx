import { Link } from 'react-router-dom'
import { Check, FileText } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useDriverScope } from '../../hooks/usePortalScope'
import { useLookups } from '../../hooks/useLookups'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar, PageHeader } from '../../components/ui/misc'
import { ApplicationBadge } from '../../components/shared/StatusBadges'
import { formatDate, formatMoney, formatRelative } from '../../lib/format'
import { cityName } from '../../lib/geo'
import { PIPELINE_STAGES, applicationKey } from '../../lib/status'
import type { ApplicationStatus } from '../../types/domain'

// Each application shows how far it has travelled, because "where am I in
// the process" is the only question this screen exists to answer.
function StageTrail({ status }: { status: ApplicationStatus }) {
  const { t } = useI18n()
  if (status === 'rejected' || status === 'withdrawn') {
    return <p className="text-xs text-ink-500">{t(applicationKey(status))}</p>
  }
  const current = PIPELINE_STAGES.indexOf(status)
  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {PIPELINE_STAGES.map((stage, i) => {
        const done = i <= current
        return (
          <li key={stage} className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                done ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-400'
              }`}
            >
              {done && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
              {t(applicationKey(stage))}
            </span>
            {i < PIPELINE_STAGES.length - 1 && <span aria-hidden className="text-ink-300">·</span>}
          </li>
        )
      })}
    </ol>
  )
}

export function DriverApplicationsPage() {
  const { t, locale } = useI18n()
  const { applications, requests } = useDriverScope()
  const { companyName } = useLookups()

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('driver.myApplicationsTitle')} subtitle={t('driver.myApplicationsSub')} />

      {applications.length === 0 ? (
        <Card>
          <EmptyState
            title={t('driver.noApplications')}
            hint={t('driver.noApplicationsHint')}
            icon={<FileText className="h-6 w-6" />}
            action={<Link to="/delivery/jobs"><Button size="sm">{t('driver.findJobs')}</Button></Link>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => {
            const request = requests.find((r) => r.id === a.requestId)
            return (
              <Card key={a.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={companyName(a.companyId)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-950">{companyName(a.companyId)}</p>
                      <p className="tnum text-xs text-ink-500">
                        {a.number} · {formatRelative(a.appliedAt, locale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApplicationBadge status={a.status} />
                    {request && (
                      <Link to={`/delivery/jobs/${request.id}`}>
                        <Button variant="secondary" size="sm">{t('driver.viewJob')}</Button>
                      </Link>
                    )}
                  </div>
                </div>

                {request && (
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-ink-500">{t('opp.salary')}</dt>
                      <dd className="tnum mt-0.5 font-semibold text-brand-700">{formatMoney(request.salary, locale)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">{t('common.city')}</dt>
                      <dd className="mt-0.5 font-medium text-ink-900">{cityName(request.city, locale)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">{t('apps.applied')}</dt>
                      <dd className="tnum mt-0.5 font-medium text-ink-900">{formatDate(a.appliedAt, locale)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">{t('apps.updated')}</dt>
                      <dd className="tnum mt-0.5 font-medium text-ink-900">{formatDate(a.updatedAt, locale)}</dd>
                    </div>
                  </dl>
                )}

                <div className="mt-3 border-t border-ink-100 pt-3">
                  <StageTrail status={a.status} />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
