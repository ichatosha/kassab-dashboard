import type {
  DeliveryOrder, DeliveryOrderStatus, DriverExternalIdentity, DriverLiveState,
  DriverWorkStatus, GeoPoint,
} from '../types/domain'
import { mockDrivers } from './drivers'
import { mockIntegrations } from './integrations'
import { cityCentre } from '../lib/geo'

// ── Operational demo data ─────────────────────────────────────────────
// Orders and driver positions are DERIVED from the drivers Kassab already
// placed, so the tracking map can never show a driver who is not on that
// company payroll. Only companies with a live integration — their own
// system, or Kassab tracking — produce orders at all.

const minsAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString()
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

// Deterministic scatter, so the map looks the same on every reload
const spread = (seed: number, scale: number) =>
  ((Math.sin(seed * 12.9898) * 43758.5453) % 1) * scale

function nearby(city: string, seed: number, scale = 0.03): GeoPoint {
  const c = cityCentre(city)
  return { lat: c.lat + spread(seed, scale), lng: c.lng + spread(seed + 7.3, scale) }
}

const CUSTOMERS = [
  { name: 'Mona Fathy', phone: '+20 100 884 2231' },
  { name: 'Kareem Sobhy', phone: '+20 101 552 7788' },
  { name: 'Rania Ismail', phone: '+20 102 337 9910' },
  { name: 'Sherif Adly', phone: '+20 106 771 2245' },
  { name: 'Doaa Mahmoud', phone: '+20 109 448 6620' },
  { name: 'Hazem Fouad', phone: '+20 111 220 5534' },
  { name: 'Nesma Gaber', phone: '+20 112 909 3312' },
  { name: 'Omar Shawky', phone: '+20 114 663 1180' },
]

const PICKUPS: Record<string, { en: string; ar: string }> = {
  'cmp-koshary': { en: 'Koshary El Tahrir — Downtown branch', ar: 'كشري التحرير — فرع وسط البلد' },
  'cmp-sehha': { en: 'Sehha Pharmacy — Dokki', ar: 'صيدلية صحة — الدقي' },
  'cmp-techzone': { en: 'TechZone warehouse — Obour', ar: 'مخزن تك زون — العبور' },
  'cmp-fresh': { en: 'Fresh Market — Gomhoria St.', ar: 'فريش ماركت — شارع الجمهورية' },
  'cmp-shawerma': { en: 'Shawerma House — El-Geish St.', ar: 'بيت الشاورما — شارع الجيش' },
  'cmp-misr': { en: 'Misr Logistics hub — Smouha', ar: 'مركز مصر للوجستيات — سموحة' },
}

const DROPOFFS: { en: string; ar: string }[] = [
  { en: 'Nasr City, Block 12', ar: 'مدينة نصر، بلوك ١٢' },
  { en: 'Mohandessin, Shehab St.', ar: 'المهندسين، شارع شهاب' },
  { en: 'Toriel, near the university', ar: 'توريل، بجوار الجامعة' },
  { en: 'El-Geish St., building 44', ar: 'شارع الجيش، عمارة ٤٤' },
  { en: 'Smouha, Victor Emanuel', ar: 'سموحة، فيكتور عمانويل' },
  { en: 'Sadat district, Zone 3', ar: 'حي السادات، المنطقة ٣' },
  { en: 'Downtown, Sherif St.', ar: 'وسط البلد، شارع شريف' },
  { en: 'Mansoura, Gehan St.', ar: 'المنصورة، شارع جيهان' },
]

// Cycled so the map always shows a realistic mix of activity
const ACTIVE_CYCLE: DeliveryOrderStatus[] = [
  'delivering', 'picked_up', 'delivering', 'assigned', 'picked_up', 'delivering',
]

const integratedCompanies = mockIntegrations
  .filter((i) => i.status === 'connected' || i.status === 'syncing')
  .map((i) => ({ companyId: i.companyId, integrationId: i.id, native: i.method === 'native' }))

// Drivers Kassab placed at a company that has an integration
const trackedDrivers = mockDrivers.filter(
  (d) => d.status === 'hired' && d.employment &&
    integratedCompanies.some((c) => c.companyId === d.employment!.companyId),
)

const orders: DeliveryOrder[] = []
const liveStates: DriverLiveState[] = []
const identities: DriverExternalIdentity[] = []

let seq = 0

