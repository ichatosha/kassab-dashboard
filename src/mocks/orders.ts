import type { Order, OrderStatus, OrderTimelineEvent, PaymentMethod, VehicleType } from '../types/domain'
import { mockCompanies, mockBranches } from './companies'
import { mockDrivers } from './drivers'
import { LIFECYCLE } from '../lib/status'

const minsAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString()

const customers = [
  'Sara Mostafa', 'Hesham Kamal', 'Nadia Fouad', 'Tamer Sobhy', 'Laila Adel',
  'Mohamed Salah', 'Rana El-Gohary', 'Ayman Sherif', 'Dina Magdy', 'Fady Nagy',
  'Salma Hussein', 'Waleed Zaher', 'Mai Abdallah', 'Hazem Ismail', 'Nour Yehia',
  'Ola Farag', 'Sameh Riad', 'Yara Ehab', 'Mostafa Amin', 'Heba Saeed',
]

const deliveryAddresses = [
  '14 Abbas El-Akkad St., Nasr City',
  '3 Road 9, Maadi',
  '72 El-Merghany St., Heliopolis',
  '25 Gameat El-Dewal St., Mohandessin',
  '8 Baghdad St., Korba, Heliopolis',
  '112 90th St., 5th Settlement, New Cairo',
  '17 Shehab St., Mohandessin',
  '5 Ahmed Orabi St., Shubra',
  '31 Tahrir St., Dokki',
  '2 El-Nasr Rd., Nasr City',
  '19 Syria St., Mohandessin',
  '44 Makram Ebeid St., Nasr City',
  '7 26th of July St., Zamalek',
  '210 El-Haram St., Giza',
  '60 Central Axis, 6th of October',
]

const problemReasons: Record<string, { en: string }> = {
  failed: { en: 'Customer refused to receive the order at the door' },
  cancelled: { en: 'Company cancelled — item out of stock' },
  address_problem: { en: 'Building number does not exist on the street' },
  customer_unavailable: { en: 'Customer not answering after 3 call attempts' },
}

// [status, createdMinsAgo, driverIndex | null]
type Row = [OrderStatus, number, number | null]

const rows: Row[] = [
  // Active now — the control-center rows
  ['new', 6, null],
  ['new', 14, null],
  ['new', 25, null],
  ['assigned', 32, 5],
  ['assigned', 41, 7],
  ['en_route_pickup', 48, 0],
  ['en_route_pickup', 55, 3],
  ['picked_up', 62, 1],
  ['en_route_customer', 74, 2],
  ['en_route_customer', 81, 4],
  ['customer_unavailable', 95, 9],
  ['address_problem', 110, 6],
  // Today — resolved
  ['delivered', 130, 0], ['delivered', 155, 1], ['delivered', 170, 2], ['delivered', 190, 3],
  ['delivered', 215, 4], ['delivered', 240, 5], ['delivered', 265, 6], ['delivered', 285, 7],
  ['delivered', 310, 8], ['delivered', 335, 9], ['delivered', 360, 10], ['delivered', 385, 11],
  ['delivered', 410, 12], ['delivered', 440, 13], ['closed', 470, 14], ['closed', 500, 15],
  ['closed', 530, 16], ['closed', 560, 17], ['closed', 590, 0], ['closed', 620, 1],
  ['cancelled', 200, null], ['cancelled', 380, 3], ['failed', 260, 8],
  // Yesterday and earlier
  ['closed', 1500, 2], ['closed', 1560, 4], ['closed', 1620, 6], ['closed', 1700, 8],
  ['closed', 1780, 10], ['closed', 1850, 12], ['closed', 1930, 14], ['closed', 2000, 16],
  ['failed', 1600, 5], ['cancelled', 1750, null], ['closed', 2100, 1], ['closed', 2200, 3],
  ['closed', 2900, 5], ['closed', 3000, 7], ['closed', 3100, 9], ['closed', 3200, 11],
  ['closed', 3300, 13], ['closed', 3400, 15], ['cancelled', 3350, 2], ['closed', 4400, 0],
  ['closed', 4500, 2], ['closed', 4600, 4], ['closed', 4700, 6], ['closed', 4800, 8],
  ['closed', 5900, 10], ['closed', 6000, 12], ['closed', 6100, 14], ['failed', 6050, 16],
  ['closed', 7300, 1], ['closed', 7400, 3], ['closed', 7500, 5], ['closed', 8600, 7],
  ['closed', 8700, 9], ['closed', 8800, 11], ['closed', 10000, 13], ['closed', 10100, 15],
]

