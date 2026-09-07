import { useMemo } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Avatar, PageHeader, ProgressBar } from '../components/ui/misc'
import { formatMoney, formatNumber, formatPeriod, formatPercent } from '../lib/format'
import { chartColors } from '../lib/status'

export function RevenuePage() {
  const { t, locale } = useI18n()
  const { revenueSeries, companies, payments } = useAppState()

  const current = revenueSeries[revenueSeries.length - 1]

  const totals = useMemo(() => {
    const feeRate = companies[0]?.kassabFeeRate ?? 0.125
    const collected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.total, 0)
    return {
      monthly: current?.kassabRevenue ?? 0,
      salaryVolume: current?.salaryVolume ?? 0,
      companyPayments: current?.companyPayments ?? 0,
      collected,
      feeRate,
    }
  }, [current, companies, payments])

  const series = revenueSeries.map((p) => ({ ...p, label: formatPeriod(p.month, locale) }))

  // Revenue attributable to each company = its workforce cost × fee rate
  const byCompany = useMemo(
    () =>
      [...companies]
        .filter((c) => c.monthlyWorkforceCost > 0)
        .map((c) => ({ ...c, revenue: Math.round(c.monthlyWorkforceCost * c.kassabFeeRate) }))
        .sort((a, b) => b.revenue - a.revenue),
    [companies],
  )
  const maxRevenue = byCompany[0]?.revenue ?? 1

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('revenue.title')} subtitle={t('revenue.subtitle')} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label={t('revenue.monthly')} value={formatMoney(totals.monthly, locale)} tone="brand" />
        <StatCard label={t('revenue.salaryVolume')} value={formatMoney(totals.salaryVolume, locale)} />
        <StatCard label={t('revenue.companyPayments')} value={formatMoney(totals.companyPayments, locale)} />
        <StatCard label={t('payments.collected')} value={formatMoney(totals.collected, locale)} tone="success" />
        <StatCard label={t('revenue.feeRate')} value={formatPercent(totals.feeRate * 100, locale)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title={t('revenue.overTime')}>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.revenue} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartColors.revenue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={52} />
                <Tooltip formatter={(v) => formatMoney(Number(v), locale)} />
                <Area type="monotone" dataKey="kassabRevenue" name={t('revenue.title')} stroke={chartColors.revenue} strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('revenue.volumeOverTime')}>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.salary} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartColors.salary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={56} />
                <Tooltip formatter={(v) => formatMoney(Number(v), locale)} />
                <Area type="monotone" dataKey="salaryVolume" name={t('revenue.salaryVolume')} stroke={chartColors.salary} strokeWidth={2} fill="url(#vol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title={t('revenue.hiresOverTime')}>
          <div className="h-56" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                <Tooltip formatter={(v) => formatNumber(Number(v), locale)} />
                <Bar dataKey="hires" name={t('dash.hiredDrivers')} fill={chartColors.hires} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('revenue.byCompany')}>
          <ul className="space-y-3">
            {byCompany.map((c) => (
              <li key={c.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-ink-800">
                    <Avatar name={c.name} size="sm" />
                    {locale === 'ar' ? c.nameAr : c.name}
                  </span>
                  <span className="tnum text-xs font-semibold text-ink-700">{formatMoney(c.revenue, locale)}</span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar value={c.revenue} max={maxRevenue} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
