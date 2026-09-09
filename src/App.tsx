import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n'
import { AuthProvider } from './store/auth'
import { AppStateProvider } from './store/AppState'
import { ToastProvider } from './components/ui/Toast'
import { AdminLayout } from './components/layout/AdminLayout'
import { CompanyLayout } from './components/layout/CompanyLayout'
import { DeliveryLayout } from './components/layout/DeliveryLayout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { Guard } from './components/layout/Guard'
import {
  AdminIntegrationsPage, AdminWorkforceTrackingPage, ApplicationsPage,
  AuditLogPage, CompaniesPage, CompanyApplicantsPage, CompanyBillingPage,
  CompanyDetailsPage, CompanyDriversPage, CompanyIntegrationsPage,
  CompanyOrdersPage, CompanyOverviewPage, CompanyProfilePage,
  CompanyRequestsPage, CompanyTrackingPage, DashboardPage,
  DriverAccountPage, DriverApplicationsPage, DriverHomePage,
  DriverJobDetailsPage, DriverJobsPage, DriverProfilePage,
  DriverSavedJobsPage, DriverWalletPage, DriverWorkPage, DriversPage,
  EmployeeDetailPage, EmployeesPage, InvoicesPage, NewRequestPage,
  NotFoundPage, NotificationsPage, OpportunitiesPage,
  OpportunityDetailsPage, PaymentsPage, PayoutsPage, PerformancePage,
  PipelinePage, RatingsPage, RegisterCompanyPage, RegisterDriverPage,
  ReportsPage, RequestsPage, RevenuePage, RolesPage, SalariesPage,
  SettingsPage,
} from './routes/lazyRoutes'

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AuthProvider>
          <AppStateProvider>
            <BrowserRouter>
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

                    <Route path="salaries" element={<Guard permission="finance.view"><SalariesPage /></Guard>} />
                    <Route path="payments" element={<Guard permission="finance.view"><PaymentsPage /></Guard>} />
                    <Route path="payouts" element={<Guard permission="finance.view"><PayoutsPage /></Guard>} />
                    <Route path="invoices" element={<Guard permission="finance.view"><InvoicesPage /></Guard>} />
                    <Route path="revenue" element={<Guard permission="finance.view"><RevenuePage /></Guard>} />

                    <Route path="performance" element={<PerformancePage />} />
                    <Route path="ratings" element={<RatingsPage />} />
                    <Route path="reports" element={<ReportsPage />} />

                    <Route path="workforce-tracking" element={<Guard permission="workforce_tracking.view"><AdminWorkforceTrackingPage /></Guard>} />
                    <Route path="integrations" element={<Guard permission="integrations.view"><AdminIntegrationsPage /></Guard>} />

                    <Route path="employees" element={<Guard permission="employees.view"><EmployeesPage /></Guard>} />
                    <Route path="employees/:id" element={<Guard permission="employees.view"><EmployeeDetailPage /></Guard>} />
                    <Route path="roles" element={<Guard permission="employees.view"><RolesPage /></Guard>} />
                    <Route path="audit-logs" element={<Guard permission="audit.view"><AuditLogPage /></Guard>} />

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
                    <Route path="integrations" element={<CompanyIntegrationsPage />} />
                    <Route path="orders" element={<CompanyOrdersPage />} />
                    <Route path="workforce-tracking" element={<CompanyTrackingPage />} />
                    <Route path="settings" element={<CompanyProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Drivers */}
                  <Route path="/delivery" element={<DeliveryLayout />}>
                    <Route index element={<DriverHomePage />} />
                    <Route path="jobs" element={<DriverJobsPage />} />
                    <Route path="jobs/:id" element={<DriverJobDetailsPage />} />
                    <Route path="saved" element={<DriverSavedJobsPage />} />
                    <Route path="applications" element={<DriverApplicationsPage />} />
                    <Route path="work" element={<DriverWorkPage />} />
                    <Route path="wallet" element={<DriverWalletPage />} />
                    <Route path="profile" element={<DriverAccountPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
          </AppStateProvider>
        </AuthProvider>
      </ToastProvider>
    </I18nProvider>
  )
}
