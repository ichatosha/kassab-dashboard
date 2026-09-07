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
  plate: string
  year: number
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

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'platform_owner' | 'recruitment_admin' | 'finance_admin' | 'support'
}
