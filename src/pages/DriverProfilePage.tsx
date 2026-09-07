import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MapPin, Phone } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { useLookups } from '../hooks/useLookups'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import {
  Avatar, MotorcycleBadge, RatingStars, Tabs, VerifiedMark,
} from '../components/ui/misc'
import { ApplicationBadge, DriverBadge } from '../components/shared/StatusBadges'
import { DriverActions } from '../features/drivers/DriverActions'
import {
  formatDate, formatDateTime, formatMoney, formatNumber, formatPercent,
} from '../lib/format'
import { brandLabel, cityName } from '../lib/geo'
import type { Application, WalletTransaction } from '../types/domain'

export function DriverProfilePage() {
  const { id } = useParams()
  const { t, locale, dir } = useI18n()
  const { drivers, applications, transactions, ratings } = useAppState()
  const { companyName, requestById } = useLookups()
  const navigate = useNavigate()
  const [tab, setTab] = useState('performance')

  const driver = drivers.find((d) => d.id === id)
  const driverApplications = useMemo(() => applications.filter((a) => a.driverId === id), [applications, id])
  const driverTransactions = useMemo(() => transactions.filter((tx) => tx.driverId === id), [transactions, id])
  const driverRatings = useMemo(() => ratings.filter((r) => r.driverId === id), [ratings, id])

  if (!driver) {
    return (
      <EmptyState
        title={t('notFound.title')}
        action={<Link to="/drivers" className="text-sm font-medium text-brand-600">{t('nav.drivers')}</Link>}
      />
    )
  }

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft
  const perf = driver.performance

  const applicationColumns: Column<Application>[] = [
    { key: 'number', header: t('apps.number'), render: (a) => <span className="tnum font-semibold" dir="ltr">{a.number}</span> },
    { key: 'company', header: t('apps.company'), render: (a) => <span className="text-ink-700">{companyName(a.companyId)}</span> },
    {
      key: 'salary',
      header: t('apps.salary'),
      align: 'end',
      render: (a) => {
        const r = requestById.get(a.requestId)
        return <span className="tnum">{r ? formatMoney(r.salary, locale) : '—'}</span>
      },
    },
    { key: 'applied', header: t('apps.applied'), render: (a) => <span className="tnum text-xs text-ink-500">{formatDate(a.appliedAt, locale)}</span> },
    { key: 'status', header: t('common.status'), render: (a) => <ApplicationBadge status={a.status} /> },
  ]

  const txColumns: Column<WalletTransaction>[] = [
    { key: 'type', header: t('common.details'), render: (tx) => <span className="font-medium text-ink-800">{t(`wallet.tx.${tx.type}` as TranslationKey)}</span> },
    { key: 'ref', header: '#', render: (tx) => <span className="tnum text-xs text-ink-500" dir="ltr">{tx.reference}</span> },
    {
      key: 'amount',
      header: t('common.total'),
      align: 'end',
      render: (tx) => (
        <span className={`tnum font-semibold ${tx.amount < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
          {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount, locale)}
        </span>
      ),
    },
    { key: 'at', header: t('common.date'), render: (tx) => <span className="tnum text-xs text-ink-500">{formatDateTime(tx.at, locale)}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <BackIcon className="h-4 w-4" aria-hidden />
        {t('nav.drivers')}
      </button>

      {/* Identity */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={driver.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg font-bold text-ink-950">{locale === 'ar' ? driver.nameAr : driver.name}</h1>
              <DriverBadge status={driver.status} />
              <VerifiedMark verified={driver.verified} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span className="tnum" dir="ltr">{driver.code}</span>
              <span className="tnum flex items-center gap-1" dir="ltr"><Phone className="h-3 w-3" aria-hidden />{driver.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{driver.address}</span>
              <span className="tnum">{t('drivers.age')}: {formatNumber(driver.age, locale)}</span>
            </p>
            <div className="mt-2">
              <MotorcycleBadge motorcycle={driver.motorcycle} />
            </div>
          </div>
          <DriverActions driver={driver} size="md" />
        </div>
      </Card>

      {/* Headline performance + wallet */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label={t('common.rating')} value={<RatingStars value={perf.rating} count={perf.ratingCount} />} />
        <StatCard
          label={t('drivers.successRate')}
          value={perf.deliverySuccessRate > 0 ? formatPercent(perf.deliverySuccessRate, locale) : '—'}
          tone="success"
        />
        <StatCard label={t('drivers.completedDeliveries')} value={formatNumber(perf.completedDeliveries, locale)} />
        <StatCard label={t('wallet.balance')} value={formatMoney(driver.wallet.balance, locale)} tone="brand" />
        <StatCard
          label={t('drivers.employment')}
          value={driver.employment ? formatMoney(driver.employment.salary, locale) : '—'}
          hint={driver.employment ? companyName(driver.employment.companyId) : t('drivers.noEmployment')}
        />
      </div>

      <Tabs
        tabs={[
          { id: 'performance', label: t('drivers.performance') },
          { id: 'employment', label: t('drivers.employment') },
          { id: 'wallet', label: t('drivers.wallet') },
          { id: 'applications', label: t('drivers.applications') },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {tab === 'performance' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t('drivers.performance')}>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.completedDeliveries')}</dt><dd className="tnum font-medium text-emerald-700">{formatNumber(perf.completedDeliveries, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.failedDeliveries')}</dt><dd className="tnum font-medium text-red-700">{formatNumber(perf.failedDeliveries, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.cancelledDeliveries')}</dt><dd className="tnum font-medium text-ink-700">{formatNumber(perf.cancelledDeliveries, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.successRate')}</dt><dd className="tnum font-medium">{perf.deliverySuccessRate > 0 ? formatPercent(perf.deliverySuccessRate, locale) : '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.experience')}</dt><dd className="tnum font-medium">{formatNumber(perf.experienceYears, locale)} {t('common.years')}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.availability')}</dt><dd className="font-medium">{t(`emp.${driver.availability}` as TranslationKey)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('common.area')}</dt><dd className="font-medium">{driver.preferredArea}</dd></div>
              </dl>
            </Card>

            <div className="space-y-4">
              <Card title={t('moto.category')}>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-ink-500">{t('moto.type')}</dt><dd className="font-medium">{brandLabel(driver.motorcycle.brand, locale)}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-500">{t('moto.model')}</dt><dd className="font-medium">{driver.motorcycle.model}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-500">{t('moto.plate')}</dt><dd className="font-medium" dir="rtl">{driver.motorcycle.plate}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-500">{t('moto.year')}</dt><dd className="tnum font-medium">{driver.motorcycle.year}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-500">{t('common.city')}</dt><dd className="font-medium">{cityName(driver.city, locale)}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.registered')}</dt><dd className="tnum font-medium">{formatDate(driver.registeredAt, locale)}</dd></div>
                </dl>
              </Card>

              <Card title={t('ratings.recent')}>
                {driverRatings.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-500">{t('ratings.empty')}</p>
                ) : (
                  <ul className="space-y-3">
                    {driverRatings.map((r) => (
                      <li key={r.id} className="rounded-xl border border-ink-100 p-3">
                        <p className="text-xs font-semibold text-ink-700">
                          {t('ratings.ratedBy')}: {companyName(r.companyId)}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
                          <span>{t('ratings.punctuality')}: <b className="tnum">{r.punctuality}/5</b></span>
                          <span>{t('ratings.behavior')}: <b className="tnum">{r.behavior}/5</b></span>
                          <span>{t('ratings.speed')}: <b className="tnum">{r.deliverySpeed}/5</b></span>
                        </div>
                        {(r.comment || r.commentAr) && (
                          <p className="mt-1.5 text-sm text-ink-700">{locale === 'ar' ? r.commentAr : r.comment}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}

        {tab === 'employment' && (
          <Card title={t('drivers.employment')}>
            {driver.employment ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-500">{t('drivers.company')}</dt>
                  <dd>
                    <Link to={`/companies/${driver.employment.companyId}`} className="font-medium text-brand-700 hover:underline">
                      {companyName(driver.employment.companyId)}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.salary')}</dt><dd className="tnum font-medium">{formatMoney(driver.employment.salary, locale)} <span className="text-xs text-ink-500">{t('common.perMonth')}</span></dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.startDate')}</dt><dd className="tnum font-medium">{formatDate(driver.employment.startDate, locale)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">{t('common.status')}</dt><dd><DriverBadge status={driver.status} /></dd></div>
              </dl>
            ) : (
              <EmptyState title={t('drivers.noEmployment')} />
            )}
          </Card>
        )}

        {tab === 'wallet' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label={t('wallet.balance')} value={formatMoney(driver.wallet.balance, locale)} tone="brand" />
              <StatCard label={t('wallet.totalEarnings')} value={formatMoney(driver.wallet.totalEarnings, locale)} />
              <StatCard label={t('wallet.pending')} value={formatMoney(driver.wallet.pendingEarnings, locale)} />
              <StatCard label={t('wallet.paid')} value={formatMoney(driver.wallet.paidEarnings, locale)} tone="success" />
            </div>
            <Card title={t('wallet.transactions')} padded={false}>
              <DataTable
                columns={txColumns}
                rows={driverTransactions}
                rowKey={(tx) => tx.id}
                emptyState={<EmptyState title={t('wallet.empty')} />}
              />
            </Card>
          </div>
        )}

        {tab === 'applications' && (
          <Card title={t('drivers.applications')} padded={false}>
            <DataTable
              columns={applicationColumns}
              rows={driverApplications}
              rowKey={(a) => a.id}
              onRowClick={(a) => navigate(`/applications?open=${a.id}`)}
              emptyState={<EmptyState title={t('drivers.noApplications')} />}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
