// ── Kassab domain models ──────────────────────────────────────────────
// Kassab is a delivery workforce marketplace: companies publish workforce
// requests, drivers apply, Kassab runs recruitment and settles salaries.
// These types mirror the future backend API contracts — keep them
// framework-agnostic: no React types, no UI concerns.

// The platform has exactly ONE vehicle category: motorcycle.
// A driver only specifies which motorcycle brand/model he rides.
export type MotorcycleBrand = 'honda' | 'yamaha' | 'bajaj' | 'sym' | 'tvs' | 'other'

export interface Motorcycle {
  brand: MotorcycleBrand
  model: string
  // Collected when the driver's documents are verified, so a freshly
  // registered driver has a brand and model and nothing else yet.
  plate?: string
  year?: number
}

export type DriverStatus = 'available' | 'hired' | 'under_review' | 'suspended'

export type BusinessType = 'company' | 'restaurant' | 'pharmacy' | 'retail' | 'ecommerce'

export type CompanyStatus = 'pending_review' | 'active' | 'suspended'

export type WorkforceRequestStatus =
  | 'draft'
  | 'open'
  | 'reviewing'
  | 'partially_filled'
  | 'filled'
  | 'closed'
  | 'cancelled'

export type ApplicationStatus =
  | 'new'
  | 'under_review'
  | 'contacted'
  | 'interview'
  | 'accepted'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export type EmploymentType = 'full_time' | 'part_time' | 'shifts'

export type PaymentStatus = 'paid' | 'pending' | 'partially_paid' | 'overdue'

export type PayoutStatus = 'paid' | 'pending' | 'processing'

export type InvoiceStatus = 'paid' | 'due' | 'overdue'

export interface DriverWallet {
  balance: number
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
}

export interface DriverPerformance {
  rating: number
  ratingCount: number
  deliverySuccessRate: number
  completedDeliveries: number
  failedDeliveries: number
  cancelledDeliveries: number
  experienceYears: number
}

export interface DriverEmployment {
  companyId: string
  requestId: string
  salary: number
  startDate: string
}

export interface Driver {
  id: string
  code: string
  // Core profile — deliberately simple: name, age, address, phone, motorcycle
  name: string
  nameAr: string
  age: number
  address: string
  city: string
  phone: string
  motorcycle: Motorcycle
  status: DriverStatus
  verified: boolean
  performance: DriverPerformance
  wallet: DriverWallet
  employment?: DriverEmployment
  availability: EmploymentType
  preferredArea: string
  registeredAt: string
}

export interface Company {
  id: string
  code: string
  name: string
  nameAr: string
  type: BusinessType
  city: string
  address: string
  contactName: string
  contactNameAr: string
  phone: string
  email: string
  status: CompanyStatus
  verified: boolean
  registeredAt: string
  // Aggregates derived from workforce requests and hired drivers
  driversRequired: number
  driversHired: number
  monthlyWorkforceCost: number
  kassabFeeRate: number
}

export interface WorkforceRequest {
  id: string
  number: string
  companyId: string
  position: string
  positionAr: string
  driversRequired: number
  driversHired: number
  salary: number
  bonuses: number
  city: string
  area: string
  areaAr: string
  workingHours: string
  workingHoursAr: string
  workingDays: string
  workingDaysAr: string
  employmentType: EmploymentType
  experienceYears: number
  requirementKeys: string[]
  benefitKeys: string[]
  deadline: string
  status: WorkforceRequestStatus
  createdAt: string
}

// How much attention a published opportunity is drawing. Internal
// recruitment intelligence — ENGAGEMENT_ROLES in store/auth decides who
// is allowed to read it.
export interface OpportunityEngagement {
  requestId: string
  views: number
  uniqueViewers: number
  likes: number
  saves: number
}

export interface Application {
  id: string
  number: string
  driverId: string
  requestId: string
  companyId: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
  availability: EmploymentType
  preferredArea: string
  experienceYears: number
  note?: string
  noteAr?: string
}

export type TransactionType = 'salary' | 'bonus' | 'deduction' | 'withdrawal' | 'adjustment'

