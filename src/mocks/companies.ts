import type { Company, WorkforceRequest, WorkforceRequestStatus } from '../types/domain'
import { KASSAB_FEE_RATE, companySeeds, driverSeeds, requestSeeds } from './seeds'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000).toISOString()

const companyId = (key: string) => `cmp-${key}`
const requestId = (key: string) => `wfr-${key}`

// Positions actually filled, counted from the driver roster — never seeded
// separately, so a company's "hired" number always matches its driver list.
const hiredCountByRequest = new Map<string, number>()
driverSeeds.forEach((d) => {
  if (d.status === 'hired' && d.hiredAt) {
    hiredCountByRequest.set(d.hiredAt, (hiredCountByRequest.get(d.hiredAt) ?? 0) + 1)
  }
})

function deriveStatus(required: number, hired: number, seedDraft?: boolean, override?: WorkforceRequestStatus): WorkforceRequestStatus {
  if (seedDraft) return 'draft'
  if (override) return override
  if (hired >= required) return 'filled'
  if (hired > 0) return 'partially_filled'
  return 'open'
}

export const mockWorkforceRequests: WorkforceRequest[] = requestSeeds.map((s, i) => {
  const hired = hiredCountByRequest.get(s.key) ?? 0
  return {
    id: requestId(s.key),
    number: `KSS-WF-${1021 + i}`,
    companyId: companyId(s.companyKey),
    position: 'Motorcycle Delivery Driver',
    positionAr: 'مندوب توصيل موتوسيكل',
    driversRequired: s.required,
    driversHired: hired,
    salary: s.salary,
    bonuses: s.bonuses,
    city: companySeeds.find((c) => c.key === s.companyKey)!.city,
    area: s.area,
    areaAr: s.areaAr,
    workingHours: s.hours,
    workingHoursAr: s.hoursAr,
    workingDays: s.days,
    workingDaysAr: s.daysAr,
    employmentType: s.employmentType,
    experienceYears: s.experienceYears,
    requirementKeys: s.requirements,
    benefitKeys: s.benefits,
    deadline: daysAhead(s.deadlineInDays),
    status: deriveStatus(s.required, hired, s.draft, s.statusOverride),
    createdAt: daysAgo(s.createdDaysAgo),
  }
})

export const mockCompanies: Company[] = companySeeds.map((s, i) => {
  const requests = mockWorkforceRequests.filter((r) => r.companyId === companyId(s.key))
  const driversRequired = requests.reduce((sum, r) => sum + r.driversRequired, 0)
  const driversHired = requests.reduce((sum, r) => sum + r.driversHired, 0)
  // Monthly cost = salaries actually being paid for hired drivers
  const monthlyWorkforceCost = requests.reduce((sum, r) => sum + r.driversHired * r.salary, 0)
  return {
    id: companyId(s.key),
    code: `KSB-C${2001 + i}`,
    name: s.name,
    nameAr: s.nameAr,
    type: s.type,
    city: s.city,
    address: s.address,
    contactName: s.contact,
    contactNameAr: s.contactAr,
    phone: `+20 11${(12345678 + i * 2468).toString().slice(0, 8)}`,
    email: `hiring@${s.name.toLowerCase().replace(/[^a-z]+/g, '')}.example`,
    status: s.status ?? 'active',
    verified: s.verified ?? true,
    registeredAt: daysAgo(s.registeredDaysAgo),
    driversRequired,
    driversHired,
    monthlyWorkforceCost,
    kassabFeeRate: KASSAB_FEE_RATE,
  }
})

export const requestIdFor = requestId
export const companyIdFor = companyId
