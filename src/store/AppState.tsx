import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import type {
  Application, ApplicationStatus, AppNotification, AuditAction, AuditLogEntry,
  Company, CompanyIntegration, CompanyPayment, DeliveryOrder,
  DeliveryOrderStatus, Driver, DriverExternalIdentity, DriverLiveState,
  DriverPayout, DriverStatus, DriverWorkStatus, Employee, EmployeeRole,
  EmploymentType, GeoPoint, IntegrationMethod, IntegrationSyncLog, Invoice,
  MotorcycleBrand, OpportunityEngagement, Rating, RevenuePoint, SalaryRecord,
  WalletTransaction, WorkforceRequest, WorkforceRequestStatus,
} from '../types/domain'
import {
  applicationsService, auditService, companiesService, driversService,
  employeesService, engagementService, integrationsService, invoicesService,
  notificationsService, opportunitiesService, ordersService, paymentsService,
  ratingsService, reportsService, salariesService, trackingService,
  walletService,
} from '../services'
import { realtime } from '../services/realtime'
import { useAuth } from './auth'

interface AppData {
  drivers: Driver[]
  companies: Company[]
  requests: WorkforceRequest[]
  applications: Application[]
  salaries: SalaryRecord[]
  payments: CompanyPayment[]
  payouts: DriverPayout[]
  invoices: Invoice[]
  revenueSeries: RevenuePoint[]
  transactions: WalletTransaction[]
  notifications: AppNotification[]
  ratings: Rating[]
  engagement: OpportunityEngagement[]
  employees: Employee[]
  auditLog: AuditLogEntry[]
  integrations: CompanyIntegration[]
  syncLogs: IntegrationSyncLog[]
  externalIdentities: DriverExternalIdentity[]
  orders: DeliveryOrder[]
  liveStates: DriverLiveState[]
}

interface AppState extends AppData {
  status: 'loading' | 'ready' | 'error'
  /** Who is acting right now, so sensitive changes can be attributed */
  actor: { id: string; name: string; nameAr: string } | null
  // What this visitor has already done, so a view is counted once and the
  // like/save buttons can show their own state.
  viewedOpportunities: string[]
  likedOpportunities: string[]
  savedOpportunities: string[]
}

export interface NewApplicationInput {
  driverId: string
  requestId: string
  availability: EmploymentType
  preferredArea: string
  experienceYears: number
  note?: string
}

export interface NewCompanyInput {
  name: string
  nameAr: string
  type: Company['type']
  city: string
  address: string
  contactName: string
  phone: string
  email: string
}

export interface NewDriverInput {
  name: string
  nameAr: string
  age: number
  city: string
  address: string
  phone: string
  brand: MotorcycleBrand
  model: string
  experienceYears: number
  availability: EmploymentType
}

export interface NewRequestInput {
  companyId: string
  driversRequired: number
  salary: number
  bonuses: number
  city: string
  area: string
  workingHours: string
  workingDays: string
  employmentType: EmploymentType
  experienceYears: number
  requirementKeys: string[]
  benefitKeys: string[]
  deadlineDays: number
  publish: boolean
}

export interface NewEmployeeInput {
  name: string
  nameAr: string
  username: string
  email: string
  phone: string
  role: EmployeeRole
  department: string
}

export interface NewOrderInput {
  companyId: string
  customerName: string
  customerPhone: string
  dropoffLabel: string
  city: string
  amount: number
  driverId?: string
  note?: string
}

export interface ConnectIntegrationInput {
  companyId: string
  providerId: string
  method: IntegrationMethod
  environment: 'production' | 'sandbox'
  baseUrl?: string
  apiKey?: string
}