export interface WalletTransaction {
  id: string
  driverId: string
  type: TransactionType
  amount: number
  reference: string
  at: string
}

// One company's obligation for a billing period
export interface SalaryRecord {
  id: string
  companyId: string
  period: string
  driversCount: number
  salaryTotal: number
  kassabFee: number
  totalDue: number
  paid: number
  status: PaymentStatus
  dueDate: string
}

export interface CompanyPayment {
  id: string
  companyId: string
  period: string
  driverSalaries: number
  kassabFees: number
  total: number
  status: PaymentStatus
  dueDate: string
  paidAt?: string
}

export interface DriverPayout {
  id: string
  driverId: string
  companyId: string
  period: string
  salary: number
  bonus: number
  deductions: number
  net: number
  status: PayoutStatus
  paidAt?: string
}

export interface Invoice {
  id: string
  number: string
  companyId: string
  period: string
  driversCount: number
  salaries: number
  kassabFees: number
  total: number
  status: InvoiceStatus
  issuedAt: string
  dueAt: string
}

export type NotificationKind =
  | 'new_application'
  | 'application_reviewed'
  | 'candidate_accepted'
  | 'driver_hired'
  | 'new_workforce_request'
  | 'new_company'
  | 'new_driver'
  | 'payment_received'
  | 'payment_overdue'
  | 'invoice_generated'
  | 'salary_cycle'
  | 'admin_message'

export interface AppNotification {
  id: string
  kind: NotificationKind
  body: string
  bodyAr: string
  at: string
  read: boolean
}

export interface Rating {
  id: string
  driverId: string
  companyId: string
  punctuality: number
  behavior: number
  deliverySpeed: number
  comment?: string
  commentAr?: string
  at: string
}

// Monthly financial series for revenue analytics
export interface RevenuePoint {
  month: string
  salaryVolume: number
  kassabRevenue: number
  companyPayments: number
  hires: number
}

// ── Accounts ──────────────────────────────────────────────────────────
// Three audiences use the platform, each behind its own portal:
//   admin    — Kassab staff run recruitment and settlement
//   company  — an employer publishes requests and follows its workforce
//   delivery — a driver finds work and follows their applications
export type Portal = 'admin' | 'company' | 'delivery'

export type AccountRole =
  | 'platform_owner'
  | 'general_manager'
  | 'recruitment_admin'
  | 'finance_admin'
  | 'support'
  | 'company_owner'
  | 'driver'

export interface Account {
  id: string
  name: string
  nameAr: string
  email: string
  role: AccountRole
  /** The employer this account belongs to (company_owner only) */
  companyId?: string
  /** The driver this account belongs to (driver only) */
  driverId?: string
  /** The Kassab employee record behind a staff account */
  employeeId?: string
}

// ── Kassab staff, roles and permissions ───────────────────────────────
// Internal Kassab employees are a different population from delivery
// drivers and from company staff. Everything below is about Kassab's own
// people and what the platform lets them do.
export type EmployeeRole =
  | 'platform_owner'
  | 'general_manager'
  | 'recruitment_admin'
  | 'finance_admin'
  | 'support'

export type Permission =
  | 'companies.view' | 'companies.manage'
  | 'drivers.view' | 'drivers.manage'
  | 'applications.view' | 'applications.manage'
  | 'hiring.view' | 'hiring.manage'
  | 'workforce_tracking.view'
  | 'integrations.view' | 'integrations.manage'
  | 'finance.view' | 'finance.manage'
  | 'employees.view' | 'employees.manage'
  | 'audit.view'
  | 'reports.view'
  | 'settings.manage'

export type EmployeeStatus = 'active' | 'disabled'

export interface Employee {
  id: string
  code: string
  name: string
  nameAr: string
  username: string
  email: string
  phone: string
  role: EmployeeRole
  department: string
  departmentAr: string
  status: EmployeeStatus
  lastLoginAt?: string
  createdAt: string
  /** Extra permissions granted on top of the role */
  extraPermissions?: Permission[]
}

