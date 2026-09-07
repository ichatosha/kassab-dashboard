import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Banknote, Briefcase, Building2, CheckCircle2, FileText,
  Percent, TrendingUp, UserCheck, Users, Wallet,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader, Avatar, ProgressBar } from '../components/ui/misc'
import { ApplicationBadge } from '../components/shared/StatusBadges'
import { formatMoney, formatNumber, formatPeriod, formatRelative } from '../lib/format'
import { chartColors, OPEN_REQUEST_STATUSES, PIPELINE_STAGES, applicationKey } from '../lib/status'
import { cityName } from '../lib/geo'

const DAY = 86400000

interface AttentionItem {
  id: string
  labelKey: TranslationKey
  tone: 'danger' | 'warning'
  title: string
  detail: string
  to: string
  at?: string
}

export function DashboardPage() {
  const { t, locale } = useI18n()
  const { drivers, companies, requests, applications, payments, payouts, revenueSeries } = useAppState()
  const { companyName, driverName } = useLookups()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const openRequests = requests.filter((r) => OPEN_REQUEST_STATUSES.includes(r.status))
    const openPositions = openRequests.reduce((s, r) => s + Math.max(0, r.driversRequired - r.driversHired), 0)
    const filledPositions = requests.reduce((s, r) => s + r.driversHired, 0)
    const hiredDrivers = drivers.filter((d) => d.status === 'hired')
    const salaryVolume = hiredDrivers.reduce((s, d) => s + (d.employment?.salary ?? 0), 0)
    const currentPayments = payments.filter((p) => p.period === payments[0]?.period)

    return {
      totalDrivers: drivers.length,
      available: drivers.filter((d) => d.status === 'available').length,
      hired: hiredDrivers.length,
      totalCompanies: companies.length,
      activeCompanies: companies.filter((c) => c.status === 'active').length,
      openOpportunities: openRequests.length,
      openPositions,
      filledPositions,
      newApplications: applications.filter((a) => a.status === 'new').length,
      hiredThisMonth: drivers.filter(
        (d) => d.employment && new Date(d.employment.startDate).getTime() >= monthStart.getTime(),
      ).length,
      salaryVolume,
      kassabRevenue: Math.round(salaryVolume * 0.125),
      companyPayments: currentPayments.reduce((s, p) => s + p.total, 0),
      driverPayouts: payouts.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.net, 0),
      outstanding: payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.total, 0),
      companiesHiring: companies.filter((c) => c.driversHired < c.driversRequired && c.status === 'active').length,
      pendingVerification: drivers.filter((d) => d.status === 'under_review').length,
      recentlyRegistered: drivers.filter((d) => Date.now() - new Date(d.registeredAt).getTime() < 7 * DAY).length,
    }
  }, [drivers, companies, requests, applications, payments, payouts])

  // Everything an operator must act on today, ranked by urgency
  const attention = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = []
    payments
      .filter((p) => p.status === 'overdue')
      .forEach((p) =>
        items.push({
          id: p.id,
          labelKey: 'dash.attention.overdue',
          tone: 'danger',
          title: companyName(p.companyId),
          detail: `${formatMoney(p.total, locale)} · ${formatPeriod(p.period, locale)}`,
          to: '/payments',
        }),
      )
    requests
      .filter((r) => OPEN_REQUEST_STATUSES.includes(r.status) && new Date(r.deadline).getTime() - Date.now() < 10 * DAY)
      .forEach((r) =>
        items.push({
          id: r.id,
          labelKey: 'dash.attention.deadline',
          tone: 'warning',
          title: `${r.number} · ${companyName(r.companyId)}`,
          detail: `${formatNumber(Math.max(0, r.driversRequired - r.driversHired), locale)} ${t('opp.remaining')}`,
          to: `/opportunities/${r.id}`,
          at: r.deadline,
        }),
      )
    applications
      .filter((a) => a.status === 'new' && Date.now() - new Date(a.appliedAt).getTime() > 2 * DAY)
      .slice(0, 3)
      .forEach((a) =>
        items.push({
          id: a.id,
          labelKey: 'dash.attention.stale',
          tone: 'warning',
          title: a.number,
          detail: companyName(a.companyId),
          to: `/applications?open=${a.id}`,
          at: a.appliedAt,
        }),
      )
    drivers
      .filter((d) => d.status === 'under_review')
      .slice(0, 2)
      .forEach((d) =>
        items.push({
          id: d.id,
          labelKey: 'dash.attention.verify',
          tone: 'warning',
          title: locale === 'ar' ? d.nameAr : d.name,
          detail: cityName(d.city, locale),
          to: `/drivers/profile/${d.id}`,
          at: d.registeredAt,
        }),
      )
    return items.slice(0, 7)
  }, [payments, requests, applications, drivers, companyName, locale, t])

  const pipelineCounts = useMemo(
    () => PIPELINE_STAGES.map((stage) => ({
      stage,
      count: applications.filter((a) => a.status === stage).length,
    })),
    [applications],
  )
  const pipelineMax = Math.max(1, ...pipelineCounts.map((p) => p.count))

  const topDemand = useMemo(
    () =>
      [...companies]
        .filter((c) => c.driversRequired > 0)
        .sort((a, b) => (b.driversRequired - b.driversHired) - (a.driversRequired - a.driversHired))
        .slice(0, 5),
    [companies],
  )

  const trend = revenueSeries.map((p) => ({
    ...p,
    label: formatPeriod(p.month, locale),
  }))

  const latestApplications = applications.slice(0, 6)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('dash.title')}
        subtitle={t('dash.subtitle')}
        actions={
          <Badge tone="success" dot pulse>
            {formatNumber(stats.available, locale)} {t('dash.availableDrivers')}
          </Badge>
        }
      />

      {/* Workforce KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label={t('dash.totalDrivers')} value={formatNumber(stats.totalDrivers, locale)} icon={<Users className="h-4 w-4" />} />
        <StatCard label={t('dash.availableDrivers')} value={formatNumber(stats.available, locale)} tone="success" icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label={t('dash.hiredDrivers')} value={formatNumber(stats.hired, locale)} tone="brand" icon={<UserCheck className="h-4 w-4" />} />
        <StatCard label={t('dash.activeCompanies')} value={formatNumber(stats.activeCompanies, locale)} icon={<Building2 className="h-4 w-4" />} hint={`${formatNumber(stats.totalCompanies, locale)} ${t('dash.totalCompanies').toLowerCase()}`} />
        <StatCard label={t('dash.openOpportunities')} value={formatNumber(stats.openOpportunities, locale)} icon={<Briefcase className="h-4 w-4" />} hint={`${formatNumber(stats.openPositions, locale)} ${t('dash.openPositions').toLowerCase()}`} />
        <StatCard label={t('dash.newApplications')} value={formatNumber(stats.newApplications, locale)} tone={stats.newApplications > 0 ? 'brand' : 'default'} icon={<FileText className="h-4 w-4" />} />
        <StatCard label={t('dash.hiredThisMonth')} value={formatNumber(stats.hiredThisMonth, locale)} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label={t('dash.salaryVolume')} value={formatMoney(stats.salaryVolume, locale)} icon={<Banknote className="h-4 w-4" />} />
        <StatCard label={t('dash.kassabRevenue')} value={formatMoney(stats.kassabRevenue, locale)} tone="brand" icon={<Percent className="h-4 w-4" />} />
        <StatCard label={t('dash.outstanding')} value={formatMoney(stats.outstanding, locale)} tone={stats.outstanding > 0 ? 'danger' : 'default'} icon={<Wallet className="h-4 w-4" />} />
      </div>

      {/* Operations centre */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title={t('dash.needsAttention')} className="lg:col-span-2" padded={false}>
          {attention.length === 0 ? (
            <EmptyState title={t('dash.attentionEmpty')} icon={<CheckCircle2 className="h-6 w-6" />} />
          ) : (
            <ul className="divide-y divide-ink-100">
              {attention.map((item) => (
                <li key={`${item.labelKey}-${item.id}`}>
                  <button
                    className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-start transition-colors hover:bg-brand-50/40"
                    onClick={() => navigate(item.to)}
                  >
                    <Badge tone={item.tone}>{t(item.labelKey)}</Badge>
                    <span className="text-sm font-semibold text-ink-900">{item.title}</span>
                    <span className="text-sm text-ink-600">{item.detail}</span>
                    {item.at && <span className="ms-auto text-xs text-ink-400">{formatRelative(item.at, locale)}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={t('dash.pipeline')} padded={false}>
          <ul className="divide-y divide-ink-100">
            {pipelineCounts.map(({ stage, count }) => (
              <li key={stage}>
                <Link to={`/applications?status=${stage}`} className="block cursor-pointer px-4 py-2.5 transition-colors hover:bg-ink-50">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-ink-600">{t(applicationKey(stage))}</span>
                    <span className="tnum font-semibold text-ink-900">{formatNumber(count, locale)}</span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={count} max={pipelineMax} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Supply and demand */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title={t('dash.companyDemand')} padded={false}>
          <ul className="divide-y divide-ink-100 text-sm">
            {[
              { label: t('dash.companiesHiring'), value: stats.companiesHiring, to: '/companies/hiring' },
              { label: t('dash.openPositions'), value: stats.openPositions, to: '/opportunities' },
              { label: t('dash.filledPositions'), value: stats.filledPositions, to: '/drivers/hired' },
              { label: t('dash.openOpportunities'), value: stats.openOpportunities, to: '/requests' },
            ].map((row) => (
              <li key={row.label}>
                <Link to={row.to} className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-ink-50">
                  <span className="text-ink-600">{row.label}</span>
                  <span className="tnum font-semibold text-ink-900">{formatNumber(row.value, locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('dash.driverSupply')} padded={false}>
          <ul className="divide-y divide-ink-100 text-sm">
            {[
              { label: t('dash.availableDrivers'), value: stats.available, to: '/drivers/available' },
              { label: t('dash.hiredDrivers'), value: stats.hired, to: '/drivers/hired' },
              { label: t('dash.pendingVerification'), value: stats.pendingVerification, to: '/drivers?status=under_review' },
              { label: t('dash.recentlyRegistered'), value: stats.recentlyRegistered, to: '/drivers' },
            ].map((row) => (
              <li key={row.label}>
                <Link to={row.to} className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-ink-50">
                  <span className="text-ink-600">{row.label}</span>
                  <span className="tnum font-semibold text-ink-900">{formatNumber(row.value, locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('dash.topDemand')}>
          <ul className="space-y-3">
            {topDemand.map((c) => {
              const remaining = Math.max(0, c.driversRequired - c.driversHired)
              return (
                <li key={c.id}>
                  <Link to={`/companies/${c.id}`} className="group block cursor-pointer">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-medium text-ink-800 group-hover:text-brand-700">
                        <Avatar name={c.name} size="sm" />
                        {locale === 'ar' ? c.nameAr : c.name}
                      </span>
                      <span className="tnum text-xs text-ink-500">
                        {formatNumber(c.driversHired, locale)} / {formatNumber(c.driversRequired, locale)}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={c.driversHired} max={c.driversRequired} />
                    </div>
                    <p className="tnum mt-1 text-[11px] text-ink-400">
                      {formatNumber(remaining, locale)} {t('opp.remaining')}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      {/* Financial trend + latest candidates */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title={t('dash.revenueTrend')} className="lg:col-span-2">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.salary} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={chartColors.salary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={52} />
                <Tooltip formatter={(v) => formatMoney(Number(v), locale)} labelStyle={{ fontWeight: 600 }} />
                <Area type="monotone" dataKey="salaryVolume" name={t('revenue.salaryVolume')} stroke={chartColors.salary} strokeWidth={2} fill="url(#volume)" />
                <Area type="monotone" dataKey="kassabRevenue" name={t('dash.kassabRevenue')} stroke={chartColors.revenue} strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
            <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors.salary }} />{t('revenue.salaryVolume')}</span>
            <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors.revenue }} />{t('dash.kassabRevenue')}</span>
          </div>
        </Card>

        <Card
          title={t('dash.latestApplications')}
          padded={false}
          actions={
            <Link to="/applications" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              {t('dash.viewAll')}
            </Link>
          }
        >
          <ul className="divide-y divide-ink-100">
            {latestApplications.map((a) => (
              <li key={a.id}>
                <button
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-start transition-colors hover:bg-brand-50/40"
                  onClick={() => navigate(`/applications?open=${a.id}`)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-900">
                      {driverName(a.driverId)}
                    </span>
                    <span className="block truncate text-xs text-ink-500">{companyName(a.companyId)}</span>
                  </span>
                  <ApplicationBadge status={a.status} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-ink-400">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        {t('brand.descriptor')}
      </p>
    </div>
  )
}