const payments: PaymentMethod[] = ['cash', 'wallet', 'card', 'bank_transfer']

function buildTimeline(status: OrderStatus, createdMins: number, driverName?: string): OrderTimelineEvent[] {
  const lifecycleIdx = LIFECYCLE.indexOf(status)
  const isProblem = lifecycleIdx === -1
  const reached = isProblem ? LIFECYCLE.slice(0, 3) : LIFECYCLE.slice(0, lifecycleIdx + 1)
  const step = Math.max(6, Math.floor(createdMins / (reached.length + 1)))
  const events: OrderTimelineEvent[] = reached
    .filter((s) => s !== 'assigned' || driverName)
    .map((s, i) => ({
      status: s,
      at: minsAgo(createdMins - i * step),
      by: s === 'new' ? 'System' : s === 'assigned' ? 'Dispatch' : driverName,
    }))
  if (isProblem) {
    events.push({
      status,
      at: minsAgo(Math.max(2, createdMins - reached.length * step)),
      by: driverName ?? 'Operations',
      note: problemReasons[status]?.en,
    })
  }
  return events
}

const approvedCompanies = mockCompanies.filter((c) => c.status === 'approved')

export const mockOrders: Order[] = rows.map(([status, createdMins, driverIdx], i) => {
  const company = approvedCompanies[i % approvedCompanies.length]
  const branch = mockBranches.find((b) => b.companyId === company.id)
  const driver = driverIdx !== null ? mockDrivers[driverIdx] : undefined
  const vehicleType: VehicleType = driver?.vehicle.type ?? (['motorcycle', 'car', 'tricycle'] as const)[i % 3]
  const orderValue = 120 + ((i * 37) % 640)
  const deliveryFee = company.deliveryPrice
  const kassabCommission = Math.round(deliveryFee * 0.25 * 100) / 100
  const isProblem = !LIFECYCLE.includes(status)
  const activeEnRoute = ['en_route_pickup', 'picked_up', 'en_route_customer'].includes(status)

  return {
    id: `ord-${String(i + 1).padStart(4, '0')}`,
    number: `KSB-${String(48210 + i)}`,
    companyId: company.id,
    branchId: branch?.id,
    customerName: customers[i % customers.length],
    customerPhone: `+20 12${(23456780 + i * 913).toString().slice(0, 8)}`,
    pickupAddress: branch?.address ?? `${company.name} — ${company.city}`,
    deliveryAddress: deliveryAddresses[i % deliveryAddresses.length],
    zone: driver?.zone ?? ['Nasr City', 'Maadi', 'Heliopolis', 'Dokki', 'New Cairo'][i % 5],
    driverId: driver?.id,
    vehicleType,
    paymentMethod: payments[i % payments.length],
    orderValue,
    deliveryFee,
    kassabCommission,
    driverCommission: Math.round((deliveryFee - kassabCommission) * 100) / 100,
    status,
    problemReason: isProblem ? problemReasons[status]?.en : undefined,
    packages: 1 + (i % 3),
    weightKg: Math.round((0.5 + (i % 9) * 0.7) * 10) / 10,
    notes: i % 6 === 0 ? 'Call the customer before arriving — gate code required.' : undefined,
    createdAt: minsAgo(createdMins),
    deliveredAt: status === 'delivered' || status === 'closed' ? minsAgo(Math.max(4, createdMins - 38)) : undefined,
    etaMins: activeEnRoute ? 8 + (i % 20) : undefined,
    timeline: buildTimeline(status, createdMins, driver?.name),
  }
})