type Action =
  | { type: 'loaded'; data: AppData }
  | { type: 'setActor'; actor: AppState['actor'] }
  | { type: 'addEmployee'; input: NewEmployeeInput; id: string }
  | { type: 'updateEmployee'; employeeId: string; changes: Partial<Employee> }
  | { type: 'setEmployeeStatus'; employeeId: string; status: Employee['status'] }
  | { type: 'connectIntegration'; input: ConnectIntegrationInput; id: string }
  | { type: 'disconnectIntegration'; integrationId: string }
  | { type: 'syncIntegration'; integrationId: string }
  | { type: 'testIntegration'; integrationId: string }
  | { type: 'createOrder'; input: NewOrderInput; id: string }
  | { type: 'assignOrder'; orderId: string; driverId: string }
  | { type: 'setOrderStatus'; orderId: string; status: DeliveryOrderStatus }
  | { type: 'setDriverWorkStatus'; driverId: string; status: DriverWorkStatus }
  | { type: 'setLocationSharing'; driverId: string; sharing: boolean }
  | { type: 'moveDrivers' }
  | { type: 'loadError' }
  | { type: 'setApplicationStatus'; applicationId: string; status: ApplicationStatus }
  | { type: 'submitApplication'; input: NewApplicationInput }
  | { type: 'setDriverStatus'; driverId: string; status: DriverStatus }
  | { type: 'setCompanyStatus'; companyId: string; status: Company['status'] }
  | { type: 'setRequestStatus'; requestId: string; status: WorkforceRequestStatus }
  | { type: 'markPaymentPaid'; paymentId: string }
  | { type: 'markPayoutPaid'; payoutId: string }
  | { type: 'markNotificationRead'; id: string }
  | { type: 'markAllNotificationsRead' }
  | { type: 'viewOpportunity'; requestId: string }
  | { type: 'toggleOpportunityLike'; requestId: string }
  | { type: 'toggleOpportunitySave'; requestId: string }
  | { type: 'addCompany'; input: NewCompanyInput; id: string }
  | { type: 'addDriver'; input: NewDriverInput; id: string }
  | { type: 'addRequest'; input: NewRequestInput; id: string }

const initialState: AppState = {
  status: 'loading',
  drivers: [], companies: [], requests: [], applications: [], salaries: [],
  payments: [], payouts: [], invoices: [], revenueSeries: [], transactions: [],
  notifications: [], ratings: [], engagement: [],
  employees: [], auditLog: [], integrations: [], syncLogs: [],
  externalIdentities: [], orders: [], liveStates: [],
  actor: null,
  viewedOpportunities: [], likedOpportunities: [], savedOpportunities: [],
}

const now = () => new Date().toISOString()

let notificationSeq = 0
const notify = (kind: AppNotification['kind'], body: string, bodyAr: string): AppNotification => ({
  id: `ntf-new-${++notificationSeq}`,
  kind,
  body,
  bodyAr,
  at: now(),
  read: false,
})

let auditSeq = 0
// Every sensitive change goes through here, so the audit trail is a
// by-product of doing the work rather than something to remember to write.
function record(
  state: AppState, action: AuditAction, entity: string, entityId: string,
  entityLabel: string, entityLabelAr: string, meta?: string,
): AuditLogEntry[] {
  return [{
    id: `aud-new-${++auditSeq}`,
    actorId: state.actor?.id ?? 'system',
    actorName: state.actor?.name ?? 'System',
    actorNameAr: state.actor?.nameAr ?? 'النظام',
    action, entity, entityId, entityLabel, entityLabelAr,
    at: now(), meta,
  }, ...state.auditLog]
}

let syncSeq = 0
function logSync(
  state: AppState, integrationId: string, kind: IntegrationSyncLog['kind'],
  ok: boolean, message: string, messageAr: string, ordersReceived?: number,
): IntegrationSyncLog[] {
  return [{
    id: `log-new-${++syncSeq}`,
    integrationId, at: now(), kind, ok, message, messageAr, ordersReceived,
  }, ...state.syncLogs]
}

const companyLabel = (state: AppState, companyId: string) =>
  state.companies.find((c) => c.id === companyId)?.name ?? companyId
const companyLabelAr = (state: AppState, companyId: string) =>
  state.companies.find((c) => c.id === companyId)?.nameAr ?? companyId

