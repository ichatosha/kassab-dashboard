import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Phone } from 'lucide-react'
import { useI18n } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, VehicleBadge } from '../components/ui/misc'
import { DriverActions } from '../features/drivers/DriverActions'
import { DocumentReview } from '../features/drivers/DocumentReview'
import { formatDate } from '../lib/format'

export function ApprovalsPage() {
  const { t, locale } = useI18n()
  const { drivers } = useAppState()
  const pending = useMemo(() => drivers.filter((d) => d.status === 'pending_review'), [drivers])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = pending.find((d) => d.id === selectedId) ?? pending[0] ?? null

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('approvals.title')} subtitle={t('approvals.subtitle')} />
      {pending.length === 0 ? (
        <Card>
          <EmptyState title={t('approvals.empty')} hint={t('approvals.emptyHint')} icon={<BadgeCheck className="h-6 w-6" />} />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title={t('approvals.queue')} padded={false}>
            <ul className="divide-y divide-ink-100">
              {pending.map((d) => (
                <li key={d.id}>
                  <button
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-brand-50/40 ${selected?.id === d.id ? 'bg-brand-50/70' : ''}`}
                    onClick={() => setSelectedId(d.id)}
                    aria-current={selected?.id === d.id}
                  >
                    <Avatar name={d.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">{locale === 'ar' ? d.nameAr : d.name}</span>
                      <span className="tnum block text-xs text-ink-500">{formatDate(d.registeredAt, locale)}</span>
                    </span>
                    <VehicleBadge type={d.vehicle.type} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {selected && (
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar name={selected.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/drivers/${selected.id}`} className="text-lg font-bold text-ink-950 hover:text-brand-700">
                      {locale === 'ar' ? selected.nameAr : selected.name}
                    </Link>
                    <p className="tnum mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-500">
                      <span dir="ltr" className="flex items-center gap-1"><Phone className="h-3 w-3" aria-hidden />{selected.phone}</span>
                      <span>{selected.zone} · {selected.city}</span>
                      <span>{t('approvals.submitted')}: {formatDate(selected.registeredAt, locale)}</span>
                    </p>
                  </div>
                  <DriverActions driver={selected} size="md" />
                </div>
              </Card>

              <Card title={t('drivers.documents')}>
                <DocumentReview driver={selected} />
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card title={t('approvals.vehicleInfo')}>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-ink-500">{t('orders.vehicle')}</dt><dd><VehicleBadge type={selected.vehicle.type} /></dd></div>
                    <div className="flex justify-between"><dt className="text-ink-500">{t('vehicles.model')}</dt><dd className="font-medium">{selected.vehicle.model}</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-500">{t('vehicles.plate')}</dt><dd className="font-medium" dir="rtl">{selected.vehicle.plate}</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-500">{t('vehicles.year')}</dt><dd className="tnum font-medium">{selected.vehicle.year}</dd></div>
                  </dl>
                </Card>
                <Card title={t('approvals.walletInfo')}>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.walletNumber')}</dt><dd className="tnum font-medium" dir="ltr">{selected.walletNumber}</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-500">{t('drivers.nationalId')}</dt><dd className="tnum font-medium" dir="ltr">{selected.nationalId}</dd></div>
                  </dl>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
