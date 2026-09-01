import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type {
  AdditionalCharge, AppNotification, Branch, CommissionRule, Company,
  Driver, DriverAccountStatus, Invoice, Order, OrderStatus, Rating,
  RevenuePoint, VehiclePricing, WalletTransaction, ZonePricing,
} from '../types/domain'
import {
  companyService, driverService, financeService, notificationService,
  orderService, pricingService, ratingService,
} from '../services'
import { nextStatus } from '../lib/status'

interface AppData {
  drivers: Driver[]
  companies: Company[]
  branches: Branch[]
  orders: Order[]
  notifications: AppNotification[]
  ratings: Rating[]
  zonePricing: ZonePricing[]
  vehiclePricing: VehiclePricing[]
  charges: AdditionalCharge[]
  commissionRules: CommissionRule[]
  revenueSeries: RevenuePoint[]
  invoices: Invoice[]
  driverTransactions: WalletTransaction[]
  companyTransactions: WalletTransaction[]
}

interface AppState extends AppData {
  status: 'loading' | 'ready' | 'error'
}

type Action =
  | { type: 'loaded'; data: AppData }
  | { type: 'loadError' }
  | { type: 'setDriverStatus'; driverId: string; status: DriverAccountStatus }
  | { type: 'assignDriver'; orderId: string; driverId: string }
  | { type: 'cancelAssignment'; orderId: string }
  | { type: 'advanceOrder'; orderId: string }
  | { type: 'setOrderProblem'; orderId: string; status: OrderStatus; reason: string }
  | { type: 'cancelOrder'; orderId: string }
  | { type: 'setCompanyStatus'; companyId: string; status: Company['status'] }
  | { type: 'markNotificationRead'; id: string }
  | { type: 'markAllNotificationsRead' }
  | { type: 'updateZonePricing'; zones: ZonePricing[] }
  | { type: 'updateVehiclePricing'; vehicles: VehiclePricing[] }
  | { type: 'updateCharges'; charges: AdditionalCharge[] }
  | { type: 'updateCommissionRules'; rules: CommissionRule[] }
  | { type: 'updateCompanyPrice'; companyId: string; price: number }

const initialState: AppState = {
  status: 'loading',
  drivers: [], companies: [], branches: [], orders: [], notifications: [],
  ratings: [], zonePricing: [], vehiclePricing: [], charges: [],
  commissionRules: [], revenueSeries: [], invoices: [],
  driverTransactions: [], companyTransactions: [],
}

