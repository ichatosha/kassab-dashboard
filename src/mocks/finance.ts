import type { Invoice, RevenuePoint, WalletTransaction } from '../types/domain'
import { mockCompanies } from './companies'
import { mockDrivers } from './drivers'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const dayLabel = (n: number) => {
  const d = new Date(Date.now() - n * 86400000)
  return d.toISOString().slice(0, 10)
}

// 30-day revenue series with weekly rhythm (weekend dips) and mild growth
export const mockRevenueSeries: RevenuePoint[] = Array.from({ length: 30 }, (_, i) => {
  const n = 29 - i
  const weekday = new Date(Date.now() - n * 86400000).getDay()
  const weekendDip = weekday === 5 ? 0.82 : weekday === 6 ? 0.9 : 1
  const growth = 1 + (29 - n) * 0.012
  const orders = Math.round(215 * weekendDip * growth + ((n * 13) % 24))
  const revenue = Math.round(orders * 24.4)
  const commission = Math.round(revenue * 0.25)
  return {
    date: dayLabel(n),
    orders,
    revenue,
    commission,
    driverPayouts: revenue - commission,
  }
})

export const mockInvoices: Invoice[] = mockCompanies
  .filter((c) => c.status === 'approved')
  .flatMap((c, i) => {
    const base = Math.round(c.monthlyRevenue)
    return [
      {
        id: `inv-${i}-1`,
        number: `INV-2026-${String(801 + i * 2)}`,
        companyId: c.id,
        period: 'Aug 2026',
        ordersCount: c.monthlyOrders,
        amount: base,
        status: c.outstandingBalance > 8000 ? ('overdue' as const) : c.outstandingBalance > 0 ? ('due' as const) : ('paid' as const),
        issuedAt: daysAgo(3),
        dueAt: daysAgo(-11),
      },
      {
        id: `inv-${i}-2`,
        number: `INV-2026-${String(800 + i * 2)}`,
        companyId: c.id,
        period: 'Jul 2026',
        ordersCount: Math.round(c.monthlyOrders * 0.93),
        amount: Math.round(base * 0.93),
        status: 'paid' as const,
        issuedAt: daysAgo(34),
        dueAt: daysAgo(20),
      },
    ]
  })

const txTemplates: Array<[WalletTransaction['type'], number]> = [
  ['delivery_earning', 21], ['delivery_earning', 19], ['bonus', 150],
  ['delivery_earning', 24], ['withdrawal', -1200], ['delivery_earning', 18],
  ['delivery_earning', 22], ['adjustment', -35], ['delivery_earning', 20],
]

export const mockDriverTransactions: WalletTransaction[] = mockDrivers
  .filter((d) => d.status === 'approved')
  .slice(0, 8)
  .flatMap((d, i) =>
    txTemplates.slice(0, 5 + (i % 4)).map((tpl, j) => ({
      id: `dtx-${d.id}-${j}`,
      ownerType: 'driver' as const,
      ownerId: d.id,
      type: tpl[0],
      amount: tpl[1],
      reference: tpl[0] === 'delivery_earning' ? `KSB-${48100 + i * 9 + j}` : tpl[0] === 'withdrawal' ? `WD-${7100 + i}` : `ADJ-${310 + j}`,
      at: new Date(Date.now() - (j * 5 + i) * 3600000).toISOString(),
    })),
  )

const companyTxTemplates: Array<[WalletTransaction['type'], number]> = [
  ['order_charge', -25], ['order_charge', -25], ['payment', 5000],
  ['order_charge', -30], ['invoice', -4200], ['order_charge', -22],
  ['payment', 8000], ['order_charge', -25],
]

export const mockCompanyTransactions: WalletTransaction[] = mockCompanies
  .filter((c) => c.status === 'approved')
  .slice(0, 6)
  .flatMap((c, i) =>
    companyTxTemplates.slice(0, 5 + (i % 3)).map((tpl, j) => ({
      id: `ctx-${c.id}-${j}`,
      ownerType: 'company' as const,
      ownerId: c.id,
      type: tpl[0],
      amount: tpl[0] === 'order_charge' ? -c.deliveryPrice : tpl[1],
      reference: tpl[0] === 'order_charge' ? `KSB-${48150 + i * 7 + j}` : tpl[0] === 'payment' ? `PAY-${910 + i}` : `INV-2026-${801 + i * 2}`,
      at: new Date(Date.now() - (j * 7 + i * 2) * 3600000).toISOString(),
    })),
  )
