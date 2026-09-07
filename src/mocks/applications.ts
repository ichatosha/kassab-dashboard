import type { Application, ApplicationStatus } from '../types/domain'
import { mockDrivers } from './drivers'
import { mockWorkforceRequests } from './companies'

const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString()

// Requests that are still accepting candidates
const openRequests = mockWorkforceRequests.filter((r) =>
  ['open', 'reviewing', 'partially_filled'].includes(r.status),
)

// Pipeline shape for the demo: mostly fresh candidates, a healthy middle,
// a few decisions already taken.
const pendingCycle: ApplicationStatus[] = [
  'new', 'under_review', 'contacted', 'new', 'interview', 'accepted',
  'new', 'under_review', 'rejected', 'contacted', 'new', 'interview',
  'withdrawn', 'under_review', 'new', 'accepted', 'contacted', 'new',
  'under_review', 'new', 'interview', 'new', 'rejected', 'new',
]

const applications: Application[] = []
let seq = 0

// 1. Every hired driver has the application that got them hired.
mockDrivers
  .filter((d) => d.status === 'hired' && d.employment)
  .forEach((d) => {
    const startedHoursAgo = (Date.now() - new Date(d.employment!.startDate).getTime()) / 3600000
    applications.push({
      id: `app-${String(++seq).padStart(3, '0')}`,
      number: `KSS-AP-${3100 + seq}`,
      driverId: d.id,
      requestId: d.employment!.requestId,
      companyId: d.employment!.companyId,
      status: 'hired',
      appliedAt: hoursAgo(startedHoursAgo + 14 * 24),
      updatedAt: hoursAgo(startedHoursAgo),
      availability: d.availability,
      preferredArea: d.preferredArea,
      experienceYears: d.performance.experienceYears,
    })
  })

// 2. Candidates currently in the pipeline. Each looking-for-work driver
//    applies to 1-3 open opportunities, preferring their own city.
let cycleIndex = 0
mockDrivers
  .filter((d) => d.status === 'available' || d.status === 'under_review')
  .forEach((d, i) => {
    const local = openRequests.filter((r) => r.city === d.city)
    const pool = local.length > 0 ? local : openRequests
    const count = Math.min(pool.length, 1 + (i % 3))
    for (let j = 0; j < count; j++) {
      const request = pool[(i + j) % pool.length]
      const status = pendingCycle[cycleIndex % pendingCycle.length]
      cycleIndex += 1
      const appliedHours = 6 + i * 9 + j * 21
      applications.push({
        id: `app-${String(++seq).padStart(3, '0')}`,
        number: `KSS-AP-${3100 + seq}`,
        driverId: d.id,
        requestId: request.id,
        companyId: request.companyId,
        status,
        appliedAt: hoursAgo(appliedHours),
        updatedAt: hoursAgo(status === 'new' ? appliedHours : Math.max(1, appliedHours - 12)),
        availability: d.availability,
        preferredArea: d.preferredArea,
        experienceYears: d.performance.experienceYears,
        note: j === 0 && i % 4 === 0 ? 'Available to start immediately, owns a recent motorcycle.' : undefined,
        noteAr: j === 0 && i % 4 === 0 ? 'جاهز للبدء فورًا ويمتلك موتوسيكل حديث.' : undefined,
      })
    }
  })

export const mockApplications: Application[] = applications.sort(
  (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
)