// A request's status follows from how many positions are filled, unless an
// operator has explicitly closed or cancelled it.
function recomputeRequestStatus(request: WorkforceRequest): WorkforceRequestStatus {
  if (['draft', 'closed', 'cancelled'].includes(request.status)) return request.status
  if (request.driversHired >= request.driversRequired) return 'filled'
  if (request.driversHired > 0) return 'partially_filled'
  return request.status === 'reviewing' ? 'reviewing' : 'open'
}

// Hiring and un-hiring both have to keep driver, request and company
// aggregates in step — this is the one place that knows how.
function applyHire(state: AppState, application: Application): AppState {
  const request = state.requests.find((r) => r.id === application.requestId)
  if (!request) return state
  const salary = request.salary
  return {
    ...state,
    drivers: state.drivers.map((d) =>
      d.id === application.driverId
        ? {
            ...d,
            status: 'hired' as DriverStatus,
            verified: true,
            employment: {
              companyId: request.companyId,
              requestId: request.id,
              salary,
              startDate: now(),
            },
            wallet: { ...d.wallet, pendingEarnings: salary, balance: salary },
          }
        : d,
    ),
    requests: state.requests.map((r) => {
      if (r.id !== request.id) return r
      const updated = { ...r, driversHired: r.driversHired + 1 }
      return { ...updated, status: recomputeRequestStatus(updated) }
    }),
    companies: state.companies.map((c) =>
      c.id === request.companyId
        ? { ...c, driversHired: c.driversHired + 1, monthlyWorkforceCost: c.monthlyWorkforceCost + salary }
        : c,
    ),
    // A hired driver is no longer a candidate elsewhere
    applications: state.applications.map((a) =>
      a.driverId === application.driverId && a.id !== application.id && !['rejected', 'withdrawn', 'hired'].includes(a.status)
        ? { ...a, status: 'withdrawn' as ApplicationStatus, updatedAt: now() }
        : a,
    ),
  }
}

function releaseHire(state: AppState, application: Application): AppState {
  const request = state.requests.find((r) => r.id === application.requestId)
  const driver = state.drivers.find((d) => d.id === application.driverId)
  if (!request || !driver) return state
  const salary = driver.employment?.salary ?? request.salary
  return {
    ...state,
    drivers: state.drivers.map((d) =>
      d.id === driver.id
        ? { ...d, status: 'available' as DriverStatus, employment: undefined, wallet: { ...d.wallet, pendingEarnings: 0, balance: 0 } }
        : d,
    ),
    requests: state.requests.map((r) => {
      if (r.id !== request.id) return r
      const updated = { ...r, driversHired: Math.max(0, r.driversHired - 1) }
      return { ...updated, status: recomputeRequestStatus(updated) }
    }),
    companies: state.companies.map((c) =>
      c.id === request.companyId
        ? {
            ...c,
            driversHired: Math.max(0, c.driversHired - 1),
            monthlyWorkforceCost: Math.max(0, c.monthlyWorkforceCost - salary),
          }
        : c,
    ),
  }
}

