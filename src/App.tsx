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
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage').then((m) => ({ default: m.OpportunitiesPage })))
const OpportunityDetailsPage = lazy(() => import('./pages/OpportunityDetailsPage').then((m) => ({ default: m.OpportunityDetailsPage })))
const RequestsPage = lazy(() => import('./pages/RequestsPage').then((m) => ({ default: m.RequestsPage })))
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage').then((m) => ({ default: m.ApplicationsPage })))
const PipelinePage = lazy(() => import('./pages/PipelinePage').then((m) => ({ default: m.PipelinePage })))
const DriversPage = lazy(() => import('./pages/DriversPage').then((m) => ({ default: m.DriversPage })))
const DriverProfilePage = lazy(() => import('./pages/DriverProfilePage').then((m) => ({ default: m.DriverProfilePage })))
const CompaniesPage = lazy(() => import('./pages/CompaniesPage').then((m) => ({ default: m.CompaniesPage })))
const CompanyDetailsPage = lazy(() => import('./pages/CompanyDetailsPage').then((m) => ({ default: m.CompanyDetailsPage })))
const SalariesPage = lazy(() => import('./pages/SalariesPage').then((m) => ({ default: m.SalariesPage })))
const PaymentsPage = lazy(() => import('./pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage })))
const PayoutsPage = lazy(() => import('./pages/PayoutsPage').then((m) => ({ default: m.PayoutsPage })))
const InvoicesPage = lazy(() => import('./pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage })))
const RevenuePage = lazy(() => import('./pages/RevenuePage').then((m) => ({ default: m.RevenuePage })))
const PerformancePage = lazy(() => import('./pages/PerformancePage').then((m) => ({ default: m.PerformancePage })))
const RatingsPage = lazy(() => import('./pages/RatingsPage').then((m) => ({ default: m.RatingsPage })))
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

                    {/* Workforce */}
                    <Route path="/opportunities" element={<OpportunitiesPage />} />
                    <Route path="/opportunities/:id" element={<OpportunityDetailsPage />} />
                    <Route path="/requests" element={<RequestsPage />} />
                    <Route path="/applications" element={<ApplicationsPage />} />
                    <Route path="/pipeline" element={<PipelinePage />} />

                    {/* Drivers */}
                    <Route path="/drivers" element={<DriversPage scope="all" />} />
                    <Route path="/drivers/available" element={<DriversPage scope="available" />} />
                    <Route path="/drivers/hired" element={<DriversPage scope="hired" />} />
                    <Route path="/drivers/profile/:id" element={<DriverProfilePage />} />

                    {/* Companies */}
                    <Route path="/companies" element={<CompaniesPage scope="all" />} />
                    <Route path="/companies/hiring" element={<CompaniesPage scope="hiring" />} />
                    <Route path="/companies/:id" element={<CompanyDetailsPage />} />

                    {/* Finance */}
                    <Route path="/salaries" element={<SalariesPage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/payouts" element={<PayoutsPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/revenue" element={<RevenuePage />} />

                    {/* Performance */}
                    <Route path="/performance" element={<PerformancePage />} />
                    <Route path="/ratings" element={<RatingsPage />} />
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
