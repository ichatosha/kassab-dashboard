import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightCircle, Briefcase, Phone, UserCheck, XCircle } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Avatar, MotorcycleBadge, RatingStars } from '../../components/ui/misc'
import { ApplicationBadge } from '../../components/shared/StatusBadges'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useLookups } from '../../hooks/useLookups'
import { useToast } from '../../components/ui/Toast'
import { formatDateTime, formatMoney, formatNumber, formatPercent } from '../../lib/format'
import { applicationKey, nextStage } from '../../lib/status'
import { cityName } from '../../lib/geo'
import type { Application } from '../../types/domain'

function Row({ label, value, ltr }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className={`text-sm font-medium text-ink-900 ${ltr ? 'tnum' : ''}`} dir={ltr ? 'ltr' : undefined}>
        {value}
      </dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{title}</h3>
      {children}
    </section>
  )
}

export function ApplicationDrawer({ application, onClose }: { application: Application | null; onClose: () => void }) {
  const { t, locale } = useI18n()
  const { dispatch } = useAppState()
  const { driverById, requestById, companyName } = useLookups()
  const { toast } = useToast()
  const [confirmReject, setConfirmReject] = useState(false)

  if (!application) return null

  const driver = driverById.get(application.driverId)
  const request = requestById.get(application.requestId)
  const next = nextStage(application.status)
  const decided = ['rejected', 'withdrawn', 'hired'].includes(application.status)

  const move = (status: Application['status']) => {
    dispatch({ type: 'setApplicationStatus', applicationId: application.id, status })
    toast(status === 'hired' ? t('apps.hiredToast') : t('apps.statusChanged'))
  }

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        wide
        label={`${t('apps.details')} ${application.number}`}
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span className="tnum text-base font-bold text-ink-950">{application.number}</span>
            <ApplicationBadge status={application.status} />
          </div>
        }
        footer={
          <div className="flex flex-wrap items-center gap-2">
            {next && !decided && (
              <Button
                size="sm"
                variant={next === 'hired' ? 'success' : 'primary'}
                icon={next === 'hired' ? <UserCheck className="h-4 w-4" aria-hidden /> : <ArrowRightCircle className="h-4 w-4" aria-hidden />}
                onClick={() => move(next)}
              >
                {next === 'hired' ? t('apps.hire') : `${t('apps.advance')}: ${t(applicationKey(next))}`}
              </Button>
            )}
            {!decided && (
              <Button size="sm" variant="danger" icon={<XCircle className="h-4 w-4" aria-hidden />} onClick={() => setConfirmReject(true)}>
                {t('apps.reject')}
              </Button>
            )}
            {driver && (
              <Link
                to={`/admin/drivers/profile/${driver.id}`}
                className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-surface px-3 text-xs font-medium text-ink-800 ring-1 ring-inset ring-ink-200 transition-colors hover:bg-ink-50"
              >
                {t('apps.viewProfile')}
              </Link>
            )}
          </div>
        }
      >
        {driver && (
          <Section title={t('apps.candidate')}>
            <div className="flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3">
              <Avatar name={driver.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-ink-950">{locale === 'ar' ? driver.nameAr : driver.name}</p>
                <p className="tnum flex items-center gap-1 text-xs text-ink-500" dir="ltr">
                  <Phone className="h-3 w-3" aria-hidden />
                  {driver.phone}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <RatingStars value={driver.performance.rating} count={driver.performance.ratingCount} />
                  <MotorcycleBadge motorcycle={driver.motorcycle} />
                </div>
              </div>
            </div>
            <dl className="mt-2 rounded-xl border border-ink-100 px-4 py-2">
              <Row label={t('drivers.age')} value={formatNumber(driver.age, locale)} ltr />
              <Row label={t('common.address')} value={driver.address} />
              <Row label={t('common.city')} value={cityName(driver.city, locale)} />
              <Row label={t('drivers.successRate')} value={formatPercent(driver.performance.deliverySuccessRate, locale)} ltr />
              <Row label={t('drivers.completedDeliveries')} value={formatNumber(driver.performance.completedDeliveries, locale)} ltr />
              <Row label={t('drivers.experience')} value={`${formatNumber(driver.performance.experienceYears, locale)} ${t('common.years')}`} ltr />
            </dl>
          </Section>
        )}

        <Section title={t('apps.appliedFor')}>
          <div className="rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{companyName(application.companyId)}</p>
                <p className="text-xs text-ink-500">
                  {request ? (locale === 'ar' ? request.positionAr : request.position) : '—'}
                </p>
              </div>
              {request && (
                <Link
                  to={`/admin/opportunities/${request.id}`}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <Briefcase className="h-3.5 w-3.5" aria-hidden />
                  {t('apps.viewOpportunity')}
                </Link>
              )}
            </div>
            {request && (
              <dl className="mt-2">
                <Row label={t('apps.salary')} value={formatMoney(request.salary, locale)} ltr />
                <Row label={t('common.area')} value={locale === 'ar' ? request.areaAr : request.area} />
                <Row label={t('wfr.employmentType')} value={t(`emp.${request.employmentType}` as TranslationKey)} />
              </dl>
            )}
          </div>
        </Section>

        <Section title={t('apps.details')}>
          <dl className="rounded-xl border border-ink-100 px-4 py-2">
            <Row label={t('apps.applied')} value={formatDateTime(application.appliedAt, locale)} ltr />
            <Row label={t('apps.updated')} value={formatDateTime(application.updatedAt, locale)} ltr />
            <Row label={t('apps.availability')} value={t(`emp.${application.availability}` as TranslationKey)} />
            <Row label={t('apps.preferredArea')} value={application.preferredArea} />
          </dl>
          {(application.note || application.noteAr) && (
            <div className="mt-2 rounded-xl bg-ink-50 px-4 py-3">
              <p className="text-xs font-medium text-ink-400">{t('apps.note')}</p>
              <p className="mt-1 text-sm text-ink-700">
                {locale === 'ar' ? application.noteAr ?? application.note : application.note}
              </p>
            </div>
          )}
        </Section>
      </Drawer>

      <ConfirmDialog
        open={confirmReject}
        title={t('apps.rejectConfirmTitle')}
        body={t('apps.rejectConfirmBody')}
        danger
        confirmLabel={t('apps.reject')}
        onConfirm={() => move('rejected')}
        onClose={() => setConfirmReject(false)}
      />
    </>
  )
}