// Engagement counters only ever move by one, on the row for one opportunity.
function bumpEngagement(
  engagement: OpportunityEngagement[],
  requestId: string,
  change: Partial<Record<keyof Omit<OpportunityEngagement, 'requestId'>, number>>,
): OpportunityEngagement[] {
  const exists = engagement.some((e) => e.requestId === requestId)
  const blank: OpportunityEngagement = { requestId, views: 0, uniqueViewers: 0, likes: 0, saves: 0 }
  const rows = exists ? engagement : [...engagement, blank]
  return rows.map((e) =>
    e.requestId === requestId
      ? {
          ...e,
          views: Math.max(0, e.views + (change.views ?? 0)),
          uniqueViewers: Math.max(0, e.uniqueViewers + (change.uniqueViewers ?? 0)),
          likes: Math.max(0, e.likes + (change.likes ?? 0)),
          saves: Math.max(0, e.saves + (change.saves ?? 0)),
        }
      : e,
  )
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'loaded':
      return { ...state, ...action.data, status: 'ready' }
    case 'loadError':
      return { ...state, status: 'error' }

    case 'setApplicationStatus': {
      const application = state.applications.find((a) => a.id === action.applicationId)
      if (!application || application.status === action.status) return state

      let next: AppState = {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.applicationId ? { ...a, status: action.status, updatedAt: now() } : a,
        ),
      }
      if (action.status === 'hired' && application.status !== 'hired') {
        next = applyHire(next, application)
      } else if (application.status === 'hired' && action.status !== 'hired') {
        next = releaseHire(next, application)
      }
      return next
    }

    case 'submitApplication': {
      const { input } = action
      const request = state.requests.find((r) => r.id === input.requestId)
      if (!request) return state
      const seq = state.applications.length + 1
      const application: Application = {
        id: `app-new-${seq}`,
        number: `KSS-AP-${3100 + seq}`,
        driverId: input.driverId,
        requestId: request.id,
        companyId: request.companyId,
        status: 'new',
        appliedAt: now(),
        updatedAt: now(),
        availability: input.availability,
        preferredArea: input.preferredArea,
        experienceYears: input.experienceYears,
        note: input.note,
      }
      return { ...state, applications: [application, ...state.applications] }
    }

    case 'setDriverStatus':
      return {
        ...state,
        drivers: state.drivers.map((d) =>
          d.id === action.driverId
            ? { ...d, status: action.status, verified: action.status !== 'under_review' }
            : d,
        ),
      }

    case 'setCompanyStatus':
      return {
        ...state,
        companies: state.companies.map((c) =>
          c.id === action.companyId
            ? { ...c, status: action.status, verified: action.status === 'active' ? true : c.verified }
            : c,
        ),
      }

    case 'setRequestStatus':
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === action.requestId ? { ...r, status: action.status } : r,
        ),
      }

    case 'markPaymentPaid': {
      const payment = state.payments.find((p) => p.id === action.paymentId)
      if (!payment) return state
      return {
        ...state,
        payments: state.payments.map((p) =>
          p.id === action.paymentId ? { ...p, status: 'paid', paidAt: now() } : p,
        ),
        salaries: state.salaries.map((s) =>
          s.companyId === payment.companyId && s.period === payment.period
            ? { ...s, status: 'paid', paid: s.totalDue }
            : s,
        ),
        invoices: state.invoices.map((inv) =>
          inv.companyId === payment.companyId && inv.period === payment.period
            ? { ...inv, status: 'paid' }
            : inv,
        ),
        // Settling the company bill releases that company's driver payouts
        payouts: state.payouts.map((p) =>
          p.companyId === payment.companyId && p.period === payment.period && p.status === 'pending'
            ? { ...p, status: 'processing' }
            : p,
        ),
      }
    }

    case 'markPayoutPaid':
      return {
        ...state,
        payouts: state.payouts.map((p) =>
          p.id === action.payoutId ? { ...p, status: 'paid', paidAt: now() } : p,
        ),
      }

    case 'markNotificationRead':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      }
    case 'markAllNotificationsRead':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }

    // Opening an opportunity counts once per visitor, so re-opening the
    // same post from the back button does not inflate the numbers.
    case 'viewOpportunity': {
      if (state.viewedOpportunities.includes(action.requestId)) return state
      return {
        ...state,
        viewedOpportunities: [...state.viewedOpportunities, action.requestId],
        engagement: bumpEngagement(state.engagement, action.requestId, { views: 1, uniqueViewers: 1 }),
      }
    }

    case 'toggleOpportunityLike': {
      const liked = state.likedOpportunities.includes(action.requestId)
      return {
        ...state,
        likedOpportunities: liked
          ? state.likedOpportunities.filter((id) => id !== action.requestId)
          : [...state.likedOpportunities, action.requestId],
        engagement: bumpEngagement(state.engagement, action.requestId, { likes: liked ? -1 : 1 }),
      }
    }

    // ── Registration and publishing ──────────────────────────────────
    // Everything created here lands in the same shape as the seeded data,
    // so a new company or driver behaves like any other from that moment.
    case 'addCompany': {
      const { input, id } = action
      const company: Company = {
        id,
        code: `KSB-C${2001 + state.companies.length}`,
        name: input.name,
        nameAr: input.nameAr || input.name,
        type: input.type,
        city: input.city,
        address: input.address,
        contactName: input.contactName,
        contactNameAr: input.contactName,
        phone: input.phone,
        email: input.email,
        status: 'pending_review',
        verified: false,
        registeredAt: now(),
        driversRequired: 0,
        driversHired: 0,
        monthlyWorkforceCost: 0,
        kassabFeeRate: state.companies[0]?.kassabFeeRate ?? 0.125,
      }
      return {
        ...state,
        companies: [company, ...state.companies],
        notifications: [notify('new_company',
          `${input.name} registered and is awaiting review`,
          `${input.nameAr || input.name} سجّلت وفي انتظار المراجعة`,
        ), ...state.notifications],
      }
    }

    case 'addDriver': {
      const { input, id } = action
      const driver: Driver = {
        id,
        code: `KSB-D${1001 + state.drivers.length}`,
        name: input.name,
        nameAr: input.nameAr || input.name,
        age: input.age,
        address: input.address,
        city: input.city,
        phone: input.phone,
        motorcycle: { brand: input.brand, model: input.model },
        status: 'available',
        verified: false,
        performance: {
          rating: 0,
          ratingCount: 0,
          deliverySuccessRate: 0,
          completedDeliveries: 0,
          failedDeliveries: 0,
          cancelledDeliveries: 0,
          experienceYears: input.experienceYears,
        },
        wallet: { balance: 0, totalEarnings: 0, pendingEarnings: 0, paidEarnings: 0 },
        availability: input.availability,
        preferredArea: input.address,
        registeredAt: now(),
      }
      return {
        ...state,
        drivers: [driver, ...state.drivers],
        notifications: [notify('new_driver',
          `${input.name} registered as a delivery driver`,
          `${input.nameAr || input.name} سجّل كمندوب توصيل`,
        ), ...state.notifications],
      }
    }

    case 'addRequest': {
      const { input, id } = action
      const company = state.companies.find((c) => c.id === input.companyId)
      const seq = state.requests.length + 1
      const request: WorkforceRequest = {
        id,
        number: `KSS-WF-${1020 + seq}`,
        companyId: input.companyId,
        position: 'Motorcycle Delivery Driver',
        positionAr: 'مندوب توصيل موتوسيكل',
        driversRequired: input.driversRequired,
        driversHired: 0,
        salary: input.salary,
        bonuses: input.bonuses,
        city: input.city,
        area: input.area,
        areaAr: input.area,
        workingHours: input.workingHours,
        workingHoursAr: input.workingHours,
        workingDays: input.workingDays,
        workingDaysAr: input.workingDays,
        employmentType: input.employmentType,
        experienceYears: input.experienceYears,
        requirementKeys: input.requirementKeys,
        benefitKeys: input.benefitKeys,
        deadline: new Date(Date.now() + input.deadlineDays * 86400000).toISOString(),
        status: input.publish ? 'open' : 'draft',
        createdAt: now(),
      }
      return {
        ...state,
        requests: [request, ...state.requests],
        // The company's demand total grows with the new request
        companies: state.companies.map((c) =>
          c.id === input.companyId
            ? { ...c, driversRequired: c.driversRequired + input.driversRequired }
            : c,
        ),
        notifications: input.publish
          ? [notify('new_workforce_request',
              `${company?.name ?? 'A company'} published a request for ${input.driversRequired} drivers in ${input.city}`,
              `${company?.nameAr ?? 'شركة'} نشرت طلب ${input.driversRequired} مندوب في ${input.city}`,
            ), ...state.notifications]
          : state.notifications,
      }
    }

    case 'toggleOpportunitySave': {
      const saved = state.savedOpportunities.includes(action.requestId)
      return {
        ...state,
        savedOpportunities: saved
          ? state.savedOpportunities.filter((id) => id !== action.requestId)
          : [...state.savedOpportunities, action.requestId],
        engagement: bumpEngagement(state.engagement, action.requestId, { saves: saved ? -1 : 1 }),
      }
    }

    case 'setActor':
      return { ...state, actor: action.actor }

    // ── Kassab staff ────────────────────────────────────────────────
    case 'addEmployee': {
      const { input, id } = action
      const employee: Employee = {
        id,
        code: `KSB-E${101 + state.employees.length}`,
        name: input.name,
        nameAr: input.nameAr || input.name,
        username: input.username,
        email: input.email,
        phone: input.phone,
        role: input.role,
        department: input.department,
        departmentAr: input.department,
        status: 'active',
        createdAt: now(),
      }
      return {
        ...state,
        employees: [employee, ...state.employees],
        auditLog: record(state, 'employee.created', 'employee', id, input.name, input.nameAr || input.name),
      }
    }

    case 'updateEmployee': {
      const before = state.employees.find((e) => e.id === action.employeeId)
      if (!before) return state
      const roleChanged = action.changes.role && action.changes.role !== before.role
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.id === action.employeeId ? { ...e, ...action.changes } : e,
        ),
        auditLog: roleChanged
          ? record(state, 'employee.role_changed', 'employee', before.id, before.name, before.nameAr, action.changes.role)
          : state.auditLog,
      }
    }

    case 'setEmployeeStatus': {
      const employee = state.employees.find((e) => e.id === action.employeeId)
      if (!employee) return state
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.id === action.employeeId ? { ...e, status: action.status } : e,
        ),
        auditLog: record(
          state,
          action.status === 'active' ? 'employee.enabled' : 'employee.disabled',
          'employee', employee.id, employee.name, employee.nameAr,
        ),
      }
    }

    // ── Company integrations ────────────────────────────────────────
    case 'connectIntegration': {
      const { input, id } = action
      const native = input.method === 'native'
      const integration: CompanyIntegration = {
        id,
        companyId: input.companyId,
        providerId: input.providerId,
        method: input.method,
        status: 'connected',
        environment: input.environment,
        baseUrl: input.baseUrl,
        // The demo never keeps a key: only a masked stand-in is stored
        maskedKey: input.apiKey ? `${input.apiKey.slice(0, 3)}_••••••${input.apiKey.slice(-4)}` : undefined,
        webhookUrl: native ? undefined : `https://hooks.kassab.eg/v1/${input.companyId}/orders`,
        connectedAt: now(),
        lastSyncAt: now(),
        ordersToday: 0,
      }
      const name = companyLabel(state, input.companyId)
      const nameAr = companyLabelAr(state, input.companyId)
      return {
        ...state,
        // One live integration per company
        integrations: [
          integration,
          ...state.integrations.filter((i) => i.companyId !== input.companyId),
        ],
        syncLogs: logSync(
          state, id, 'connect', true,
          native ? 'Kassab tracking enabled' : 'Integration connected',
          native ? 'تم تفعيل تتبع كساب' : 'تم ربط النظام',
        ),
        auditLog: record(state, 'integration.connected', 'integration', id, name, nameAr, input.providerId),
      }
    }

    case 'disconnectIntegration': {
      const integration = state.integrations.find((i) => i.id === action.integrationId)
      if (!integration) return state
      return {
        ...state,
        integrations: state.integrations.map((i) =>
          i.id === action.integrationId
            ? { ...i, status: 'disconnected' as const, lastSyncAt: undefined }
            : i,
        ),
        syncLogs: logSync(state, integration.id, 'disconnect', true, 'Integration disconnected', 'تم فصل النظام'),
        auditLog: record(
          state, 'integration.disconnected', 'integration', integration.id,
          companyLabel(state, integration.companyId), companyLabelAr(state, integration.companyId),
        ),
      }
    }

    case 'syncIntegration': {
      const integration = state.integrations.find((i) => i.id === action.integrationId)
      if (!integration) return state
      const received = 3 + (state.syncLogs.length % 7)
      return {
        ...state,
        integrations: state.integrations.map((i) =>
          i.id === action.integrationId
            ? {
                ...i,
                status: 'connected' as const,
                errorMessageKey: undefined,
                lastSyncAt: now(),
                ordersToday: i.ordersToday + received,
              }
            : i,
        ),
        syncLogs: logSync(
          state, integration.id, 'sync', true,
          `Sync completed — ${received} orders received`,
          `اكتملت المزامنة — استُلم ${received} طلبًا`,
          received,
        ),
      }
    }

    case 'testIntegration': {
      const integration = state.integrations.find((i) => i.id === action.integrationId)
      if (!integration) return state
      return {
        ...state,
        syncLogs: logSync(state, integration.id, 'test', true, 'Connection test passed', 'نجح اختبار الاتصال'),
      }
    }

    // ── Deliveries ──────────────────────────────────────────────────
    // A company with no system of its own creates orders here, and the
    // driver moves them along from the Kassab driver app.
    case 'createOrder': {
      const { input, id } = action
      const integration = state.integrations.find(
        (i) => i.companyId === input.companyId && i.status !== 'disconnected',
      )
      const previous = state.orders.find((o) => o.companyId === input.companyId)
      const jitter = (state.orders.length % 9) * 0.002
      const pickup: GeoPoint = previous?.pickup ?? { lat: 30.0444, lng: 31.2357 }
      const order: DeliveryOrder = {
        id,
        reference: `ORD-${10600 + state.orders.length}`,
        companyId: input.companyId,
        source: 'kassab',
        integrationId: integration?.id,
        driverId: input.driverId,
        status: input.driverId ? 'assigned' : 'new',
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        pickup,
        pickupLabel: previous?.pickupLabel ?? companyLabel(state, input.companyId),
        pickupLabelAr: previous?.pickupLabelAr ?? companyLabelAr(state, input.companyId),
        dropoff: { lat: pickup.lat + 0.012 + jitter, lng: pickup.lng - 0.009 - jitter },
        dropoffLabel: input.dropoffLabel,
        dropoffLabelAr: input.dropoffLabel,
        city: input.city,
        amount: input.amount,
        createdAt: now(),
        assignedAt: input.driverId ? now() : undefined,
        note: input.note,
      }
      return {
        ...state,
        orders: [order, ...state.orders],
        integrations: state.integrations.map((i) =>
          i.id === integration?.id ? { ...i, ordersToday: i.ordersToday + 1, lastSyncAt: now() } : i,
        ),
        liveStates: input.driverId
          ? state.liveStates.map((l) =>
              l.driverId === input.driverId
                ? { ...l, status: 'at_pickup' as const, orderId: order.id, point: pickup, updatedAt: now() }
                : l,
            )
          : state.liveStates,
        auditLog: record(state, 'order.created', 'order', id, order.reference, order.reference),
      }
    }

    case 'assignOrder': {
      const order = state.orders.find((o) => o.id === action.orderId)
      if (!order) return state
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? { ...o, driverId: action.driverId, status: 'assigned' as const, assignedAt: now() }
            : o,
        ),
        liveStates: state.liveStates.map((l) =>
          l.driverId === action.driverId
            ? { ...l, status: 'at_pickup' as const, orderId: order.id, point: order.pickup, updatedAt: now() }
            : l,
        ),
        auditLog: record(state, 'order.assigned', 'order', order.id, order.reference, order.reference),
      }
    }

    case 'setOrderStatus': {
      const order = state.orders.find((o) => o.id === action.orderId)
      if (!order) return state
      const done = ['delivered', 'failed', 'cancelled'].includes(action.status)
      const updated: DeliveryOrder = {
        ...order,
        status: action.status,
        pickedUpAt: action.status === 'picked_up' ? now() : order.pickedUpAt,
        deliveredAt: action.status === 'delivered' ? now() : order.deliveredAt,
      }
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.orderId ? updated : o)),
        liveStates: state.liveStates.map((l) => {
          if (l.driverId !== order.driverId) return l
          if (done) {
            return {
              ...l,
              status: 'available' as const,
              orderId: undefined,
              deliveriesToday: action.status === 'delivered' ? l.deliveriesToday + 1 : l.deliveriesToday,
              updatedAt: now(),
            }
          }
          const moving = action.status === 'picked_up' || action.status === 'delivering'
          return {
            ...l,
            status: moving ? ('on_delivery' as const) : ('at_pickup' as const),
            orderId: order.id,
            updatedAt: now(),
          }
        }),
        // Finishing a run counts toward the record Kassab reports on
        drivers: action.status === 'delivered'
          ? state.drivers.map((d) =>
              d.id === order.driverId
                ? {
                    ...d,
                    performance: {
                      ...d.performance,
                      completedDeliveries: d.performance.completedDeliveries + 1,
                    },
                  }
                : d,
            )
          : state.drivers,
      }
    }

    case 'setDriverWorkStatus':
      return {
        ...state,
        liveStates: state.liveStates.map((l) =>
          l.driverId === action.driverId
            ? {
                ...l,
                status: action.status,
                shareLocation: action.status === 'offline' ? false : l.shareLocation,
                updatedAt: now(),
              }
            : l,
        ),
      }

    case 'setLocationSharing':
      return {
        ...state,
        liveStates: state.liveStates.map((l) =>
          l.driverId === action.driverId ? { ...l, shareLocation: action.sharing, updatedAt: now() } : l,
        ),
      }

    // One tick of the live feed: a driver on a run edges toward the customer
    case 'moveDrivers': {
      if (state.liveStates.length === 0) return state
      return {
        ...state,
        liveStates: state.liveStates.map((l) => {
          if (!l.shareLocation || !l.orderId) return l
          const order = state.orders.find((o) => o.id === l.orderId)
          if (!order) return l
          const target = l.status === 'at_pickup' ? order.pickup : order.dropoff
          return {
            ...l,
            point: {
              lat: l.point.lat + (target.lat - l.point.lat) * 0.12,
              lng: l.point.lng + (target.lng - l.point.lng) * 0.12,
            },
            updatedAt: now(),
          }
        }),
      }
    }

    default:
      return state
  }
}