export type AuditAction =
  | 'employee.created' | 'employee.disabled' | 'employee.enabled' | 'employee.role_changed'
  | 'employee.password_reset'
  | 'company.approved' | 'company.suspended' | 'company.registered'
  | 'driver.approved' | 'driver.suspended' | 'driver.registered'
  | 'application.updated' | 'candidate.hired'
  | 'request.published' | 'request.closed'
  | 'payment.recorded' | 'payout.recorded'
  | 'integration.connected' | 'integration.disconnected' | 'integration.synced'
  | 'order.created' | 'order.assigned'

export interface AuditLogEntry {
  id: string
  actorId: string
  actorName: string
  actorNameAr: string
  action: AuditAction
  entity: string
  entityId: string
  entityLabel: string
  entityLabelAr: string
  at: string
  meta?: string
}

// ── Company system integrations ───────────────────────────────────────
// A company keeps its own system as the source of truth for orders;
// Kassab consumes a normalized feed so it can watch the workforce it
// placed there. A company with no system of its own runs on Kassab's own
// order tracking instead — same normalized model, different origin.
export type IntegrationKind = 'pos' | 'erp' | 'ecommerce' | 'logistics' | 'custom' | 'kassab'

export type IntegrationMethod = 'rest' | 'webhook' | 'oauth' | 'manual' | 'native'

export type IntegrationStatus =
  | 'not_connected' | 'connected' | 'syncing' | 'error' | 'disconnected'

export interface IntegrationProviderInfo {
  id: string
  name: string
  nameAr: string
  kind: IntegrationKind
  methods: IntegrationMethod[]
  descriptionKey: string
}

export interface CompanyIntegration {
  id: string
  companyId: string
  providerId: string
  method: IntegrationMethod
  status: IntegrationStatus
  environment: 'production' | 'sandbox'
  baseUrl?: string
  /** Never a real secret: the demo stores a masked stand-in only */
  maskedKey?: string
  webhookUrl?: string
  connectedAt?: string
  lastSyncAt?: string
  ordersToday: number
  errorMessageKey?: string
}

export interface IntegrationSyncLog {
  id: string
  integrationId: string
  at: string
  kind: 'sync' | 'webhook' | 'test' | 'error' | 'connect' | 'disconnect'
  ok: boolean
  message: string
  messageAr: string
  ordersReceived?: number
}

/** Which driver in the company's own system is this Kassab driver */
export interface DriverExternalIdentity {
  kassabDriverId: string
  companyId: string
  integrationId: string
  externalDriverId: string
  externalName: string
  status: 'linked' | 'pending'
  linkedAt: string
}

// ── Operational data ──────────────────────────────────────────────────
export interface GeoPoint {
  lat: number
  lng: number
}

export type DeliveryOrderStatus =
  | 'new' | 'assigned' | 'picked_up' | 'delivering' | 'delivered' | 'failed' | 'cancelled'

/** kassab = created in Kassab by a company without its own system */
export type OrderSource = 'kassab' | 'integration'

export interface DeliveryOrder {
  id: string
  reference: string
  companyId: string
  source: OrderSource
  integrationId?: string
  driverId?: string
  status: DeliveryOrderStatus
  customerName: string
  customerPhone: string
  pickup: GeoPoint
  pickupLabel: string
  pickupLabelAr: string
  dropoff: GeoPoint
  dropoffLabel: string
  dropoffLabelAr: string
  city: string
  amount: number
  createdAt: string
  assignedAt?: string
  pickedUpAt?: string
  deliveredAt?: string
  note?: string
}

export type DriverWorkStatus =
  | 'offline' | 'available' | 'at_pickup' | 'on_delivery' | 'delayed'

/** Where a working driver is right now, and whether they agreed to share it */
export interface DriverLiveState {
  driverId: string
  companyId?: string
  status: DriverWorkStatus
  point: GeoPoint
  city: string
  orderId?: string
  updatedAt: string
  shareLocation: boolean
  deliveriesToday: number
}

export interface LocationPing {
  at: string
  point: GeoPoint
  label: string
  labelAr: string
}

/** Credentials Kassab issues to a company so its system can call in */
export interface ApiCredential {
  companyId: string
  /** Shown in full once at creation; masked everywhere after that */
  token: string
  createdAt: string
  lastUsedAt?: string
  createdBy: string
}
