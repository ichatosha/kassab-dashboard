import { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { Avatar, PageHeader, ProgressBar, RatingStars, Tabs } from '../components/ui/misc'
import { formatMoney, formatNumber, formatPercent, formatPeriod } from '../lib/format'
import { chartColors, PIPELINE_STAGES, applicationKey } from '../lib/status'
import type { Company, Driver } from '../types/domain'

export function ReportsPage() {
  const { t, locale } = useI18n()
  const { applications, drivers, companies, requests, revenueSeries } = useAppState()
  const { toast } = useToast()
  const [tab, setTab] = useState('hiring')

  const stats = useMemo(() => {
    const hired = applications.filter((a) => a.status === 'hired')
    const decided = applications.filter((a) => ['hired', 'rejected', 'withdrawn'].includes(a.status))
    const required = requests.reduce((s, r) => s + r.driversRequired, 0)
    const filled = requests.reduce((s, r) => s + r.driversHired, 0)
    const rated = drivers.filter((d) => d.performance.rating > 0)
    // Average days between application and hire, from the demo timeline
    const avgHiringTime = hired.length
      ? Math.round(
          hired.reduce((s, a) => s + (new Date(a.updatedAt).getTime() - new Date(a.appliedAt).getTime()), 0) /
            hired.length /
            86400000,
        )
      : 0
    return {
      applications: applications.length,
      hired: hired.length,
      hiringRate: decided.length ? (hired.length / decided.length) * 100 : 0,
      filled,
      unfilled: Math.max(0, required - filled),
      avgHiringTime,
      avgRating: rated.length ? rated.reduce((s, d) => s + d.performance.rating, 0) / rated.length : 0,
      avgSuccess: rated.length ? rated.reduce((s, d) => s + d.performance.deliverySuccessRate, 0) / rated.length : 0,
    }
  }, [applications, drivers, requests])

  const byStage = useMemo(
    () => PIPELINE_STAGES.map((s) => ({
      label: t(applicationKey(s)),
      count: applications.filter((a) => a.status === s).length,
    })),
    [applications, t],
  )

  const series = revenueSeries.map((p) => ({ ...p, label: formatPeriod(p.month, locale) }))

  const driverColumns: Column<Driver>[] = [
    {
      key: 'name',
      header: t('drivers.name'),
      render: (d) => (
        <span className="flex items-center gap-2">
          <Avatar name={d.name} size="sm" />
          {locale === 'ar' ? d.nameAr : d.name}
        </span>
      ),
    },
    { key: 'rating', header: t('common.rating'), render: (d) => <RatingStars value={d.performance.rating} /> },
    { key: 'success', header: t('drivers.successRate'), align: 'end', render: (d) => <span className="tnum text-emerald-700">{formatPercent(d.performance.deliverySuccessRate, locale)}</span> },
    { key: 'completed', header: t('drivers.completedDeliveries'), align: 'end', render: (d) => <span className="tnum">{formatNumber(d.performance.completedDeliveries, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (d) => <span className="text-ink-600">{t(`driverStatus.${d.status}` as Parameters<typeof t>[0])}</span> },
  ]

  const companyColumns: Column<Company>[] = [
    {
      key: 'name',
      header: t('companies.name'),
      render: (c) => (
        <span className="flex items-center gap-2">
          <Avatar name={c.name} size="sm" />
          {locale === 'ar' ? c.nameAr : c.name}
        </span>
      ),
    },
    { key: 'hired', header: t('companies.hired'), align: 'end', render: (c) => <span className="tnum">{formatNumber(c.driversHired, locale)}</span> },
    { key: 'required', header: t('companies.required'), align: 'end', render: (c) => <span className="tnum">{formatNumber(c.driversRequired, locale)}</span> },
    {
      key: 'progress',
      header: t('opp.progress'),
      render: (c) => (
        <span className="block w-24"><ProgressBar value={c.driversHired} max={c.driversRequired} /></span>
      ),
    },
    { key: 'cost', header: t('companies.cost'), align: 'end', render: (c) => <span className="tnum font-medium">{formatMoney(c.monthlyWorkforceCost, locale)}</span> },
  ]

  const exportToast = () => toast(t('reports.exportNote'), 'info')

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" aria-hidden />} onClick={exportToast}>
              {t('reports.exportCsv')}
            </Button>
            <Button variant="secondary" size="sm" icon={<FileText className="h-4 w-4" aria-hidden />} onClick={exportToast}>
              {t('reports.exportPdf')}
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('reports.applications')} value={formatNumber(stats.applications, locale)} />
        <StatCard label={t('reports.hiringRate')} value={formatPercent(stats.hiringRate, locale)} tone="success" />
        <StatCard label={t('reports.filled')} value={formatNumber(stats.filled, locale)} hint={`${formatNumber(stats.unfilled, locale)} ${t('reports.unfilled').toLowerCase()}`} />
        <StatCard label={t('reports.avgHiringTime')} value={`${formatNumber(stats.avgHiringTime, locale)} ${t('reports.days')}`} />
      </div>

      <Tabs
        tabs={[
          { id: 'hiring', label: t('reports.cat.hiring') },
          { id: 'drivers', label: t('reports.cat.drivers') },
          { id: 'companies', label: t('reports.cat.companies') },
          { id: 'financial', label: t('reports.cat.financial') },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {tab === 'hiring' && (
          <Card title={t('reports.byStage')}>
            <div className="h-72" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStage} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                  <Tooltip formatter={(v) => formatNumber(Number(v), locale)} />
                  <Bar dataKey="count" name={t('nav.applications')} fill={chartColors.hires} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {tab === 'drivers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label={t('dash.totalDrivers')} value={formatNumber(drivers.length, locale)} />
              <StatCard label={t('dash.availableDrivers')} value={formatNumber(drivers.filter((d) => d.status === 'available').length, locale)} tone="success" />
              <StatCard label={t('reports.avgRating')} value={stats.avgRating.toFixed(1)} />
              <StatCard label={t('reports.avgSuccess')} value={formatPercent(stats.avgSuccess, locale)} />
            </div>
            <Card title={t('reports.topDrivers')} padded={false}>
              <DataTable
                columns={driverColumns}
                rows={[...drivers].filter((d) => d.performance.rating > 0).sort((a, b) => b.performance.rating - a.performance.rating)}
                rowKey={(d) => d.id}
              />
            </Card>
          </div>
        )}

        {tab === 'companies' && (
          <Card title={t('reports.topCompanies')} padded={false}>
            <DataTable
              columns={companyColumns}
              rows={[...companies].sort((a, b) => b.driversHired - a.driversHired)}
              rowKey={(c) => c.id}
            />
          </Card>
        )}

        {tab === 'financial' && (
          <Card title={t('reports.financialSummary')}>
            <div className="h-72" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={56} />
                  <Tooltip formatter={(v) => formatMoney(Number(v), locale)} />
                  <Line type="monotone" dataKey="salaryVolume" name={t('revenue.salaryVolume')} stroke={chartColors.salary} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="companyPayments" name={t('revenue.companyPayments')} stroke={chartColors.payments} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="kassabRevenue" name={t('revenue.title')} stroke={chartColors.revenue} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors.salary }} />{t('revenue.salaryVolume')}</span>
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors.payments }} />{t('revenue.companyPayments')}</span>
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors.revenue }} />{t('revenue.title')}</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
