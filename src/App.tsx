import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n'
import { AuthProvider } from './store/auth'
import { AppStateProvider } from './store/AppState'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/layout/AppLayout'
import { PageSkeleton } from './components/ui/Skeleton'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'

// Route-level code splitting keeps the public landing and login bundles
// small; the chart-heavy admin pages load on demand.
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const TrackingPage = lazy(() => import('./pages/TrackingPage').then((m) => ({ default: m.TrackingPage })))
const DriversPage = lazy(() => import('./pages/DriversPage').then((m) => ({ default: m.DriversPage })))
const DriverProfilePage = lazy(() => import('./pages/DriverProfilePage').then((m) => ({ default: m.DriverProfilePage })))
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage').then((m) => ({ default: m.ApprovalsPage })))
const VehiclesPage = lazy(() => import('./pages/VehiclesPage').then((m) => ({ default: m.VehiclesPage })))
const CompaniesPage = lazy(() => import('./pages/CompaniesPage').then((m) => ({ default: m.CompaniesPage })))
const CompanyDetailsPage = lazy(() => import('./pages/CompanyDetailsPage').then((m) => ({ default: m.CompanyDetailsPage })))
const BranchesPage = lazy(() => import('./pages/BranchesPage').then((m) => ({ default: m.BranchesPage })))
const PricingPage = lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })))
const CommissionsPage = lazy(() => import('./pages/CommissionsPage').then((m) => ({ default: m.CommissionsPage })))
const FinancePage = lazy(() => import('./pages/FinancePage').then((m) => ({ default: m.FinancePage })))
const WalletsPage = lazy(() => import('./pages/WalletsPage').then((m) => ({ default: m.WalletsPage })))
const InvoicesPage = lazy(() => import('./pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage })))
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AuthProvider>
          <AppStateProvider>
            <BrowserRouter>
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/tracking" element={<TrackingPage />} />
                    <Route path="/drivers" element={<DriversPage />} />
                    <Route path="/drivers/:id" element={<DriverProfilePage />} />
                    <Route path="/approvals" element={<ApprovalsPage />} />
                    <Route path="/vehicles" element={<VehiclesPage />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/companies/:id" element={<CompanyDetailsPage />} />
                    <Route path="/branches" element={<BranchesPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/commissions" element={<CommissionsPage />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/wallets" element={<WalletsPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AppStateProvider>
        </AuthProvider>
      </ToastProvider>
    </I18nProvider>
  )
}
