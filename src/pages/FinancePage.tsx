import { useMemo } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { PageHeader, Avatar } from '../components/ui/misc'
import { formatMoney, formatNumber } from '../lib/format'
import { chartColors } from '../lib/status'

export function FinancePage() {
  const { t, locale } = useI18n()
  const { revenueSeries, companies, drivers } = useAppState()

  const totals = useMemo(() => {
    const last = revenueSeries[revenueSeries.length - 1]
    const week = revenueSeries.slice(-7)
    const month = revenueSeries
    return {
      daily: last?.revenue ?? 0,
      weekly: week.reduce((s, p) => s + p.revenue, 0),
      monthly: month.reduce((s, p) => s + p.revenue, 0),
      commission: month.reduce((s, p) => s + p.commission, 0),
      payouts: month.reduce((s, p) => s + p.driverPayouts, 0),
      receivables: companies.reduce((s, c) => s + c.outstandingBalance, 0),
    }
  }, [revenueSeries, companies])

  const series = revenueSeries.map((p) => ({
    ...p,
    label: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { day: 'numeric', month: 'short' }).format(new Date(p.date)),
  }))

  const topSpenders = useMemo(
    () => [...companies].filter((c) => c.status === 'approved').sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 6),
    [companies],
  )
  const topEarners = useMemo(
    () => [...drivers].filter((d) => d.status === 'approved').sort((a, b) => b.earningsMonth - a.earningsMonth).slice(0, 6),
    [drivers],
  )
  const maxSpend = topSpenders[0]?.monthlyRevenue ?? 1
  const maxEarn = topEarners[0]?.earningsMonth ?? 1

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('finance.title')} subtitle={t('finance.subtitle')} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={t('finance.daily')} value={formatMoney(totals.daily, locale)} tone="brand" />
        <StatCard label={t('finance.weekly')} value={formatMoney(totals.weekly, locale)} />
        <StatCard label={t('finance.monthly')} value={formatMoney(totals.monthly, locale)} />
        <StatCard label={t('finance.totalCommission')} value={formatMoney(totals.commission, locale)} tone="success" />
        <StatCard label={t('finance.driverPayouts')} value={formatMoney(totals.payouts, locale)} />
        <StatCard label={t('finance.receivables')} value={formatMoney(totals.receivables, locale)} tone="danger" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title={t('finance.revenueOverTime')}>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="finRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.revenue} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartColors.revenue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartColors.axis }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={48} />
                <Tooltip formatter={(v) => formatMoney(Number(v), locale)} />
                <Area type="monotone" dataKey="revenue" name={t('nav.revenue')} stroke={chartColors.revenue} strokeWidth={2} fill="url(#finRev)" />
                <Area type="monotone" dataKey="commission" name={t('finance.totalCommission')} stroke={chartColors.commission} strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('finance.ordersOverTime')}>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartColors.axis }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={40} />
                <Tooltip formatter={(v) => formatNumber(Number(v), locale)} />
                <Bar dataKey="orders" name={t('nav.orders')} fill={chartColors.orders} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title={t('finance.companySpending')}>
          <ul className="space-y-3">
            {topSpenders.map((c) => (
              <li key={c.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-ink-800">
                    <Avatar name={c.name} size="sm" />
                    {locale === 'ar' ? c.nameAr : c.name}
                  </span>
                  <span className="tnum text-xs font-semibold text-ink-700">{formatMoney(c.monthlyRevenue, locale)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(c.monthlyRevenue / maxSpend) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('finance.driverEarnings')}>
          <ul className="space-y-3">
            {topEarners.map((d) => (
              <li key={d.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-ink-800">
                    <Avatar name={d.name} size="sm" />
                    {locale === 'ar' ? d.nameAr : d.name}
                  </span>
                  <span className="tnum text-xs font-semibold text-ink-700">{formatMoney(d.earningsMonth, locale)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-ink-600" style={{ width: `${(d.earningsMonth / maxEarn) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