interface AppStateContextValue extends AppState {
  dispatch: Dispatch<Action>
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  // Who is acting, so every audited change carries a name
  useEffect(() => {
    dispatch({
      type: 'setActor',
      actor: user ? { id: user.employeeId ?? user.id, name: user.name, nameAr: user.nameAr } : null,
    })
  }, [user])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [
          drivers, companies, requests, applications, salaries, payments,
          payouts, invoices, revenueSeries, transactions, notifications, ratings,
          engagement, employees, auditLog, integrations, syncLogs,
          externalIdentities, orders, liveStates,
        ] = await Promise.all([
          driversService.list(),
          companiesService.list(),
          opportunitiesService.list(),
          applicationsService.list(),
          salariesService.list(),
          paymentsService.companyPayments(),
          paymentsService.driverPayouts(),
          invoicesService.list(),
          reportsService.revenueSeries(),
          walletService.transactions(),
          notificationsService.list(),
          ratingsService.list(),
          engagementService.list(),
          employeesService.list(),
          auditService.list(),
          integrationsService.list(),
          integrationsService.logs(),
          integrationsService.identities(),
          ordersService.list(),
          trackingService.liveStates(),
        ])
        if (!cancelled) {
          dispatch({
            type: 'loaded',
            data: {
              drivers, companies, requests, applications, salaries, payments,
              payouts, invoices, revenueSeries, transactions, notifications,
              ratings, engagement, employees, auditLog, integrations, syncLogs,
              externalIdentities, orders, liveStates,
            },
          })
        }
      } catch {
        if (!cancelled) dispatch({ type: 'loadError' })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // The operations map is fed through the realtime abstraction rather than
  // a timer inside a component, so a real socket can take this over later.
  useEffect(() => {
    if (state.status !== 'ready') return
    const unsubscribe = realtime.subscribe('driver.location', () => {
      dispatch({ type: 'moveDrivers' })
    })
    const timer = window.setInterval(() => {
      realtime.publish('driver.location', { at: Date.now() })
    }, 4000)
    return () => {
      unsubscribe()
      window.clearInterval(timer)
    }
  }, [state.status])

  const value = useMemo(() => ({ ...state, dispatch }), [state])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