trackedDrivers.forEach((driver, i) => {
  const companyId = driver.employment!.companyId
  const link = integratedCompanies.find((c) => c.companyId === companyId)!
  const city = driver.city

  // Every third driver is between jobs, one in eight is off shift
  const offShift = i % 8 === 3
  const idle = !offShift && i % 3 === 2
  const doneToday = 3 + (i % 6)

  // Two of the deliveries they finished earlier today
  for (let k = 0; k < 2; k++) {
    const customer = CUSTOMERS[(i + k) % CUSTOMERS.length]
    const drop = DROPOFFS[(i + k) % DROPOFFS.length]
    seq += 1
    orders.push({
      id: `ord-${String(seq).padStart(4, '0')}`,
      reference: `ORD-${10400 + seq}`,
      companyId,
      source: link.native ? 'kassab' : 'integration',
      integrationId: link.integrationId,
      driverId: driver.id,
      status: 'delivered',
      customerName: customer.name,
      customerPhone: customer.phone,
      pickup: nearby(city, i + 1, 0.012),
      pickupLabel: PICKUPS[companyId]?.en ?? city,
      pickupLabelAr: PICKUPS[companyId]?.ar ?? city,
      dropoff: nearby(city, i * 3 + k + 11),
      dropoffLabel: drop.en,
      dropoffLabelAr: drop.ar,
      city,
      amount: 120 + ((i + k) % 9) * 35,
      createdAt: minsAgo(240 - k * 60),
      assignedAt: minsAgo(235 - k * 60),
      pickedUpAt: minsAgo(225 - k * 60),
      deliveredAt: minsAgo(205 - k * 60),
    })
  }

  let status: DriverWorkStatus = 'available'
  let point = nearby(city, i + 2, 0.02)
  let activeOrderId: string | undefined

  if (offShift) {
    status = 'offline'
  } else if (!idle) {
    const customer = CUSTOMERS[i % CUSTOMERS.length]
    const drop = DROPOFFS[(i * 2) % DROPOFFS.length]
    const orderStatus = ACTIVE_CYCLE[i % ACTIVE_CYCLE.length]
    seq += 1
    const id = `ord-${String(seq).padStart(4, '0')}`
    const pickup = nearby(city, i + 1, 0.012)
    const dropoff = nearby(city, i * 5 + 3)
    orders.push({
      id,
      reference: `ORD-${10400 + seq}`,
      companyId,
      source: link.native ? 'kassab' : 'integration',
      integrationId: link.integrationId,
      driverId: driver.id,
      status: orderStatus,
      customerName: customer.name,
      customerPhone: customer.phone,
      pickup,
      pickupLabel: PICKUPS[companyId]?.en ?? city,
      pickupLabelAr: PICKUPS[companyId]?.ar ?? city,
      dropoff,
      dropoffLabel: drop.en,
      dropoffLabelAr: drop.ar,
      city,
      amount: 95 + (i % 12) * 30,
      createdAt: minsAgo(26 + (i % 10)),
      assignedAt: minsAgo(22 + (i % 8)),
      pickedUpAt: orderStatus === 'assigned' ? undefined : minsAgo(14 + (i % 6)),
    })
    activeOrderId = id
    // A driver who has not picked up yet is still standing at the branch
    status = orderStatus === 'assigned'
      ? 'at_pickup'
      : i % 11 === 5 ? 'delayed' : 'on_delivery'
    point = orderStatus === 'assigned'
      ? pickup
      : { lat: (pickup.lat + dropoff.lat) / 2, lng: (pickup.lng + dropoff.lng) / 2 }
  }

  liveStates.push({
    driverId: driver.id,
    companyId,
    status,
    point,
    city,
    orderId: activeOrderId,
    updatedAt: minsAgo(status === 'offline' ? 180 + i : (i % 4) + 1),
    // Location travels only while on shift, and only with consent
    shareLocation: status !== 'offline',
    deliveriesToday: doneToday,
  })

  // Drivers at a company running its own system also carry an ID there
  if (!link.native) {
    identities.push({
      kassabDriverId: driver.id,
      companyId,
      integrationId: link.integrationId,
      externalDriverId: `EMP-${8900 + i}`,
      externalName: driver.name,
      status: i % 7 === 4 ? 'pending' : 'linked',
      linkedAt: daysAgo(20 - (i % 15)),
    })
  }
})

// A couple of unassigned orders waiting for a driver, on the Kassab side
integratedCompanies.filter((c) => c.native).forEach((link, i) => {
  const driver = trackedDrivers.find((d) => d.employment?.companyId === link.companyId)
  const city = driver?.city ?? 'Mansoura'
  const customer = CUSTOMERS[(i + 4) % CUSTOMERS.length]
  const drop = DROPOFFS[(i + 5) % DROPOFFS.length]
  seq += 1
  orders.push({
    id: `ord-${String(seq).padStart(4, '0')}`,
    reference: `ORD-${10400 + seq}`,
    companyId: link.companyId,
    source: 'kassab',
    integrationId: link.integrationId,
    status: 'new',
    customerName: customer.name,
    customerPhone: customer.phone,
    pickup: nearby(city, i + 30, 0.012),
    pickupLabel: PICKUPS[link.companyId]?.en ?? city,
    pickupLabelAr: PICKUPS[link.companyId]?.ar ?? city,
    dropoff: nearby(city, i + 41),
    dropoffLabel: drop.en,
    dropoffLabelAr: drop.ar,
    city,
    amount: 140 + i * 25,
    createdAt: minsAgo(4 + i * 3),
  })
})

export const mockOrders: DeliveryOrder[] = orders.sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
)
export const mockLiveStates: DriverLiveState[] = liveStates
export const mockExternalIdentities: DriverExternalIdentity[] = identities
