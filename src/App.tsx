import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n'
import { AuthProvider } from './store/auth'
import { AppStateProvider } from './store/AppState'
import { ToastProvider } from './components/ui/Toast'
import { AdminLayout } from './components/layout/AdminLayout'
import { CompanyLayout } from './components/layout/CompanyLayout'
import { DeliveryLayout } from './components/layout/DeliveryLayout'
import { PageSkeleton } from './components/ui/Skeleton'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'

// Route-level code splitting keeps the public pages small; the chart-heavy
// admin screens load on demand.
const RegisterCompanyPage = lazy(() => import('./pages/register/RegisterCompanyPage').then((m) => ({ default: m.RegisterCompanyPage })))
const RegisterDriverPage = lazy(() => import('./pages/register/RegisterDriverPage').then((m) => ({ default: m.RegisterDriverPage })))

// ── Kassab staff ──────────────────────────────────────────────────────
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

// ── Employer portal ───────────────────────────────────────────────────
const CompanyOverviewPage = lazy(() => import('./pages/company/CompanyOverviewPage').then((m) => ({ default: m.CompanyOverviewPage })))
const CompanyRequestsPage = lazy(() => import('./pages/company/CompanyRequestsPage').then((m) => ({ default: m.CompanyRequestsPage })))
const NewRequestPage = lazy(() => import('./pages/company/NewRequestPage').then((m) => ({ default: m.NewRequestPage })))
const CompanyApplicantsPage = lazy(() => import('./pages/company/CompanyApplicantsPage').then((m) => ({ default: m.CompanyApplicantsPage })))
const CompanyDriversPage = lazy(() => import('./pages/company/CompanyDriversPage').then((m) => ({ default: m.CompanyDriversPage })))
const CompanyBillingPage = lazy(() => import('./pages/company/CompanyBillingPage').then((m) => ({ default: m.CompanyBillingPage })))
const CompanyProfilePage = lazy(() => import('./pages/company/CompanyProfilePage').then((m) => ({ default: m.CompanyProfilePage })))

// ── Driver portal ─────────────────────────────────────────────────────
const DriverHomePage = lazy(() => import('./pages/delivery/DriverHomePage').then((m) => ({ default: m.DriverHomePage })))
const DriverJobsPage = lazy(() => import('./pages/delivery/DriverJobsPage').then((m) => ({ default: m.DriverJobsPage })))
const DriverJobDetailsPage = lazy(() => import('./pages/delivery/DriverJobDetailsPage').then((m) => ({ default: m.DriverJobDetailsPage })))
const DriverApplicationsPage = lazy(() => import('./pages/delivery/DriverApplicationsPage').then((m) => ({ default: m.DriverApplicationsPage })))
const DriverWalletPage = lazy(() => import('./pages/delivery/DriverWalletPage').then((m) => ({ default: m.DriverWalletPage })))
const DriverAccountPage = lazy(() => import('./pages/delivery/DriverAccountPage').then((m) => ({ default: m.DriverAccountPage })))

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AuthProvider>
          <AppStateProvider>
            <BrowserRouter>
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register/company" element={<RegisterCompanyPage />} />
                  <Route path="/register/driver" element={<RegisterDriverPage />} />

                  {/* Kassab staff */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="opportunities" element={<OpportunitiesPage />} />
                    <Route path="opportunities/:id" element={<OpportunityDetailsPage />} />
                    <Route path="requests" element={<RequestsPage />} />
                    <Route path="applications" element={<ApplicationsPage />} />
                    <Route path="pipeline" element={<PipelinePage />} />

                    <Route path="drivers" element={<DriversPage scope="all" />} />
                    <Route path="drivers/available" element={<DriversPage scope="available" />} />
                    <Route path="drivers/hired" element={<DriversPage scope="hired" />} />
                    <Route path="drivers/profile/:id" element={<DriverProfilePage />} />

                    <Route path="companies" element={<CompaniesPage scope="all" />} />
                    <Route path="companies/hiring" element={<CompaniesPage scope="hiring" />} />
                    <Route path="companies/:id" element={<CompanyDetailsPage />} />

                    <Route path="salaries" element={<SalariesPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="payouts" element={<PayoutsPage />} />
                    <Route path="invoices" element={<InvoicesPage />} />
                    <Route path="revenue" element={<RevenuePage />} />

                    <Route path="performance" element={<PerformancePage />} />
                    <Route path="ratings" element={<RatingsPage />} />
                    <Route path="reports" element={<ReportsPage />} />

                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Employers */}
                  <Route path="/company" element={<CompanyLayout />}>
                    <Route index element={<CompanyOverviewPage />} />
                    <Route path="requests" element={<CompanyRequestsPage />} />
                    <Route path="requests/new" element={<NewRequestPage />} />
                    <Route path="applicants" element={<CompanyApplicantsPage />} />
                    <Route path="drivers" element={<CompanyDriversPage />} />
                    <Route path="billing" element={<CompanyBillingPage />} />
                    <Route path="settings" element={<CompanyProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Drivers */}
                  <Route path="/delivery" element={<DeliveryLayout />}>
                    <Route index element={<DriverHomePage />} />
                    <Route path="jobs" element={<DriverJobsPage />} />
                    <Route path="jobs/:id" element={<DriverJobDetailsPage />} />
                    <Route path="applications" element={<DriverApplicationsPage />} />
                    <Route path="wallet" element={<DriverWalletPage />} />
                    <Route path="profile" element={<DriverAccountPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AppStateProvider>
        </AuthProvider>
      </ToastProvider>
    </I18nProvider>
  )
}
