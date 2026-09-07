import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BadgeCheck, MapPin, OctagonPause, Phone } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import {
  Avatar, MotorcycleBadge, ProgressBar, RatingStars, Tabs, VerifiedMark,
} from '../components/ui/misc'
import {
  ApplicationBadge, CompanyBadge, InvoiceBadge, RequestBadge,
} from '../components/shared/StatusBadges'
import { formatDate, formatMoney, formatNumber, formatPeriod } from '../lib/format'
import { cityName } from '../lib/geo'
import type { Application, Driver, Invoice, WorkforceRequest } from '../types/domain'

export function CompanyDetailsPage() {
  const { id } = useParams()
  const { t, locale, dir } = useI18n()
  const { companies, requests, applications, drivers, invoices, dispatch } = useAppState()
  const { driverById, driverName, contactName } = useLookups()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')

  const company = companies.find((c) => c.id === id)
  const companyRequests = useMemo(() => requests.filter((r) => r.companyId === id), [requests, id])
  const companyApplications = useMemo(() => applications.filter((a) => a.companyId === id), [applications, id])
  const workforce = useMemo(
    () => drivers.filter((d) => d.employment?.companyId === id),
    [drivers, id],
  )
  const companyInvoices = useMemo(() => invoices.filter((i) => i.companyId === id), [invoices, id])

  if (!company) {
    return (
      <EmptyState
        title={t('notFound.title')}
        action={<Link to="/admin/companies" className="text-sm font-medium text-brand-600">{t('nav.companies')}</Link>}
      />
    )
  }

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft
  const remaining = Math.max(0, company.driversRequired - company.driversHired)
  const kassabFee = Math.round(company.monthlyWorkforceCost * company.kassabFeeRate)
  const pendingCandidates = companyApplications.filter(
    (a) => !['hired', 'rejected', 'withdrawn'].includes(a.status),
  ).length
  const activeRequests = companyRequests.filter((r) =>
    ['open', 'reviewing', 'partially_filled'].includes(r.status),
  ).length

  const requestColumns: Column<WorkforceRequest>[] = [
    { key: 'number', header: t('wfr.number'), render: (r) => <span className="tnum font-semibold" dir="ltr">{r.number}</span> },
    { key: 'salary', header: t('wfr.salary'), align: 'end', render: (r) => <span className="tnum">{formatMoney(r.salary, locale)}</span> },
    {
      key: 'progress',
      header: `${t('wfr.hired')} / ${t('wfr.required')}`,
      render: (r) => (
        <span className="block w-24">
          <span className="tnum text-xs text-ink-700">
            {formatNumber(r.driversHired, locale)} / {formatNumber(r.driversRequired, locale)}
          </span>
          <span className="mt-1 block"><ProgressBar value={r.driversHired} max={r.driversRequired} /></span>
        </span>
      ),
    },
    { key: 'area', header: t('common.area'), render: (r) => <span className="text-ink-600">{locale === 'ar' ? r.areaAr : r.area}</span> },
    { key: 'status', header: t('common.status'), render: (r) => <RequestBadge status={r.status} /> },
    { key: 'deadline', header: t('wfr.deadline'), render: (r) => <span className="tnum text-xs text-ink-500">{formatDate(r.deadline, locale)}</span> },
  ]

  const workforceColumns: Column<Driver>[] = [
    {
      key: 'driver',
      header: t('drivers.name'),
      render: (d) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={d.name} size="sm" />
          <span className="font-medium text-ink-900">{locale === 'ar' ? d.nameAr : d.name}</span>
        </span>
      ),
    },
    { key: 'moto', header: t('moto.category'), render: (d) => <MotorcycleBadge motorcycle={d.motorcycle} /> },
    { key: 'rating', header: t('common.rating'), render: (d) => <RatingStars value={d.performance.rating} /> },
    { key: 'salary', header: t('drivers.salary'), align: 'end', render: (d) => <span className="tnum font-medium">{d.employment ? formatMoney(d.employment.salary, locale) : '—'}</span> },
    { key: 'start', header: t('drivers.startDate'), render: (d) => <span className="tnum text-xs text-ink-500">{d.employment ? formatDate(d.employment.startDate, locale) : '—'}</span> },
  ]

  const applicationColumns: Column<Application>[] = [
    { key: 'number', header: t('apps.number'), render: (a) => <span className="tnum font-semibold" dir="ltr">{a.number}</span> },
    {
      key: 'applicant',
      header: t('apps.applicant'),
      render: (a) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={driverById.get(a.driverId)?.name ?? '—'} size="sm" />
          <span className="font-medium text-ink-900">{driverName(a.driverId)}</span>
        </span>
      ),
    },
    { key: 'rating', header: t('apps.rating'), render: (a) => <RatingStars value={driverById.get(a.driverId)?.performance.rating ?? 0} /> },
    { key: 'applied', header: t('apps.applied'), render: (a) => <span className="tnum text-xs text-ink-500">{formatDate(a.appliedAt, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (a) => <ApplicationBadge status={a.status} /> },
  ]

  const invoiceColumns: Column<Invoice>[] = [
    { key: 'number', header: t('invoices.number'), render: (i) => <span className="tnum font-semibold" dir="ltr">{i.number}</span> },
    { key: 'period', header: t('salaries.period'), render: (i) => <span className="text-ink-600">{formatPeriod(i.period, locale)}</span> },
    { key: 'drivers', header: t('invoices.drivers'), align: 'center', render: (i) => <span className="tnum">{formatNumber(i.driversCount, locale)}</span> },
    { key: 'salaries', header: t('invoices.salaries'), align: 'end', render: (i) => <span className="tnum">{formatMoney(i.salaries, locale)}</span> },
    { key: 'fees', header: t('invoices.fees'), align: 'end', render: (i) => <span className="tnum text-brand-700">{formatMoney(i.kassabFees, locale)}</span> },
    { key: 'total', header: t('common.total'), align: 'end', render: (i) => <span className="tnum font-medium">{formatMoney(i.total, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (i) => <InvoiceBadge status={i.status} /> },
  ]

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <BackIcon className="h-4 w-4" aria-hidden />
        {t('nav.companies')}
      </button>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={company.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg font-bold text-ink-950">{locale === 'ar' ? company.nameAr : company.name}</h1>
              <Badge tone="info">{t(`biz.${company.type}` as TranslationKey)}</Badge>
              <CompanyBadge status={company.status} />
              <VerifiedMark verified={company.verified} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span>{contactName(company.id)}</span>
              <span className="tnum flex items-center gap-1" dir="ltr"><Phone className="h-3 w-3" aria-hidden />{company.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{company.address}</span>
              <span>{cityName(company.city, locale)}</span>
            </p>
          </div>
          {company.status === 'active' ? (
            <Button
              variant="secondary"
              icon={<OctagonPause className="h-4 w-4" aria-hidden />}
              onClick={() => {
                dispatch({ type: 'setCompanyStatus', companyId: company.id, status: 'suspended' })
                toast(t('companies.suspended'), 'info')
              }}
            >
              {t('companies.suspend')}
            </Button>
          ) : (
            <Button
              variant="success"
              icon={<BadgeCheck className="h-4 w-4" aria-hidden />}
              onClick={() => {
                dispatch({ type: 'setCompanyStatus', companyId: company.id, status: 'active' })
                toast(t('companies.approved'))
              }}
            >
              {t('companies.approve')}
            </Button>
          )}
        </div>
      </Card>

      {/* Hiring overview */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label={t('companies.required')} value={formatNumber(company.driversRequired, locale)} />
        <StatCard label={t('companies.hired')} value={formatNumber(company.driversHired, locale)} tone="success" />
        <StatCard label={t('companies.open')} value={formatNumber(remaining, locale)} tone={remaining > 0 ? 'brand' : 'default'} />
        <StatCard label={t('companies.pendingCandidates')} value={formatNumber(pendingCandidates, locale)} />
        <StatCard label={t('companies.cost')} value={formatMoney(company.monthlyWorkforceCost, locale)} />
        <StatCard label={t('companies.totalObligation')} value={formatMoney(company.monthlyWorkforceCost + kassabFee, locale)} tone="brand" hint={`+ ${formatMoney(kassabFee, locale)} ${t('companies.kassabFee')}`} />
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: t('companies.overview') },
          { id: 'requests', label: t('companies.requests') },
          { id: 'workforce', label: t('companies.workforce') },
          { id: 'applications', label: t('companies.applicationsTab') },
          { id: 'financials', label: t('companies.financials') },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {tab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t('companies.hiringOverview')}>
              <div className="mb-4">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-ink-600">{t('opp.progress')}</span>
                  <span className="tnum font-semibold text-ink-900">
                    {formatNumber(company.driversHired, locale)} / {formatNumber(company.driversRequired, locale)}
                  </span>
                </div>
                <div className="mt-2"><ProgressBar value={company.driversHired} max={company.driversRequired} tone="emerald" /></div>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.activeRequests')}</dt><dd className="tnum font-medium">{formatNumber(activeRequests, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('wfr.applications')}</dt><dd className="tnum font-medium">{formatNumber(companyApplications.length, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.pendingCandidates')}</dt><dd className="tnum font-medium">{formatNumber(pendingCandidates, locale)}</dd></div>
              </dl>
            </Card>

            <Card title={t('companies.overview')}>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.type')}</dt><dd><Badge tone="info">{t(`biz.${company.type}` as TranslationKey)}</Badge></dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.contact')}</dt><dd className="font-medium">{contactName(company.id)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('auth.email')}</dt><dd className="font-medium" dir="ltr">{company.email}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('common.city')}</dt><dd className="font-medium">{cityName(company.city, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.kassabFee')}</dt><dd className="tnum font-medium">{Math.round(company.kassabFeeRate * 100)}%</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.registered')}</dt><dd className="tnum font-medium">{formatDate(company.registeredAt, locale)}</dd></div>
              </dl>
            </Card>
          </div>
        )}

        {tab === 'requests' && (
          <Card title={t('companies.requests')} padded={false}>
            <DataTable
              columns={requestColumns}
              rows={companyRequests}
              rowKey={(r) => r.id}
              onRowClick={(r) => navigate(`/admin/opportunities/${r.id}`)}
              emptyState={<EmptyState title={t('companies.noRequests')} />}
            />
          </Card>
        )}

        {tab === 'workforce' && (
          <Card title={t('companies.workforce')} padded={false}>
            <DataTable
              columns={workforceColumns}
              rows={workforce}
              rowKey={(d) => d.id}
              onRowClick={(d) => navigate(`/admin/drivers/profile/${d.id}`)}
              emptyState={<EmptyState title={t('companies.noWorkforce')} />}
            />
          </Card>
        )}

        {tab === 'applications' && (
          <Card title={t('companies.applicationsTab')} padded={false}>
            <DataTable
              columns={applicationColumns}
              rows={companyApplications}
              rowKey={(a) => a.id}
              onRowClick={(a) => navigate(`/admin/applications?open=${a.id}`)}
              emptyState={<EmptyState title={t('apps.empty')} />}
            />
          </Card>
        )}

        {tab === 'financials' && (
          <Card title={t('nav.invoices')} padded={false}>
            <DataTable
              columns={invoiceColumns}
              rows={companyInvoices}
              rowKey={(i) => i.id}
              emptyState={<EmptyState title={t('invoices.empty')} />}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
