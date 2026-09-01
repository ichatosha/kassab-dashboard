// ── Kassab domain models ──────────────────────────────────────────────
// These types mirror the future backend API contracts. Keep them
// framework-agnostic: no React types, no UI concerns.

export type VehicleType = 'motorcycle' | 'car' | 'tricycle'

export type DriverAccountStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended'
export type DriverConnection = 'online' | 'offline'
export type DriverActivity = 'idle' | 'delivering'

export type CompanyStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended'
export type BusinessType = 'company' | 'restaurant' | 'pharmacy' | 'retail' | 'ecommerce'

export type OrderStatus =
  | 'new'
  | 'assigned'
  | 'en_route_pickup'
  | 'picked_up'
  | 'en_route_customer'
  | 'delivered'
  | 'closed'
  | 'failed'
  | 'cancelled'
  | 'address_problem'
  | 'customer_unavailable'

export type PaymentMethod = 'cash' | 'wallet' | 'bank_transfer' | 'card'

export type DocumentStatus = 'pending' | 'approved' | 'rejected'

export interface DriverDocument {
  id: string
  kind: 'personal_photo' | 'national_id' | 'driving_license' | 'vehicle_license'
  status: DocumentStatus
  submittedAt: string
  note?: string
}

export interface Vehicle {
  type: VehicleType
  model: string
  plate: string
  color: string
  year: number
}

export interface Driver {
  id: string
  code: string
  name: string
  nameAr: string
  phone: string
  nationalId: string
  zone: string
  city: string
  status: DriverAccountStatus
  connection: DriverConnection
  activity: DriverActivity
  rating: number
  ratingCount: number
  vehicle: Vehicle
  walletNumber: string
  activeOrders: number
  completedOrders: number
  earningsMonth: number
  balance: number
  registeredAt: string
  documents: DriverDocument[]
  currentOrderId?: string
  // Simulated map position (percentage of viewport, replaced by lat/lng later)
  position: { x: number; y: number; heading: number }
}

export interface Branch {
  id: string
  companyId: string
  name: string
  nameAr: string
  address: string
  manager: string
  phone: string
  active: boolean
  dailyOrders: number
  monthlyOrders: number
  successRate: number
}

export interface Company {
  id: string
  code: string
  name: string
  nameAr: string
  type: BusinessType
  contactName: string
  phone: string
  email: string
  city: string
  status: CompanyStatus
  pricingProfile: string
  deliveryPrice: number
  activeOrders: number
  monthlyOrders: number
  monthlyRevenue: number
  outstandingBalance: number
  walletBalance: number
  avgDeliveryMins: number
  successRate: number
  registeredAt: string
  branchIds: string[]
}

export interface OrderTimelineEvent {
  status: OrderStatus
  at: string
  by?: string
  note?: string
}

export interface Order {
  id: string
  number: string
  companyId: string
  branchId?: string
  customerName: string
  customerPhone: string
  pickupAddress: string
  deliveryAddress: string
  zone: string
  driverId?: string
  vehicleType: VehicleType
  paymentMethod: PaymentMethod
  orderValue: number
  deliveryFee: number
  kassabCommission: number
  driverCommission: number
  status: OrderStatus
  problemReason?: string
  packages: number
  weightKg: number
  notes?: string
  createdAt: string
  deliveredAt?: string
  etaMins?: number
  timeline: OrderTimelineEvent[]
}

export type TransactionType =
  | 'delivery_earning'
  | 'withdrawal'
  | 'bonus'
  | 'adjustment'
  | 'order_charge'
  | 'payment'
  | 'invoice'

export interface WalletTransaction {
  id: string
  ownerType: 'driver' | 'company'
  ownerId: string
  type: TransactionType
  amount: number
  reference: string
  at: string
}

export type InvoiceStatus = 'paid' | 'due' | 'overdue'

export interface Invoice {
  id: string
  number: string
  companyId: string
  period: string
  ordersCount: number
  amount: number
  status: InvoiceStatus
  issuedAt: string
  dueAt: string
}

export type NotificationKind =
  | 'new_order'
  | 'order_accepted'
  | 'order_cancelled'
  | 'order_picked_up'
  | 'order_delivered'
  | 'bonus'
  | 'earnings'
  | 'admin_message'
  | 'driver_approval'
  | 'company_approval'

export interface AppNotification {
  id: string
  kind: NotificationKind
  titleKey: string
  body: string
  bodyAr: string
  at: string
  read: boolean
}

export interface ZonePricing {
  id: string
  zone: string
  zoneAr: string
  basePrice: number
  pricePerKm: number
  active: boolean
}

export interface VehiclePricing {
  id: string
  type: VehicleType
  basePrice: number
  perKm: number
  maxWeightKg: number
}

export interface AdditionalCharge {
  id: string
  nameKey: string
  amount: number
  kind: 'fixed' | 'percent'
  active: boolean
}

export interface CommissionRule {
  id: string
  appliesTo: BusinessType | 'default'
  kassabPercent: number
  driverPercent: number
}

export interface Rating {
  id: string
  orderId: string
  companyId: string
  driverId: string
  commitment: number
  behavior: number
  speed: number
  comment?: string
  commentAr?: string
  at: string
}

export interface RevenuePoint {
  date: string
  revenue: number
  commission: number
  orders: number
  driverPayouts: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'platform_owner' | 'operations_admin' | 'finance_admin' | 'support'
}
