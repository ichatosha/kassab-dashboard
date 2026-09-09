import { lazy } from 'react'

// ── Route loading ─────────────────────────────────────────────────────
// Every screen is code-split. Keeping the loaders in one map lets the
// sidebar warm a chunk the moment a link is hovered, so the page is
// usually already in memory by the time it is clicked.

const load = {
  dashboard: () => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
  opportunities: () => import('../pages/OpportunitiesPage').then((m) => ({ default: m.OpportunitiesPage })),
  opportunityDetails: () => import('../pages/OpportunityDetailsPage').then((m) => ({ default: m.OpportunityDetailsPage })),
  requests: () => import('../pages/RequestsPage').then((m) => ({ default: m.RequestsPage })),
  applications: () => import('../pages/ApplicationsPage').then((m) => ({ default: m.ApplicationsPage })),
  pipeline: () => import('../pages/PipelinePage').then((m) => ({ default: m.PipelinePage })),
  drivers: () => import('../pages/DriversPage').then((m) => ({ default: m.DriversPage })),
  driverProfile: () => import('../pages/DriverProfilePage').then((m) => ({ default: m.DriverProfilePage })),
  companies: () => import('../pages/CompaniesPage').then((m) => ({ default: m.CompaniesPage })),
  companyDetails: () => import('../pages/CompanyDetailsPage').then((m) => ({ default: m.CompanyDetailsPage })),
  salaries: () => import('../pages/SalariesPage').then((m) => ({ default: m.SalariesPage })),
  payments: () => import('../pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage })),
  payouts: () => import('../pages/PayoutsPage').then((m) => ({ default: m.PayoutsPage })),
  invoices: () => import('../pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage })),
  revenue: () => import('../pages/RevenuePage').then((m) => ({ default: m.RevenuePage })),
  performance: () => import('../pages/PerformancePage').then((m) => ({ default: m.PerformancePage })),
  ratings: () => import('../pages/RatingsPage').then((m) => ({ default: m.RatingsPage })),
  reports: () => import('../pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
  notifications: () => import('../pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
  settings: () => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
  notFound: () => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),

  employees: () => import('../pages/admin/EmployeesPage').then((m) => ({ default: m.EmployeesPage })),
  employeeDetail: () => import('../pages/admin/EmployeeDetailPage').then((m) => ({ default: m.EmployeeDetailPage })),
  roles: () => import('../pages/admin/RolesPage').then((m) => ({ default: m.RolesPage })),
  auditLogs: () => import('../pages/admin/AuditLogPage').then((m) => ({ default: m.AuditLogPage })),
  adminIntegrations: () => import('../pages/admin/IntegrationsPage').then((m) => ({ default: m.AdminIntegrationsPage })),
  adminIntegrationSetup: () => import('../pages/admin/IntegrationSetupPage').then((m) => ({ default: m.IntegrationSetupPage })),
  adminTracking: () => import('../pages/admin/WorkforceTrackingPage').then((m) => ({ default: m.AdminWorkforceTrackingPage })),

  companyOverview: () => import('../pages/company/CompanyOverviewPage').then((m) => ({ default: m.CompanyOverviewPage })),
  companyRequests: () => import('../pages/company/CompanyRequestsPage').then((m) => ({ default: m.CompanyRequestsPage })),
  newRequest: () => import('../pages/company/NewRequestPage').then((m) => ({ default: m.NewRequestPage })),
  companyApplicants: () => import('../pages/company/CompanyApplicantsPage').then((m) => ({ default: m.CompanyApplicantsPage })),
  companyDrivers: () => import('../pages/company/CompanyDriversPage').then((m) => ({ default: m.CompanyDriversPage })),
  companyBilling: () => import('../pages/company/CompanyBillingPage').then((m) => ({ default: m.CompanyBillingPage })),
  companyProfile: () => import('../pages/company/CompanyProfilePage').then((m) => ({ default: m.CompanyProfilePage })),
  companyIntegrations: () => import('../pages/company/CompanyIntegrationsPage').then((m) => ({ default: m.CompanyIntegrationsPage })),
  companyOrders: () => import('../pages/company/CompanyOrdersPage').then((m) => ({ default: m.CompanyOrdersPage })),
  companyTracking: () => import('../pages/company/CompanyTrackingPage').then((m) => ({ default: m.CompanyTrackingPage })),

  driverHome: () => import('../pages/delivery/DriverHomePage').then((m) => ({ default: m.DriverHomePage })),
  driverJobs: () => import('../pages/delivery/DriverJobsPage').then((m) => ({ default: m.DriverJobsPage })),
  driverJobDetails: () => import('../pages/delivery/DriverJobDetailsPage').then((m) => ({ default: m.DriverJobDetailsPage })),
  driverSaved: () => import('../pages/delivery/DriverSavedJobsPage').then((m) => ({ default: m.DriverSavedJobsPage })),
  driverApplications: () => import('../pages/delivery/DriverApplicationsPage').then((m) => ({ default: m.DriverApplicationsPage })),
  driverWallet: () => import('../pages/delivery/DriverWalletPage').then((m) => ({ default: m.DriverWalletPage })),
  driverAccount: () => import('../pages/delivery/DriverAccountPage').then((m) => ({ default: m.DriverAccountPage })),
  driverWork: () => import('../pages/delivery/DriverWorkPage').then((m) => ({ default: m.DriverWorkPage })),

  registerCompany: () => import('../pages/register/RegisterCompanyPage').then((m) => ({ default: m.RegisterCompanyPage })),
  registerDriver: () => import('../pages/register/RegisterDriverPage').then((m) => ({ default: m.RegisterDriverPage })),
}

/** Which chunk backs which route, for hover prefetching */
const LOADER_BY_PATH: Record<string, () => Promise<unknown>> = {
  '/admin': load.dashboard,
  '/admin/opportunities': load.opportunities,
  '/admin/requests': load.requests,
  '/admin/applications': load.applications,
  '/admin/pipeline': load.pipeline,
  '/admin/workforce-tracking': load.adminTracking,
  '/admin/drivers': load.drivers,
  '/admin/drivers/available': load.drivers,
  '/admin/drivers/hired': load.drivers,
  '/admin/companies': load.companies,
  '/admin/companies/hiring': load.companies,
  '/admin/integrations': load.adminIntegrations,
  '/admin/salaries': load.salaries,
  '/admin/payments': load.payments,
  '/admin/payouts': load.payouts,
  '/admin/invoices': load.invoices,
  '/admin/revenue': load.revenue,
  '/admin/performance': load.performance,
  '/admin/ratings': load.ratings,
  '/admin/reports': load.reports,
  '/admin/employees': load.employees,
  '/admin/roles': load.roles,
  '/admin/audit-logs': load.auditLogs,
  '/admin/notifications': load.notifications,
  '/admin/settings': load.settings,

  '/company': load.companyOverview,
  '/company/requests': load.companyRequests,
  '/company/requests/new': load.newRequest,
  '/company/applicants': load.companyApplicants,
  '/company/drivers': load.companyDrivers,
  '/company/orders': load.companyOrders,
  '/company/workforce-tracking': load.companyTracking,
  '/company/integrations': load.companyIntegrations,
  '/company/billing': load.companyBilling,
  '/company/settings': load.companyProfile,

  '/delivery': load.driverHome,
  '/delivery/work': load.driverWork,
  '/delivery/jobs': load.driverJobs,
  '/delivery/saved': load.driverSaved,
  '/delivery/applications': load.driverApplications,
  '/delivery/wallet': load.driverWallet,
  '/delivery/profile': load.driverAccount,

  '/register/company': load.registerCompany,
  '/register/driver': load.registerDriver,
}

const warmed = new Set<string>()

/** Start fetching a route's chunk before the click lands. Safe to spam. */
export function prefetchRoute(path: string) {
  if (warmed.has(path)) return
  const loader = LOADER_BY_PATH[path]
  if (!loader) return
  warmed.add(path)
  // A failed prefetch must never surface: the click will retry it
  loader().catch(() => warmed.delete(path))
}

export const DashboardPage = lazy(load.dashboard)
export const OpportunitiesPage = lazy(load.opportunities)
export const OpportunityDetailsPage = lazy(load.opportunityDetails)
export const RequestsPage = lazy(load.requests)
export const ApplicationsPage = lazy(load.applications)
export const PipelinePage = lazy(load.pipeline)
export const DriversPage = lazy(load.drivers)
export const DriverProfilePage = lazy(load.driverProfile)
export const CompaniesPage = lazy(load.companies)
export const CompanyDetailsPage = lazy(load.companyDetails)
export const SalariesPage = lazy(load.salaries)
export const PaymentsPage = lazy(load.payments)
export const PayoutsPage = lazy(load.payouts)
export const InvoicesPage = lazy(load.invoices)
export const RevenuePage = lazy(load.revenue)
export const PerformancePage = lazy(load.performance)
export const RatingsPage = lazy(load.ratings)
export const ReportsPage = lazy(load.reports)
export const NotificationsPage = lazy(load.notifications)
export const SettingsPage = lazy(load.settings)
export const NotFoundPage = lazy(load.notFound)

export const EmployeesPage = lazy(load.employees)
export const EmployeeDetailPage = lazy(load.employeeDetail)
export const RolesPage = lazy(load.roles)
export const AuditLogPage = lazy(load.auditLogs)
export const AdminIntegrationsPage = lazy(load.adminIntegrations)
export const AdminIntegrationSetupPage = lazy(load.adminIntegrationSetup)
export const AdminWorkforceTrackingPage = lazy(load.adminTracking)

export const CompanyOverviewPage = lazy(load.companyOverview)
export const CompanyRequestsPage = lazy(load.companyRequests)
export const NewRequestPage = lazy(load.newRequest)
export const CompanyApplicantsPage = lazy(load.companyApplicants)
export const CompanyDriversPage = lazy(load.companyDrivers)
export const CompanyBillingPage = lazy(load.companyBilling)
export const CompanyProfilePage = lazy(load.companyProfile)
export const CompanyIntegrationsPage = lazy(load.companyIntegrations)
export const CompanyOrdersPage = lazy(load.companyOrders)
export const CompanyTrackingPage = lazy(load.companyTracking)

export const DriverHomePage = lazy(load.driverHome)
export const DriverJobsPage = lazy(load.driverJobs)
export const DriverJobDetailsPage = lazy(load.driverJobDetails)
export const DriverSavedJobsPage = lazy(load.driverSaved)
export const DriverApplicationsPage = lazy(load.driverApplications)
export const DriverWalletPage = lazy(load.driverWallet)
export const DriverAccountPage = lazy(load.driverAccount)
export const DriverWorkPage = lazy(load.driverWork)

export const RegisterCompanyPage = lazy(load.registerCompany)
export const RegisterDriverPage = lazy(load.registerDriver)
