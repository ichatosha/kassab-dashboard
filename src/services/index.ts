// ── Service layer ─────────────────────────────────────────────────────
// Components and the app store talk ONLY to these interfaces. Today they
// resolve from centralized mock data with simulated latency; swapping in
// a REST/GraphQL implementation later means replacing the objects at the
// bottom of this file without touching a single UI component.

import type {
  Application, AppNotification, Company, CompanyPayment, Driver,
  DriverPayout, Invoice, OpportunityEngagement, Rating, RevenuePoint,
  SalaryRecord, WalletTransaction, WorkforceRequest,
} from '../types/domain'
import { mockDrivers } from '../mocks/drivers'
import { mockCompanies, mockWorkforceRequests } from '../mocks/companies'
import { mockApplications } from '../mocks/applications'
import { mockEngagement } from '../mocks/engagement'
import { mockNotifications } from '../mocks/notifications'
import { mockRatings } from '../mocks/ratings'
import {
  mockInvoices, mockPayments, mockPayouts, mockRevenueSeries,
  mockSalaryRecords, mockTransactions,
} from '../mocks/finance'

const simulate = <T,>(data: T, delay = 320): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay))

export interface DriverService {
  list(): Promise<Driver[]>
}
export interface CompanyService {
  list(): Promise<Company[]>
}
export interface OpportunityService {
  list(): Promise<WorkforceRequest[]>
}
export interface ApplicationService {
  list(): Promise<Application[]>
}
export interface EngagementService {
  list(): Promise<OpportunityEngagement[]>
}
export interface SalaryService {
  list(): Promise<SalaryRecord[]>
}
export interface PaymentService {
  companyPayments(): Promise<CompanyPayment[]>
  driverPayouts(): Promise<DriverPayout[]>
}
export interface InvoiceService {
  list(): Promise<Invoice[]>
}
export interface ReportService {
  revenueSeries(): Promise<RevenuePoint[]>
}
export interface WalletService {
  transactions(): Promise<WalletTransaction[]>
}
export interface NotificationService {
  list(): Promise<AppNotification[]>
}
export interface RatingService {
  list(): Promise<Rating[]>
}

export const driversService: DriverService = { list: () => simulate(mockDrivers) }
export const companiesService: CompanyService = { list: () => simulate(mockCompanies) }
export const opportunitiesService: OpportunityService = { list: () => simulate(mockWorkforceRequests) }
export const applicationsService: ApplicationService = { list: () => simulate(mockApplications) }
export const engagementService: EngagementService = { list: () => simulate(mockEngagement, 180) }
export const salariesService: SalaryService = { list: () => simulate(mockSalaryRecords, 220) }
export const paymentsService: PaymentService = {
  companyPayments: () => simulate(mockPayments, 220),
  driverPayouts: () => simulate(mockPayouts, 220),
}
export const invoicesService: InvoiceService = { list: () => simulate(mockInvoices, 220) }
export const reportsService: ReportService = { revenueSeries: () => simulate(mockRevenueSeries, 200) }
export const walletService: WalletService = { transactions: () => simulate(mockTransactions, 200) }
export const notificationsService: NotificationService = { list: () => simulate(mockNotifications, 150) }
export const ratingsService: RatingService = { list: () => simulate(mockRatings, 150) }
