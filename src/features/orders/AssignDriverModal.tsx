import { useMemo } from 'react'
import { Info } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar, RatingStars, VehicleBadge } from '../../components/ui/misc'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useToast } from '../../components/ui/Toast'
import { formatNumber } from '../../lib/format'
import type { Order } from '../../types/domain'

interface Props {
  order: Order | null
  onClose: () => void
}

// Frontend simulation of the dispatch ranking: proximity, zone match,
// vehicle compatibility, load, and rating — mirroring the spec criteria.
export function AssignDriverModal({ order, onClose }: Props) {
  const { t, locale } = useI18n()
  const { drivers, dispatch } = useAppState()
  const { toast } = useToast()

  const candidates = useMemo(() => {
    if (!order) return []
    return drivers
      .filter((d) => d.status === 'approved' && d.connection === 'online' && d.id !== order.driverId)
      .map((d) => {
        const zoneMatch = d.zone === order.zone
        const vehicleMatch = d.vehicle.type === order.vehicleType
        const distanceKm = Math.round((Math.abs(d.position.x - 50) + Math.abs(d.position.y - 50)) / 6 + (zoneMatch ? 0.8 : 3.2))
        const score = Math.round(
          (zoneMatch ? 30 : 10) +
            (vehicleMatch ? 25 : 5) +
            d.rating * 8 -
            d.activeOrders * 12 -
            distanceKm * 1.5,
        )
        return { driver: d, zoneMatch, vehicleMatch, distanceKm, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [drivers, order])

  if (!order) return null

  return (
    <Modal open onClose={onClose} title={t('assign.title')} wide>
      <p className="mb-1 text-xs text-ink-500">{t('assign.subtitle')}</p>
      <p className="mb-4 flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {t('assign.autoNote')}
      </p>
      {candidates.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-500">{t('assign.noDrivers')}</p>
      ) : (
        <ul className="space-y-2">
          {candidates.map(({ driver, vehicleMatch, distanceKm, score }, i) => (
            <li
              key={driver.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/30"
            >
              <span className="tnum flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600" aria-hidden>
                {i + 1}
              </span>
              <Avatar name={driver.name} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{locale === 'ar' ? driver.nameAr : driver.name}</p>
                <p className="text-xs text-ink-500">{driver.zone}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="tnum text-ink-600">
                  {t('assign.distance')}: <b>{formatNumber(distanceKm, locale)} km</b>
                </span>
                <span className="tnum text-ink-600">
                  {t('assign.load')}: <b>{formatNumber(driver.activeOrders, locale)}</b>
                </span>
                <RatingStars value={driver.rating} />
                <Badge tone={vehicleMatch ? 'success' : 'warning'}>
                  {vehicleMatch ? t('assign.compatible') : t('assign.incompatible')}
                </Badge>
                <VehicleBadge type={driver.vehicle.type} />
                <Badge tone="brand">
                  {t('assign.score')}: {formatNumber(Math.max(1, score), locale)}
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  dispatch({ type: 'assignDriver', orderId: order.id, driverId: driver.id })
                  toast(t('orders.driverAssigned'))
                  onClose()
                }}
              >
                {t('assign.assign')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
