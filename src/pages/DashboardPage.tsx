import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Banknote, Building2, CheckCircle2, ClipboardList,
  Percent, Users, Wifi, XCircle, Wallet,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader, Avatar } from '../components/ui/misc'
import { OrderStatusBadge } from '../components/shared/StatusBadges'
import { formatMoney, formatNumber, formatRelative, formatTime } from '../lib/format'
import { ACTIVE_STATUSES, chartColors } from '../lib/status'
import type { Order } from '../types/domain'

const DAY_MS = 86400000

export function DashboardPage() {
  const { t, locale } = useI18n()
  const { drivers, companies, orders, revenueSeries } = useAppState()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const isToday = (iso: string) => new Date(iso).getTime() >= todayStart - DAY_MS / 4
    const todays = orders.filter((o) => isToday(o.createdAt))
    const completed = todays.filter((o) => o.status === 'delivered' || o.status === 'closed')
    const cancelled = todays.filter((o) => o.status === 'cancelled')
    const revenue = completed.reduce((s, o) => s + o.deliveryFee, 0)
    const commission = completed.reduce((s, o) => s + o.kassabCommission, 0)
    return {
      totalDrivers: drivers.filter((d) => d.status === 'approved').length,
      online: drivers.filter((d) => d.connection === 'online').length,
      activeCompanies: companies.filter((c) => c.status === 'approved').length,
      todayOrders: todays.length,
      completed: completed.length,
      cancelled: cancelled.length,
      revenue,
      commission,
      outstanding: companies.reduce((s, c) => s + c.outstandingBalance, 0),
      delivering: drivers.filter((d) => d.activity === 'delivering').length,
      assigned: orders.filter((o) => o.status === 'assigned').length,
      failed: todays.filter((o) => o.status === 'failed').length,
      delayed: orders.filter((o) => ACTIVE_STATUSES.includes(o.status) && Date.now() - new Date(o.createdAt).getTime() > 90 * 60000).length,
      pendingApprovals: drivers.filter((d) => d.status === 'pending_review').length,
    }
  }, [drivers, companies, orders])

  const attention = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            o.status === 'new' ||
            o.status === 'address_problem' ||
            o.status === 'customer_unavailable' ||
            (ACTIVE_STATUSES.includes(o.status) && Date.now() - new Date(o.createdAt).getTime() > 90 * 60000),
        )
        .slice(0, 6),
    [orders],
  )

  const urgency = (o: Order): { key: 'dash.urgency.critical' | 'dash.urgency.warning' | 'dash.urgency.normal'; tone: 'danger' | 'warning' | 'neutral' } => {
    if (o.status === 'address_problem' || o.status === 'customer_unavailable') return { key: 'dash.urgency.critical', tone: 'danger' }
    const ageMins = (Date.now() - new Date(o.createdAt).getTime()) / 60000
    if (o.status === 'new' && ageMins > 15) return { key: 'dash.urgency.critical', tone: 'danger' }
    if (o.status === 'new' || ageMins > 90) return { key: 'dash.urgency.warning', tone: 'warning' }
    return { key: 'dash.urgency.normal', tone: 'neutral' }
  }

  const trend = revenueSeries.slice(-14).map((p) => ({
    ...p,
    label: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { day: 'numeric', month: 'short' }).format(new Date(p.date)),
  }))

  const statusDistribution = useMemo(() => {
    const groups: { name: string; value: number; color: string }[] = [
      { name: t('status.delivered'), value: orders.filter((o) => o.status === 'delivered' || o.status === 'closed').length, color: '#059669' },
      { name: t('dash.liveOps'), value: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length, color: '#4f46e5' },
      { name: t('status.cancelled'), value: orders.filter((o) => o.status === 'cancelled').length, color: '#dc2626' },
      { name: t('status.failed'), value: orders.filter((o) => ['failed', 'address_problem', 'customer_unavailable'].includes(o.status)).length, color: '#d97706' },
    ]
    return groups.filter((g) => g.value > 0)
  }, [orders, t])

  const topCompanies = useMemo(
    () => [...companies].filter((c) => c.status === 'approved').sort((a, b) => b.monthlyOrders - a.monthlyOrders).slice(0, 5),
    [companies],
  )
  const maxVolume = topCompanies[0]?.monthlyOrders ?? 1

  const recent = orders.slice(0, 7)
  const companyName = (id: string) => {
    const c = companies.find((x) => x.id === id)
    return c ? (locale === 'ar' ? c.nameAr : c.name) : '—'
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('dash.title')}
        subtitle={t('dash.subtitle')}
        actions={
          <Badge tone="success" dot pulse>
            {formatNumber(stats.online, locale)} {t('dash.driversOnline')}
          </Badge>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label={t('dash.totalDrivers')} value={formatNumber(stats.totalDrivers, locale)} icon={<Users className="h-4 w-4" />} />
        <StatCard label={t('dash.onlineDrivers')} value={formatNumber(stats.online, locale)} tone="success" icon={<Wifi className="h-4 w-4" />} />
        <StatCard label={t('dash.activeCompanies')} value={formatNumber(stats.activeCompanies, locale)} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label={t('dash.todayOrders')} value={formatNumber(stats.todayOrders, locale)} icon={<ClipboardList className="h-4 w-4" />} hint={`${formatNumber(stats.completed, locale)} ${t('dash.completedOrders')} · ${formatNumber(stats.cancelled, locale)} ${t('dash.cancelledOrders')}`} />
        <StatCard label={t('dash.todayRevenue')} value={formatMoney(stats.revenue, locale)} tone="brand" icon={<Banknote className="h-4 w-4" />} />
        <StatCard label={t('dash.commission')} value={formatMoney(stats.commission, locale)} icon={<Percent className="h-4 w-4" />} />
        <StatCard label={t('dash.outstanding')} value={formatMoney(stats.outstanding, locale)} tone="danger" icon={<Wallet className="h-4 w-4" />} />
        <StatCard label={t('dash.completedOrders')} value={formatNumber(stats.completed, locale)} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label={t('dash.cancelledOrders')} value={formatNumber(stats.cancelled, locale)} icon={<XCircle className="h-4 w-4" />} />
        <StatCard label={t('dash.pendingApprovals')} value={formatNumber(stats.pendingApprovals, locale)} tone={stats.pendingApprovals > 0 ? 'danger' : 'default'} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      {/* Attention + live ops */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title={t('dash.attention')} className="lg:col-span-2" padded={false}>
          {attention.length === 0 ? (
            <EmptyState title={t('dash.attentionEmpty')} icon={<CheckCircle2 className="h-6 w-6" />} />
          ) : (
            <ul className="divide-y divide-ink-100">
              {attention.map((o) => {
                const u = urgency(o)
                return (
                  <li key={o.id}>
                    <button
                      className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-start transition-colors hover:bg-brand-50/40"
                      onClick={() => navigate(`/orders?open=${o.id}`)}
                    >
                      <Badge tone={u.tone}>{t(u.key)}</Badge>
                      <span className="tnum text-sm font-semibold text-ink-900">{o.number}</span>
                      <span className="text-sm text-ink-600">{companyName(o.companyId)}</span>
                      <OrderStatusBadge status={o.status} />
                      <span className="ms-auto text-xs text-ink-400">{formatRelative(o.createdAt, locale)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card title={t('dash.liveOps')} padded={false}>
          <ul className="divide-y divide-ink-100 text-sm">
            {[
              { label: t('dash.assigned'), value: stats.assigned, to: '/orders?status=assigned' },
              { label: t('dash.delivering'), value: stats.delivering, to: '/tracking' },
              { label: t('dash.failed'), value: stats.failed, to: '/orders?status=failed' },
              { label: t('dash.delayed'), value: stats.delayed, to: '/orders' },
              { label: t('dash.pendingApprovals'), value: stats.pendingApprovals, to: '/approvals' },
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
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title={t('dash.revenueTrend')} className="lg:col-span-2">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.revenue} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartColors.revenue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} width={44} />
                <Tooltip formatter={(v) => formatMoney(Number(v), locale)} labelStyle={{ fontWeight: 600 }} />
                <Area type="monotone" dataKey="revenue" name={t('nav.revenue')} stroke={chartColors.revenue} strokeWidth={2} fill="url(#rev)" />
                <Area type="monotone" dataKey="commission" name={t('dash.commission')} stroke={chartColors.commission} strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('dash.ordersByStatus')}>
          <div className="h-48" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                  {statusDistribution.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatNumber(Number(v), locale)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {statusDistribution.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-xs text-ink-600">
                <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="flex-1">{s.name}</span>
                <span className="tnum font-semibold text-ink-900">{formatNumber(s.value, locale)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Top companies + recent orders */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title={t('dash.topCompanies')}>
          <ul className="space-y-3">
            {topCompanies.map((c) => (
              <li key={c.id}>
                <Link to={`/companies/${c.id}`} className="group block cursor-pointer">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 font-medium text-ink-800 group-hover:text-brand-700">
                      <Avatar name={c.name} size="sm" />
                      {locale === 'ar' ? c.nameAr : c.name}
                    </span>
                    <span className="tnum text-xs text-ink-500">
                      {formatNumber(c.monthlyOrders, locale)} {t('common.orders')}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${(c.monthlyOrders / maxVolume) * 100}%` }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title={t('dash.recentOrders')}
          className="lg:col-span-2"
          padded={false}
          actions={
            <Link to="/orders" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              {t('dash.viewOrders')}
            </Link>
          }
        >
          <ul className="divide-y divide-ink-100">
            {recent.map((o) => (
              <li key={o.id}>
                <button
                  className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-start transition-colors hover:bg-brand-50/40"
                  onClick={() => navigate(`/orders?open=${o.id}`)}
                >
                  <span className="tnum text-sm font-semibold text-ink-900">{o.number}</span>
                  <span className="hidden text-sm text-ink-600 sm:block">{companyName(o.companyId)}</span>
                  <OrderStatusBadge status={o.status} />
                  <span className="ms-auto tnum text-sm font-medium text-ink-800">{formatMoney(o.deliveryFee, locale)}</span>
                  <span className="tnum w-14 text-end text-xs text-ink-400">{formatTime(o.createdAt, locale)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