const now = () => new Date().toISOString()

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'loaded':
      return { ...state, ...action.data, status: 'ready' }
    case 'loadError':
      return { ...state, status: 'error' }
    case 'setDriverStatus':
      return {
        ...state,
        drivers: state.drivers.map((d) =>
          d.id === action.driverId
            ? {
                ...d,
                status: action.status,
                connection: action.status === 'approved' ? d.connection : 'offline',
                documents:
                  action.status === 'approved'
                    ? d.documents.map((doc) => ({ ...doc, status: 'approved' as const }))
                    : action.status === 'rejected'
                      ? d.documents.map((doc) => ({ ...doc, status: 'rejected' as const }))
                      : d.documents,
              }
            : d,
        ),
      }
    case 'assignDriver': {
      const driver = state.drivers.find((d) => d.id === action.driverId)
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? {
                ...o,
                driverId: action.driverId,
                status: 'assigned',
                vehicleType: driver?.vehicle.type ?? o.vehicleType,
                timeline: [
                  ...o.timeline,
                  { status: 'assigned' as const, at: now(), by: 'Dispatch', note: driver?.name },
                ],
              }
            : o,
        ),
        drivers: state.drivers.map((d) =>
          d.id === action.driverId
            ? { ...d, activeOrders: d.activeOrders + 1, activity: 'delivering' as const, currentOrderId: action.orderId }
            : d,
        ),
      }
    }
    case 'cancelAssignment': {
      const order = state.orders.find((o) => o.id === action.orderId)
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? { ...o, driverId: undefined, status: 'new', timeline: [...o.timeline, { status: 'new' as const, at: now(), by: 'Dispatch', note: 'Assignment cancelled' }] }
            : o,
        ),
        drivers: state.drivers.map((d) =>
          d.id === order?.driverId
            ? { ...d, activeOrders: Math.max(0, d.activeOrders - 1), activity: 'idle' as const, currentOrderId: undefined }
            : d,
        ),
      }
    }
    case 'advanceOrder': {
      const order = state.orders.find((o) => o.id === action.orderId)
      if (!order) return state
      const next = nextStatus(order.status)
      if (!next) return state
      const finished = next === 'delivered' || next === 'closed'
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? {
                ...o,
                status: next,
                deliveredAt: next === 'delivered' ? now() : o.deliveredAt,
                etaMins: finished ? undefined : o.etaMins,
                timeline: [...o.timeline, { status: next, at: now(), by: 'Operations' }],
              }
            : o,
        ),
        drivers:
          finished && order.driverId
            ? state.drivers.map((d) =>
                d.id === order.driverId
                  ? { ...d, activeOrders: Math.max(0, d.activeOrders - 1), activity: 'idle' as const, completedOrders: d.completedOrders + (next === 'delivered' ? 1 : 0), currentOrderId: undefined }
                  : d,
              )
            : state.drivers,
      }
    }
    case 'setOrderProblem':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? { ...o, status: action.status, problemReason: action.reason, timeline: [...o.timeline, { status: action.status, at: now(), by: 'Operations', note: action.reason }] }
            : o,
        ),
      }
    case 'cancelOrder': {
      const order = state.orders.find((o) => o.id === action.orderId)
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? { ...o, status: 'cancelled', problemReason: 'Cancelled by operations', timeline: [...o.timeline, { status: 'cancelled' as const, at: now(), by: 'Operations' }] }
            : o,
        ),
        drivers: state.drivers.map((d) =>
          d.id === order?.driverId
            ? { ...d, activeOrders: Math.max(0, d.activeOrders - 1), activity: 'idle' as const, currentOrderId: undefined }
            : d,
        ),
      }
    }
    case 'setCompanyStatus':
      return {
        ...state,
        companies: state.companies.map((c) =>
          c.id === action.companyId ? { ...c, status: action.status } : c,
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
    case 'updateZonePricing':
      return { ...state, zonePricing: action.zones }
    case 'updateVehiclePricing':
      return { ...state, vehiclePricing: action.vehicles }
    case 'updateCharges':
      return { ...state, charges: action.charges }
    case 'updateCommissionRules':
      return { ...state, commissionRules: action.rules }
    case 'updateCompanyPrice':
      return {
        ...state,
        companies: state.companies.map((c) =>
          c.id === action.companyId ? { ...c, deliveryPrice: action.price } : c,
        ),
      }
    default:
      return state
  }
}

interface AppStateContextValue extends AppState {
  dispatch: React.Dispatch<Action>
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [
          drivers, companies, branches, orders, notifications, ratings,
          zonePricing, vehiclePricing, charges, commissionRules,
          revenueSeries, invoices, driverTransactions, companyTransactions,
        ] = await Promise.all([
          driverService.list(),
          companyService.list(),
          companyService.listBranches(),
          orderService.list(),
          notificationService.list(),
          ratingService.list(),
          pricingService.zones(),
          pricingService.vehicles(),
          pricingService.charges(),
          pricingService.commissionRules(),
          financeService.revenueSeries(),
          financeService.invoices(),
          financeService.driverTransactions(),
          financeService.companyTransactions(),
        ])
        if (!cancelled) {
          dispatch({
            type: 'loaded',
            data: {
              drivers, companies, branches, orders, notifications, ratings,
              zonePricing, vehiclePricing, charges, commissionRules,
              revenueSeries, invoices, driverTransactions, companyTransactions,
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
