import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n'
import { AuthProvider } from './store/auth'
import { AppStateProvider } from './store/AppState'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { TrackingPage } from './pages/TrackingPage'
import { DriversPage } from './pages/DriversPage'
import { DriverProfilePage } from './pages/DriverProfilePage'
import { ApprovalsPage } from './pages/ApprovalsPage'
import { VehiclesPage } from './pages/VehiclesPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { CompanyDetailsPage } from './pages/CompanyDetailsPage'
import { BranchesPage } from './pages/BranchesPage'
import { PricingPage } from './pages/PricingPage'
import { CommissionsPage } from './pages/CommissionsPage'
import { FinancePage } from './pages/FinancePage'
import { WalletsPage } from './pages/WalletsPage'
import { InvoicesPage } from './pages/InvoicesPage'
import { ReportsPage } from './pages/ReportsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AuthProvider>
          <AppStateProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
            </BrowserRouter>
          </AppStateProvider>
        </AuthProvider>
      </ToastProvider>
    </I18nProvider>
  )
}
