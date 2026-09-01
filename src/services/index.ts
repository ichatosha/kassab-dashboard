// ── Service layer ─────────────────────────────────────────────────────
// Components and the app store talk ONLY to these interfaces. Today they
// resolve from centralized mock data with simulated latency; swapping in
// a REST/GraphQL implementation later means replacing the factory below
// without touching UI code.

import type {
  AdditionalCharge, AppNotification, Branch, CommissionRule, Company,
  Driver, Invoice, Order, Rating, RevenuePoint, VehiclePricing,
  WalletTransaction, ZonePricing,
} from '../types/domain'
import { mockDrivers } from '../mocks/drivers'
import { mockCompanies, mockBranches } from '../mocks/companies'
import { mockOrders } from '../mocks/orders'
import { mockNotifications } from '../mocks/notifications'
import { mockRatings } from '../mocks/ratings'
import {
  mockAdditionalCharges, mockCommissionRules, mockVehiclePricing, mockZonePricing,
} from '../mocks/pricing'
import {
  mockCompanyTransactions, mockDriverTransactions, mockInvoices, mockRevenueSeries,
} from '../mocks/finance'

const simulate = <T,>(data: T, delay = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay))

export interface DriverService {
  list(): Promise<Driver[]>
}
export interface CompanyService {
  list(): Promise<Company[]>
  listBranches(): Promise<Branch[]>
}
export interface OrderService {
  list(): Promise<Order[]>
}
export interface PricingService {
  zones(): Promise<ZonePricing[]>
  vehicles(): Promise<VehiclePricing[]>
  charges(): Promise<AdditionalCharge[]>
  commissionRules(): Promise<CommissionRule[]>
}
export interface FinanceService {
  revenueSeries(): Promise<RevenuePoint[]>
  invoices(): Promise<Invoice[]>
  driverTransactions(): Promise<WalletTransaction[]>
  companyTransactions(): Promise<WalletTransaction[]>
}
export interface NotificationService {
  list(): Promise<AppNotification[]>
}
export interface RatingService {
  list(): Promise<Rating[]>
}

export const driverService: DriverService = {
  list: () => simulate(mockDrivers),
}
export const companyService: CompanyService = {
  list: () => simulate(mockCompanies),
  listBranches: () => simulate(mockBranches),
}
export const orderService: OrderService = {
  list: () => simulate(mockOrders),
}
export const pricingService: PricingService = {
  zones: () => simulate(mockZonePricing, 200),
  vehicles: () => simulate(mockVehiclePricing, 200),
  charges: () => simulate(mockAdditionalCharges, 200),
  commissionRules: () => simulate(mockCommissionRules, 200),
}
export const financeService: FinanceService = {
  revenueSeries: () => simulate(mockRevenueSeries, 250),
  invoices: () => simulate(mockInvoices, 250),
  driverTransactions: () => simulate(mockDriverTransactions, 250),
  companyTransactions: () => simulate(mockCompanyTransactions, 250),
}
export const notificationService: NotificationService = {
  list: () => simulate(mockNotifications, 150),
}
export const ratingService: RatingService = {
  list: () => simulate(mockRatings, 150),
}
