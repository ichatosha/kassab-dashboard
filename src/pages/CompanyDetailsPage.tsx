import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BadgeCheck, OctagonPause, Phone } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, Tabs } from '../components/ui/misc'
import { DriverApprovalBadge, InvoiceStatusBadge, OrderStatusBadge } from '../components/shared/StatusBadges'
import { formatDateTime, formatMoney, formatNumber, formatPercent } from '../lib/format'
import { cityName, profileName } from '../lib/geo'
import type { Branch, Invoice, Order } from '../types/domain'

export function CompanyDetailsPage() {
  const { id } = useParams()
  const { t, locale, dir } = useI18n()
  const { companies, branches, orders, invoices, ratings, drivers, dispatch } = useAppState()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')

  const company = companies.find((c) => c.id === id)
  const companyBranches = useMemo(() => branches.filter((b) => b.companyId === id), [branches, id])
  const companyOrders = useMemo(() => orders.filter((o) => o.companyId === id), [orders, id])
  const companyInvoices = useMemo(() => invoices.filter((i) => i.companyId === id), [invoices, id])
  const companyRatings = useMemo(() => ratings.filter((r) => r.companyId === id), [ratings, id])

  if (!company) {
    return <EmptyState title={t('notFound.title')} action={<Link to="/companies" className="text-sm font-medium text-brand-600">{t('nav.companies')}</Link>} />
  }

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  const branchColumns: Column<Branch>[] = [
    { key: 'name', header: t('branches.name'), render: (b) => (
      <span>
        <span className="block font-medium text-ink-900">{locale === 'ar' ? b.nameAr : b.name}</span>
        <span className="block text-xs text-ink-400">{b.address}</span>
      </span>
    ) },
    { key: 'manager', header: t('branches.manager'), render: (b) => <span className="text-ink-600">{b.manager}</span> },
    { key: 'status', header: t('common.status'), render: (b) => <Badge tone={b.active ? 'success' : 'neutral'}>{t(b.active ? 'branches.active' : 'branches.inactive')}</Badge> },
    { key: 'daily', header: t('branches.daily'), align: 'end', render: (b) => <span className="tnum">{formatNumber(b.dailyOrders, locale)}</span> },
    { key: 'monthly', header: t('branches.monthly'), align: 'end', render: (b) => <span className="tnum">{formatNumber(b.monthlyOrders, locale)}</span> },
    { key: 'success', header: t('companies.successRate'), align: 'end', render: (b) => <span className="tnum text-emerald-700">{formatPercent(b.successRate, locale)}</span> },
  ]

  const orderColumns: Column<Order>[] = [
    { key: 'number', header: t('orders.number'), render: (o) => <span className="tnum font-semibold">{o.number}</span> },
    { key: 'customer', header: t('orders.customer'), render: (o) => o.customerName },
    { key: 'status', header: t('common.status'), render: (o) => <OrderStatusBadge status={o.status} /> },
    { key: 'fee', header: t('orders.fee'), align: 'end', render: (o) => <span className="tnum">{formatMoney(o.deliveryFee, locale)}</span> },
    { key: 'created', header: t('orders.created'), render: (o) => <span className="tnum text-xs text-ink-500">{formatDateTime(o.createdAt, locale)}</span> },
  ]

  const invoiceColumns: Column<Invoice>[] = [
    { key: 'number', header: t('invoices.number'), render: (i) => <span className="tnum font-semibold" dir="ltr">{i.number}</span> },
    { key: 'period', header: t('invoices.period'), render: (i) => i.period },
    { key: 'orders', header: t('invoices.ordersCount'), align: 'end', render: (i) => <span className="tnum">{formatNumber(i.ordersCount, locale)}</span> },
    { key: 'amount', header: t('invoices.amount'), align: 'end', render: (i) => <span className="tnum font-medium">{formatMoney(i.amount, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (i) => <InvoiceStatusBadge status={i.status} /> },
  ]

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900">
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
              <DriverApprovalBadge status={company.status} />
            </div>
            <p className="tnum mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span>{locale === "ar" ? company.contactNameAr : company.contactName}</span>
              <span dir="ltr" className="flex items-center gap-1"><Phone className="h-3 w-3" aria-hidden />{company.phone}</span>
              <span>{cityName(company.city, locale)}</span>
              <span>{profileName(company.pricingProfile, locale)}</span>
            </p>
          </div>
          {company.status === 'pending_review' || company.status === 'suspended' ? (
            <Button variant="success" icon={<BadgeCheck className="h-4 w-4" aria-hidden />} onClick={() => { dispatch({ type: 'setCompanyStatus', companyId: company.id, status: 'approved' }); toast(t('companies.approvedToast')) }}>
              {t('companies.approve')}
            </Button>
          ) : company.status === 'approved' ? (
            <Button variant="secondary" icon={<OctagonPause className="h-4 w-4" aria-hidden />} onClick={() => { dispatch({ type: 'setCompanyStatus', companyId: company.id, status: 'suspended' }); toast(t('companies.suspendedToast'), 'info') }}>
              {t('companies.suspendAction')}
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label={t('companies.monthlyOrders')} value={formatNumber(company.monthlyOrders, locale)} />
        <StatCard label={t('companies.successRate')} value={formatPercent(company.successRate, locale)} tone="success" />
        <StatCard label={t('companies.avgDelivery')} value={`${formatNumber(company.avgDeliveryMins, locale)} ${t('common.min')}`} />
        <StatCard label={t('companies.totalSpend')} value={formatMoney(company.monthlyRevenue, locale)} tone="brand" />
        <StatCard label={t('companies.outstanding')} value={formatMoney(company.outstandingBalance, locale)} tone={company.outstandingBalance > 0 ? 'danger' : 'default'} />
        <StatCard label={t('companies.walletBalance')} value={formatMoney(company.walletBalance, locale)} />
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: t('companies.overview') },
          { id: 'branches', label: t('companies.branches') },
          { id: 'orders', label: t('nav.orders') },
          { id: 'financials', label: t('companies.financials') },
          { id: 'performance', label: t('companies.performance') },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {tab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t('companies.overview')}>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.type')}</dt><dd><Badge tone="info">{t(`biz.${company.type}` as TranslationKey)}</Badge></dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.pricingProfile')}</dt><dd className="font-medium">{profileName(company.pricingProfile, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.deliveryPrice')}</dt><dd className="tnum font-medium">{formatMoney(company.deliveryPrice, locale)} {t('common.perOrder')}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('companies.branches')}</dt><dd className="tnum font-medium">{formatNumber(companyBranches.length, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('auth.email')}</dt><dd className="font-medium" dir="ltr">{company.email}</dd></div>
              </dl>
            </Card>
            <Card title={t('ratings.recent')}>
              {companyRatings.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-500">{t('notif.empty')}</p>
              ) : (
                <ul className="space-y-3">
                  {companyRatings.map((r) => {
                    const d = drivers.find((x) => x.id === r.driverId)
                    return (
                      <li key={r.id} className="rounded-xl border border-ink-100 p-3">
                        <p className="text-xs font-semibold text-ink-700">{d ? (locale === 'ar' ? d.nameAr : d.name) : '—'}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
                          <span>{t('ratings.commitment')}: <b className="tnum">{r.commitment}/5</b></span>
                          <span>{t('ratings.behavior')}: <b className="tnum">{r.behavior}/5</b></span>
                          <span>{t('ratings.speed')}: <b className="tnum">{r.speed}/5</b></span>
                        </div>
                        {(r.comment || r.commentAr) && <p className="mt-1.5 text-sm text-ink-700">{locale === 'ar' ? r.commentAr : r.comment}</p>}
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
          </div>
        )}
        {tab === 'branches' && (
          <Card title={t('companies.branches')} padded={false}>
            <DataTable columns={branchColumns} rows={companyBranches} rowKey={(b) => b.id} emptyState={<EmptyState title={t('branches.empty')} />} />
          </Card>
        )}
        {tab === 'orders' && (
          <Card title={t('nav.orders')} padded={false}>
            <DataTable columns={orderColumns} rows={companyOrders} rowKey={(o) => o.id} onRowClick={(o) => navigate(`/orders?open=${o.id}`)} emptyState={<EmptyState title={t('orders.empty')} />} />
          </Card>
        )}
        {tab === 'financials' && (
          <Card title={t('nav.invoices')} padded={false}>
            <DataTable columns={invoiceColumns} rows={companyInvoices} rowKey={(i) => i.id} emptyState={<EmptyState title={t('notif.empty')} />} />
          </Card>
        )}
        {tab === 'performance' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('reports.deliveredOrders')} value={formatNumber(companyOrders.filter((o) => o.status === 'delivered' || o.status === 'closed').length, locale)} tone="success" />
            <StatCard label={t('dash.cancelledOrders')} value={formatNumber(companyOrders.filter((o) => o.status === 'cancelled').length, locale)} />
            <StatCard label={t('reports.failureRate')} value={formatPercent(Math.max(0, 100 - company.successRate), locale)} tone="danger" />
            <StatCard label={t('companies.avgDelivery')} value={`${formatNumber(company.avgDeliveryMins, locale)} ${t('common.min')}`} />
          </div>
        )}
      </div>
    </div>
  )
}
