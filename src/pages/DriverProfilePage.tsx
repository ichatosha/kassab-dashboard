import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, RatingStars, Tabs, VehicleBadge } from '../components/ui/misc'
import { ConnectionBadge, DriverApprovalBadge, OrderStatusBadge } from '../components/shared/StatusBadges'
import { DriverActions } from '../features/drivers/DriverActions'
import { DocumentReview } from '../features/drivers/DocumentReview'
import { formatDate, formatDateTime, formatMoney, formatNumber, formatPercent } from '../lib/format'
import { cityName, zoneName } from '../lib/geo'
import type { Order, WalletTransaction } from '../types/domain'

export function DriverProfilePage() {
  const { id } = useParams()
  const { t, locale, dir } = useI18n()
  const { drivers, orders, companies, driverTransactions, ratings } = useAppState()
  const navigate = useNavigate()
  const [tab, setTab] = useState('performance')

  const driver = drivers.find((d) => d.id === id)
  const driverOrders = useMemo(() => orders.filter((o) => o.driverId === id), [orders, id])
  const transactions = useMemo(() => driverTransactions.filter((tx) => tx.ownerId === id), [driverTransactions, id])
  const driverRatings = useMemo(() => ratings.filter((r) => r.driverId === id), [ratings, id])

  if (!driver) {
    return <EmptyState title={t('notFound.title')} action={<Link to="/drivers" className="text-sm font-medium text-brand-600">{t('nav.drivers')}</Link>} />
  }

  const completionRate = driver.completedOrders > 0 ? 100 - Math.min(9, driver.completedOrders % 9) : 0
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  const orderColumns: Column<Order>[] = [
    { key: 'number', header: t('orders.number'), render: (o) => <span className="tnum font-semibold">{o.number}</span> },
    { key: 'company', header: t('orders.company'), render: (o) => {
      const c = companies.find((x) => x.id === o.companyId)
      return <span className="text-ink-600">{c ? (locale === 'ar' ? c.nameAr : c.name) : '—'}</span>
    } },
    { key: 'status', header: t('common.status'), render: (o) => <OrderStatusBadge status={o.status} /> },
    { key: 'fee', header: t('orders.fee'), align: 'end', render: (o) => <span className="tnum">{formatMoney(o.deliveryFee, locale)}</span> },
    { key: 'created', header: t('orders.created'), render: (o) => <span className="tnum text-xs text-ink-500">{formatDateTime(o.createdAt, locale)}</span> },
  ]

  const txColumns: Column<WalletTransaction>[] = [
    { key: 'type', header: t('common.details'), render: (tx) => <span className="font-medium text-ink-800">{t(`wallets.tx.${tx.type}` as TranslationKey)}</span> },
    { key: 'ref', header: '#', render: (tx) => <span className="tnum text-xs text-ink-500" dir="ltr">{tx.reference}</span> },
    { key: 'amount', header: t('orders.amount'), align: 'end', render: (tx) => (
      <span className={`tnum font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
        {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount, locale)}
      </span>
    ) },
    { key: 'at', header: t('common.date'), render: (tx) => <span className="tnum text-xs text-ink-500">{formatDateTime(tx.at, locale)}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900">
        <BackIcon className="h-4 w-4" aria-hidden />
        {t('nav.drivers')}
      </button>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={driver.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg font-bold text-ink-950">{locale === 'ar' ? driver.nameAr : driver.name}</h1>
              <DriverApprovalBadge status={driver.status} />
              <ConnectionBadge driver={driver} />
            </div>
            <p className="tnum mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span dir="ltr" className="flex items-center gap-1"><Phone className="h-3 w-3" aria-hidden />{driver.phone}</span>
              <span dir="ltr">{driver.code}</span>
              <span>{zoneName(driver.zone, locale)} · {cityName(driver.city, locale)}</span>
              <span>{t('drivers.registered')}: {formatDate(driver.registeredAt, locale)}</span>
            </p>
          </div>
          <DriverActions driver={driver} size="md" />
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label={t('drivers.completed')} value={formatNumber(driver.completedOrders, locale)} />
        <StatCard label={t('drivers.completionRate')} value={formatPercent(completionRate, locale)} tone="success" />
        <StatCard label={t('drivers.avgRating')} value={<RatingStars value={driver.rating} count={driver.ratingCount} />} />
        <StatCard label={t('drivers.monthEarnings')} value={formatMoney(driver.earningsMonth, locale)} tone="brand" />
        <StatCard label={t('drivers.balance')} value={formatMoney(driver.balance, locale)} />
      </div>

      <Tabs
        tabs={[
          { id: 'performance', label: t('drivers.performance') },
          { id: 'documents', label: t('drivers.documents') },
          { id: 'wallet', label: t('drivers.wallet') },
          { id: 'orders', label: t('drivers.ordersHistory') },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {tab === 'performance' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t('approvals.vehicleInfo')}>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-500">{t('orders.vehicle')}</dt><dd><VehicleBadge type={driver.vehicle.type} /></dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('vehicles.model')}</dt><dd className="font-medium">{driver.vehicle.model}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('vehicles.plate')}</dt><dd className="font-medium" dir="rtl">{driver.vehicle.plate}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('vehicles.year')}</dt><dd className="tnum font-medium">{driver.vehicle.year}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.nationalId')}</dt><dd className="tnum font-medium" dir="ltr">{driver.nationalId}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.walletNumber')}</dt><dd className="tnum font-medium" dir="ltr">{driver.walletNumber}</dd></div>
              </dl>
            </Card>
            <Card title={t('ratings.recent')}>
              {driverRatings.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-500">{t('notif.empty')}</p>
              ) : (
                <ul className="space-y-3">
                  {driverRatings.map((r) => (
                    <li key={r.id} className="rounded-xl border border-ink-100 p-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
                        <span>{t('ratings.commitment')}: <b className="tnum">{r.commitment}/5</b></span>
                        <span>{t('ratings.behavior')}: <b className="tnum">{r.behavior}/5</b></span>
                        <span>{t('ratings.speed')}: <b className="tnum">{r.speed}/5</b></span>
                      </div>
                      {(r.comment || r.commentAr) && <p className="mt-1.5 text-sm text-ink-700">{locale === 'ar' ? r.commentAr : r.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
        {tab === 'documents' && (
          <Card title={t('drivers.documents')}>
            <DocumentReview driver={driver} />
          </Card>
        )}
        {tab === 'wallet' && (
          <Card title={t('wallets.transactions')} padded={false}>
            <DataTable columns={txColumns} rows={transactions} rowKey={(tx) => tx.id} emptyState={<EmptyState title={t('notif.empty')} />} />
          </Card>
        )}
        {tab === 'orders' && (
          <Card title={t('drivers.ordersHistory')} padded={false}>
            <DataTable
              columns={orderColumns}
              rows={driverOrders}
              rowKey={(o) => o.id}
              onRowClick={(o) => navigate(`/orders?open=${o.id}`)}
              emptyState={<EmptyState title={t('orders.empty')} />}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
