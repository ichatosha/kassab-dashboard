import { useState } from 'react'
import { Save } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { PageHeader, Tabs, VehicleBadge } from '../components/ui/misc'
import { formatMoney } from '../lib/format'
import { profileName } from '../lib/geo'

const inputCls =
  'tnum h-8 w-24 rounded-md border border-ink-200 bg-white px-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25'

export function PricingPage() {
  const { t, locale } = useI18n()
  const { companies, zonePricing, vehiclePricing, charges, commissionRules, dispatch } = useAppState()
  const { toast } = useToast()
  const [tab, setTab] = useState('customers')

  // Local editable copies committed on save
  const [zones, setZones] = useState(zonePricing)
  const [vehicles, setVehicles] = useState(vehiclePricing)
  const [chargeRows, setChargeRows] = useState(charges)
  const [rules, setRules] = useState(commissionRules)
  const [companyPrices, setCompanyPrices] = useState<Record<string, number>>(
    Object.fromEntries(companies.map((c) => [c.id, c.deliveryPrice])),
  )

  const saveToast = () => toast(t('pricing.updated'))

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('pricing.title')} subtitle={t('pricing.subtitle')} />
      <Tabs
        tabs={[
          { id: 'customers', label: t('pricing.customerPricing') },
          { id: 'zones', label: t('pricing.zonePricing') },
          { id: 'vehicles', label: t('pricing.vehiclePricing') },
          { id: 'charges', label: t('pricing.additionalCharges') },
          { id: 'commission', label: t('pricing.commissionRules') },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {tab === 'customers' && (
          <Card
            title={t('pricing.customerPricing')}
            padded={false}
            actions={
              <Button
                size="sm"
                icon={<Save className="h-4 w-4" aria-hidden />}
                onClick={() => {
                  Object.entries(companyPrices).forEach(([companyId, price]) =>
                    dispatch({ type: 'updateCompanyPrice', companyId, price }),
                  )
                  saveToast()
                }}
              >
                {t('common.save')}
              </Button>
            }
          >
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50/70 text-start">
                    <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-ink-500">{t('companies.name')}</th>
                    <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-ink-500">{t('companies.type')}</th>
                    <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-ink-500">{t('companies.pricingProfile')}</th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">{t('companies.deliveryPrice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="border-b border-ink-100 last:border-b-0">
                      <td className="px-4 py-2.5 font-medium text-ink-900">{locale === 'ar' ? c.nameAr : c.name}</td>
                      <td className="px-4 py-2.5"><Badge tone="info">{t(`biz.${c.type}` as TranslationKey)}</Badge></td>
                      <td className="px-4 py-2.5 text-ink-600">{profileName(c.pricingProfile, locale)}</td>
                      <td className="px-4 py-2.5 text-end">
                        <input
                          type="number"
                          min={0}
                          className={inputCls}
                          value={companyPrices[c.id] ?? c.deliveryPrice}
                          aria-label={`${t('companies.deliveryPrice')} — ${c.name}`}
                          onChange={(e) => setCompanyPrices((p) => ({ ...p, [c.id]: Number(e.target.value) }))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'zones' && (
          <Card
            title={t('pricing.zonePricing')}
            padded={false}
            actions={
              <Button size="sm" icon={<Save className="h-4 w-4" aria-hidden />} onClick={() => { dispatch({ type: 'updateZonePricing', zones }); saveToast() }}>
                {t('common.save')}
              </Button>
            }
          >
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50/70">
                    <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-ink-500">{t('common.zone')}</th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">{t('pricing.basePrice')}</th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">{t('pricing.perKm')}</th>
                    <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-ink-500">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((z, i) => (
                    <tr key={z.id} className="border-b border-ink-100 last:border-b-0">
                      <td className="px-4 py-2.5 font-medium text-ink-900">{locale === 'ar' ? z.zoneAr : z.zone}</td>
                      <td className="px-4 py-2.5 text-end">
                        <input type="number" min={0} className={inputCls} value={z.basePrice} aria-label={`${t('pricing.basePrice')} — ${z.zone}`}
                          onChange={(e) => setZones(zones.map((x, j) => (j === i ? { ...x, basePrice: Number(e.target.value) } : x)))} />
                      </td>
                      <td className="px-4 py-2.5 text-end">
                        <input type="number" min={0} step={0.25} className={inputCls} value={z.pricePerKm} aria-label={`${t('pricing.perKm')} — ${z.zone}`}
                          onChange={(e) => setZones(zones.map((x, j) => (j === i ? { ...x, pricePerKm: Number(e.target.value) } : x)))} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={z.active ? 'success' : 'neutral'}>{t(z.active ? 'branches.active' : 'branches.inactive')}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'vehicles' && (
          <Card
            title={t('pricing.vehiclePricing')}
            padded={false}
            actions={
              <Button size="sm" icon={<Save className="h-4 w-4" aria-hidden />} onClick={() => { dispatch({ type: 'updateVehiclePricing', vehicles }); saveToast() }}>
                {t('common.save')}
              </Button>
            }
          >
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50/70">
                    <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-ink-500">{t('orders.vehicle')}</th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">{t('pricing.basePrice')}</th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">{t('pricing.perKm')}</th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">{t('vehicles.maxWeight')}</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, i) => (
                    <tr key={v.id} className="border-b border-ink-100 last:border-b-0">
                      <td className="px-4 py-2.5"><VehicleBadge type={v.type} /></td>
                      <td className="px-4 py-2.5 text-end">
                        <input type="number" min={0} className={inputCls} value={v.basePrice} aria-label={`${t('pricing.basePrice')} — ${v.type}`}
                          onChange={(e) => setVehicles(vehicles.map((x, j) => (j === i ? { ...x, basePrice: Number(e.target.value) } : x)))} />
                      </td>
                      <td className="px-4 py-2.5 text-end">
                        <input type="number" min={0} step={0.25} className={inputCls} value={v.perKm} aria-label={`${t('pricing.perKm')} — ${v.type}`}
                          onChange={(e) => setVehicles(vehicles.map((x, j) => (j === i ? { ...x, perKm: Number(e.target.value) } : x)))} />
                      </td>
                      <td className="tnum px-4 py-2.5 text-end text-ink-600">{v.maxWeightKg} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'charges' && (
          <Card
            title={t('pricing.additionalCharges')}
            padded={false}
            actions={
              <Button size="sm" icon={<Save className="h-4 w-4" aria-hidden />} onClick={() => { dispatch({ type: 'updateCharges', charges: chargeRows }); saveToast() }}>
                {t('common.save')}
              </Button>
            }
          >
            <ul className="divide-y divide-ink-100">
              {chargeRows.map((ch, i) => (
                <li key={ch.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="min-w-40 flex-1 text-sm font-medium text-ink-900">{t(ch.nameKey as TranslationKey)}</span>
                  <Badge tone="neutral">{t(ch.kind === 'fixed' ? 'pricing.fixed' : 'pricing.percent')}</Badge>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={ch.amount}
                    aria-label={t(ch.nameKey as TranslationKey)}
                    onChange={(e) => setChargeRows(chargeRows.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))}
                  />
                  <span className="w-12 text-xs text-ink-500">{ch.kind === 'fixed' ? t('common.egp') : '%'}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={ch.active}
                    aria-label={`${t(ch.nameKey as TranslationKey)} — ${t(ch.active ? 'branches.active' : 'branches.inactive')}`}
                    onClick={() => setChargeRows(chargeRows.map((x, j) => (j === i ? { ...x, active: !x.active } : x)))}
                    className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${ch.active ? 'bg-brand-600' : 'bg-ink-200'}`}
                  >
                    <span aria-hidden className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${ch.active ? 'start-[calc(100%-1.375rem)]' : 'start-0.5'}`} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === 'commission' && (
          <Card
            title={t('pricing.commissionRules')}
            padded={false}
            actions={
              <Button size="sm" icon={<Save className="h-4 w-4" aria-hidden />} onClick={() => { dispatch({ type: 'updateCommissionRules', rules }); saveToast() }}>
                {t('common.save')}
              </Button>
            }
          >
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50/70">
                    <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-ink-500">{t('pricing.appliesTo')}</th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">{t('pricing.kassabPercent')}</th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">{t('pricing.driverPercent')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r, i) => (
                    <tr key={r.id} className="border-b border-ink-100 last:border-b-0">
                      <td className="px-4 py-2.5 font-medium text-ink-900">
                        {r.appliesTo === 'default' ? t('pricing.default') : t(`biz.${r.appliesTo}` as TranslationKey)}
                      </td>
                      <td className="px-4 py-2.5 text-end">
                        <input
                          type="number" min={0} max={100} className={inputCls} value={r.kassabPercent}
                          aria-label={`${t('pricing.kassabPercent')} — ${r.appliesTo}`}
                          onChange={(e) => {
                            const v = Math.min(100, Math.max(0, Number(e.target.value)))
                            setRules(rules.map((x, j) => (j === i ? { ...x, kassabPercent: v, driverPercent: 100 - v } : x)))
                          }}
                        />
                      </td>
                      <td className="tnum px-4 py-2.5 text-end text-ink-600">{r.driverPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
              {formatMoney(25, locale)} × 25% = {formatMoney(6.25, locale)} {t('commissions.kassab')} {t('common.perOrder')}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
