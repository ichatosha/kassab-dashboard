import { useMemo } from 'react'
import { useAppState } from '../store/AppState'
import { useAuth } from '../store/auth'

// Everything an employer account is allowed to see, resolved once. Each
// list is filtered to the signed-in company, so a company screen cannot
// accidentally render another employer's data.
export function useCompanyScope() {
  const { user } = useAuth()
  const {
    companies, requests, applications, drivers, invoices, payments, salaries,
  } = useAppState()
  const companyId = user?.companyId

  return useMemo(() => {
    const company = companies.find((c) => c.id === companyId) ?? null
    const myRequests = requests.filter((r) => r.companyId === companyId)
    const requestIds = new Set(myRequests.map((r) => r.id))
    const myApplications = applications.filter((a) => requestIds.has(a.requestId))
    const myDrivers = drivers.filter(
      (d) => d.status === 'hired' && d.employment?.companyId === companyId,
    )
    const salaryTotal = myDrivers.reduce((sum, d) => sum + (d.employment?.salary ?? 0), 0)
    const feeRate = company?.kassabFeeRate ?? 0.125
    const kassabFee = Math.round(salaryTotal * feeRate)

    return {
      company,
      requests: myRequests,
      applications: myApplications,
      drivers: myDrivers,
      invoices: invoices.filter((i) => i.companyId === companyId),
      payments: payments.filter((p) => p.companyId === companyId),
      salaries: salaries.filter((s) => s.companyId === companyId),
      openPositions: myRequests.reduce(
        (sum, r) => sum + Math.max(0, r.driversRequired - r.driversHired), 0,
      ),
      salaryTotal,
      kassabFee,
      monthlyTotal: salaryTotal + kassabFee,
      feeRate,
    }
  }, [companyId, companies, requests, applications, drivers, invoices, payments, salaries])
}

// The same idea for a driver account.
export function useDriverScope() {
  const { user } = useAuth()
  const { drivers, applications, requests, companies, payouts, transactions } = useAppState()
  const driverId = user?.driverId

  return useMemo(() => {
    const driver = drivers.find((d) => d.id === driverId) ?? null
    const employer = driver?.employment
      ? companies.find((c) => c.id === driver.employment!.companyId) ?? null
      : null
    const myApplications = applications
      .filter((a) => a.driverId === driverId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())

    return {
      driver,
      employer,
      applications: myApplications,
      appliedRequestIds: new Set(myApplications.map((a) => a.requestId)),
      requests,
      payouts: payouts.filter((p) => p.driverId === driverId),
      transactions: transactions.filter((tx) => tx.driverId === driverId),
    }
  }, [driverId, drivers, applications, requests, companies, payouts, transactions])
}
