import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import type {
  Application, ApplicationStatus, AppNotification, Company, CompanyPayment,
  Driver, DriverPayout, DriverStatus, EmploymentType, Invoice, Rating,
  RevenuePoint, SalaryRecord, WalletTransaction, WorkforceRequest,
  WorkforceRequestStatus,
} from '../types/domain'
import {
  applicationsService, companiesService, driversService, invoicesService,
  notificationsService, opportunitiesService, paymentsService, ratingsService,
  reportsService, salariesService, walletService,
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
}

interface AppState extends AppData {
  status: 'loading' | 'ready' | 'error'
}

export interface NewApplicationInput {
  driverId: string
  requestId: string
  availability: EmploymentType
  preferredArea: string
  experienceYears: number
  note?: string
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

const initialState: AppState = {
  status: 'loading',
  drivers: [], companies: [], requests: [], applications: [], salaries: [],
  payments: [], payouts: [], invoices: [], revenueSeries: [], transactions: [],
  notifications: [], ratings: [],
}

const now = () => new Date().toISOString()

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
        ])
        if (!cancelled) {
          dispatch({
            type: 'loaded',
            data: {
              drivers, companies, requests, applications, salaries, payments,
              payouts, invoices, revenueSeries, transactions, notifications, ratings,
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
