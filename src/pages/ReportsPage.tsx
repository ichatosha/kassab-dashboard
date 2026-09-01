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
import { PageHeader, Tabs, Avatar } from '../components/ui/misc'
import { formatMoney, formatNumber, formatPercent } from '../lib/format'
import { chartColors } from '../lib/status'
import type { Company, Driver } from '../types/domain'

type Range = 'daily' | 'weekly' | 'monthly'

export function ReportsPage() {
  const { t, locale } = useI18n()
  const { revenueSeries, drivers, companies, orders } = useAppState()
  const { toast } = useToast()
  const [range, setRange] = useState<Range>('weekly')
  const [category, setCategory] = useState('orders')

  const windowed = useMemo(() => {
    const days = range === 'daily' ? 1 : range === 'weekly' ? 7 : 30
    return revenueSeries.slice(-days)
  }, [revenueSeries, range])

  const series = windowed.map((p) => ({
    ...p,
    label: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { day: 'numeric', month: 'short' }).format(new Date(p.date)),
  }))

  const stats = useMemo(() => {
    const totalOrders = windowed.reduce((s, p) => s + p.orders, 0)
    const revenue = windowed.reduce((s, p) => s + p.revenue, 0)
    const failed = orders.filter((o) => ['failed', 'address_problem', 'customer_unavailable'].includes(o.status)).length
    return {
      totalOrders,
      revenue,
      failureRate: orders.length ? (failed / orders.length) * 100 : 0,
      avgDelivery: 36,
    }
  }, [windowed, orders])

  const driverColumns: Column<Driver>[] = [
    { key: 'name', header: t('drivers.name'), render: (d) => (
      <span className="flex items-center gap-2"><Avatar name={d.name} size="sm" />{locale === 'ar' ? d.nameAr : d.name}</span>
    ) },
    { key: 'completed', header: t('drivers.completed'), align: 'end', render: (d) => <span className="tnum">{formatNumber(d.completedOrders, locale)}</span> },
    { key: 'rating', header: t('common.rating'), align: 'end', render: (d) => <span className="tnum">{d.rating.toFixed(1)}</span> },
    { key: 'earnings', header: t('drivers.earnings'), align: 'end', render: (d) => <span className="tnum font-medium">{formatMoney(d.earningsMonth, locale)}</span> },
  ]

  const companyColumns: Column<Company>[] = [
    { key: 'name', header: t('companies.name'), render: (c) => (
      <span className="flex items-center gap-2"><Avatar name={c.name} size="sm" />{locale === 'ar' ? c.nameAr : c.name}</span>
    ) },
    { key: 'orders', header: t('companies.monthlyOrders'), align: 'end', render: (c) => <span className="tnum">{formatNumber(c.monthlyOrders, locale)}</span> },
    { key: 'success', header: t('companies.successRate'), align: 'end', render: (c) => <span className="tnum text-emerald-700">{formatPercent(c.successRate, locale)}</span> },
    { key: 'revenue', header: t('companies.revenue'), align: 'end', render: (c) => <span className="tnum font-medium">{formatMoney(c.monthlyRevenue, locale)}</span> },
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['daily', 'weekly', 'monthly'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
              range === r ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50'
            }`}
          >
            {t(`reports.range.${r}`)}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('nav.orders')} value={formatNumber(stats.totalOrders, locale)} />
        <StatCard label={t('reports.totalRevenue')} value={formatMoney(stats.revenue, locale)} tone="brand" />
        <StatCard label={t('reports.failureRate')} value={formatPercent(stats.failureRate, locale)} tone="danger" />
        <StatCard label={t('reports.avgDeliveryTime')} value={`${formatNumber(stats.avgDelivery, locale)} ${t('common.min')}`} />
      </div>

      <Tabs
        tabs={[
          { id: 'orders', label: t('reports.cat.orders') },
          { id: 'revenue', label: t('reports.cat.revenue') },
          { id: 'drivers', label: t('reports.cat.drivers') },
          { id: 'companies', label: t('reports.cat.companies') },
        ]}
        active={category}
        onChange={setCategory}
      />

      <div className="mt-4">
        {category === 'orders' && (
          <Card title={t('finance.ordersOverTime')}>
            <div className="h-72" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v) => formatNumber(Number(v), locale)} />
                  <Bar dataKey="orders" name={t('nav.orders')} fill={chartColors.orders} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        {category === 'revenue' && (
          <Card title={t('finance.commissionOverTime')}>
            <div className="h-72" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={48} />
                  <Tooltip formatter={(v) => formatMoney(Number(v), locale)} />
                  <Line type="monotone" dataKey="revenue" name={t('nav.revenue')} stroke={chartColors.revenue} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="commission" name={t('dash.commission')} stroke={chartColors.commission} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="driverPayouts" name={t('finance.driverPayouts')} stroke={chartColors.payouts} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors.revenue }} />{t('nav.revenue')}</span>
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors.commission }} />{t('dash.commission')}</span>
              <span className="flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: chartColors.payouts }} />{t('finance.driverPayouts')}</span>
            </div>
          </Card>
        )}
        {category === 'drivers' && (
          <Card title={t('reports.cat.drivers')} padded={false}>
            <DataTable
              columns={driverColumns}
              rows={[...drivers].filter((d) => d.status === 'approved').sort((a, b) => b.completedOrders - a.completedOrders)}
              rowKey={(d) => d.id}
            />
          </Card>
        )}
        {category === 'companies' && (
          <Card title={t('reports.cat.companies')} padded={false}>
            <DataTable
              columns={companyColumns}
              rows={[...companies].filter((c) => c.status === 'approved').sort((a, b) => b.monthlyOrders - a.monthlyOrders)}
              rowKey={(c) => c.id}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
