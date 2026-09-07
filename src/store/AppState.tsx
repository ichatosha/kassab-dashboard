import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import type {
  Application, ApplicationStatus, AppNotification, Company, CompanyPayment,
  Driver, DriverPayout, DriverStatus, EmploymentType, Invoice, MotorcycleBrand,
  OpportunityEngagement, Rating, RevenuePoint, SalaryRecord, WalletTransaction,
  WorkforceRequest, WorkforceRequestStatus,
} from '../types/domain'
import {
  applicationsService, companiesService, driversService, engagementService,
  invoicesService, notificationsService, opportunitiesService, paymentsService,
  ratingsService, reportsService, salariesService, walletService,
} from '../services'

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
}

interface AppState extends AppData {
  status: 'loading' | 'ready' | 'error'
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

type Action =
  | { type: 'loaded'; data: AppData }
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

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [
          drivers, companies, requests, applications, salaries, payments,
          payouts, invoices, revenueSeries, transactions, notifications, ratings,
          engagement,
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
        ])
        if (!cancelled) {
          dispatch({
            type: 'loaded',
            data: {
              drivers, companies, requests, applications, salaries, payments,
              payouts, invoices, revenueSeries, transactions, notifications,
              ratings, engagement,
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

  const value = useMemo(() => ({ ...state, dispatch }), [state])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
