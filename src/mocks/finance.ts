import type {
  CompanyPayment, DriverPayout, Invoice, PaymentStatus, RevenuePoint,
  SalaryRecord, WalletTransaction,
} from '../types/domain'
import { KASSAB_FEE_RATE } from './seeds'
import { mockCompanies } from './companies'
import { mockDrivers } from './drivers'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000).toISOString()

// "YYYY-MM" period keys, offset months back from the current month
export function periodKey(monthsBack: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsBack)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const CURRENT_PERIOD = periodKey(0)
export const PREVIOUS_PERIOD = periodKey(1)

const hired = mockDrivers.filter((d) => d.status === 'hired' && d.employment)

// Per-company workforce obligation for a period, derived from the drivers
// actually employed there.
function obligation(companyId: string) {
  const staff = hired.filter((d) => d.employment!.companyId === companyId)
  const salaryTotal = staff.reduce((s, d) => s + d.employment!.salary, 0)
  const kassabFee = Math.round(salaryTotal * KASSAB_FEE_RATE)
  return { staff, salaryTotal, kassabFee, totalDue: salaryTotal + kassabFee }
}

// Current-period settlement status varies per company so the finance
// screens show every state without inventing numbers.
const currentStatus: Record<number, PaymentStatus> = {
  0: 'paid', 1: 'pending', 2: 'partially_paid', 3: 'pending', 4: 'overdue', 5: 'pending',
}

const employers = mockCompanies.filter((c) => c.driversHired > 0)

export const mockSalaryRecords: SalaryRecord[] = employers.map((c, i) => {
  const o = obligation(c.id)
  const status = currentStatus[i] ?? 'pending'
  const paid = status === 'paid' ? o.totalDue : status === 'partially_paid' ? Math.round(o.totalDue * 0.6) : 0
  return {
    id: `sal-${c.id}-${CURRENT_PERIOD}`,
    companyId: c.id,
    period: CURRENT_PERIOD,
    driversCount: o.staff.length,
    salaryTotal: o.salaryTotal,
    kassabFee: o.kassabFee,
    totalDue: o.totalDue,
    paid,
    status,
    dueDate: status === 'overdue' ? daysAgo(4) : daysAhead(9 - i),
  }
})

export const mockPayments: CompanyPayment[] = [
  // Current period mirrors the salary records above
  ...mockSalaryRecords.map((s) => ({
    id: `pay-${s.companyId}-${s.period}`,
    companyId: s.companyId,
    period: s.period,
    driverSalaries: s.salaryTotal,
    kassabFees: s.kassabFee,
    total: s.totalDue,
    status: s.status,
    dueDate: s.dueDate,
    paidAt: s.status === 'paid' ? daysAgo(3) : undefined,
  })),
  // Previous period is fully settled
  ...employers.map((c, i) => {
    const o = obligation(c.id)
    return {
      id: `pay-${c.id}-${PREVIOUS_PERIOD}`,
      companyId: c.id,
      period: PREVIOUS_PERIOD,
      driverSalaries: o.salaryTotal,
      kassabFees: o.kassabFee,
      total: o.totalDue,
      status: 'paid' as PaymentStatus,
      dueDate: daysAgo(26 + i),
      paidAt: daysAgo(28 + i),
    }
  }),
]

export const mockPayouts: DriverPayout[] = hired.flatMap((d, i) => {
  const salary = d.employment!.salary
  const bonus = i % 3 === 0 ? 500 : i % 4 === 0 ? 300 : 0
  const deductions = i % 7 === 0 ? 200 : 0
  const companySettled = mockSalaryRecords.find((s) => s.companyId === d.employment!.companyId)?.status === 'paid'
  return [
    {
      id: `out-${d.id}-${CURRENT_PERIOD}`,
      driverId: d.id,
      companyId: d.employment!.companyId,
      period: CURRENT_PERIOD,
      salary,
      bonus,
      deductions,
      net: salary + bonus - deductions,
      status: companySettled ? ('processing' as const) : ('pending' as const),
    },
    {
      id: `out-${d.id}-${PREVIOUS_PERIOD}`,
      driverId: d.id,
      companyId: d.employment!.companyId,
      period: PREVIOUS_PERIOD,
      salary,
      bonus: i % 5 === 0 ? 400 : 0,
      deductions: 0,
      net: salary + (i % 5 === 0 ? 400 : 0),
      status: 'paid' as const,
      paidAt: daysAgo(27),
    },
  ]
})

export const mockInvoices: Invoice[] = mockPayments.map((p, i) => {
  const o = obligation(p.companyId)
  return {
    id: `inv-${p.id}`,
    number: `KSS-INV-${4200 + i}`,
    companyId: p.companyId,
    period: p.period,
    driversCount: o.staff.length,
    salaries: p.driverSalaries,
    kassabFees: p.kassabFees,
    total: p.total,
    status: p.status === 'paid' ? 'paid' : p.status === 'overdue' ? 'overdue' : 'due',
    issuedAt: p.period === CURRENT_PERIOD ? daysAgo(5) : daysAgo(35),
    dueAt: p.dueDate,
  }
})

// Eight months of platform growth ending at the real current volume
const currentSalaryVolume = hired.reduce((s, d) => s + d.employment!.salary, 0)
const currentHires = hired.length

export const mockRevenueSeries: RevenuePoint[] = Array.from({ length: 8 }, (_, i) => {
  const monthsBack = 7 - i
  const growth = 1 - monthsBack * 0.11
  const salaryVolume = Math.round(currentSalaryVolume * growth)
  const kassabRevenue = Math.round(salaryVolume * KASSAB_FEE_RATE)
  return {
    month: periodKey(monthsBack),
    salaryVolume,
    kassabRevenue,
    companyPayments: salaryVolume + kassabRevenue,
    hires: Math.max(1, Math.round(currentHires * growth)),
  }
})

// Driver wallet ledger: paid salaries, the pending month, bonuses and
// adjustments that reconcile with each driver's wallet totals.
export const mockTransactions: WalletTransaction[] = hired.flatMap((d, i) => {
  const salary = d.employment!.salary
  const rows: WalletTransaction[] = [
    {
      id: `tx-${d.id}-1`,
      driverId: d.id,
      type: 'salary',
      amount: salary,
      reference: `${PREVIOUS_PERIOD} · KSS-PAY`,
      at: daysAgo(27),
    },
    {
      id: `tx-${d.id}-2`,
      driverId: d.id,
      type: 'salary',
      amount: salary,
      reference: `${periodKey(2)} · KSS-PAY`,
      at: daysAgo(57),
    },
  ]
  if (i % 3 === 0) {
    rows.push({ id: `tx-${d.id}-3`, driverId: d.id, type: 'bonus', amount: 500, reference: 'Monthly target bonus', at: daysAgo(26) })
  }
  if (i % 7 === 0) {
    rows.push({ id: `tx-${d.id}-4`, driverId: d.id, type: 'deduction', amount: -200, reference: 'Late delivery adjustment', at: daysAgo(20) })
  }
  if (i % 4 === 0) {
    rows.push({ id: `tx-${d.id}-5`, driverId: d.id, type: 'withdrawal', amount: -salary, reference: `WD-${7100 + i}`, at: daysAgo(24) })
  }
  return rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
})
