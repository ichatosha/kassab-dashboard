import type { OpportunityEngagement } from '../types/domain'
import { mockWorkforceRequests } from './companies'
import { mockApplications } from './applications'

// ── Opportunity audience ──────────────────────────────────────────────
// The interest funnel for every published opportunity. Derived, like the
// rest of the demo data, so the figures always read in a believable order:
//
//   views  >=  unique viewers  >=  applicants
//   likes / saves are a slice of the people who actually opened the post
//
// A draft has never been published, so nobody has seen it.

const applicantsByRequest = new Map<string, number>()
mockApplications.forEach((a) => {
  applicantsByRequest.set(a.requestId, (applicantsByRequest.get(a.requestId) ?? 0) + 1)
})

export const mockEngagement: OpportunityEngagement[] = mockWorkforceRequests.map((r, i) => {
  if (r.status === 'draft') {
    return { requestId: r.id, views: 0, uniqueViewers: 0, likes: 0, saves: 0 }
  }

  const applicants = applicantsByRequest.get(r.id) ?? 0
  const daysLive = Math.max(1, Math.round((Date.now() - new Date(r.createdAt).getTime()) / 86400000))
  // Bigger postings sit higher in the marketplace and draw more traffic
  const dailyReach = 6 + r.driversRequired * 2 + (i % 5) * 3
  // Never fewer viewers than the people who went on to apply
  const uniqueViewers = Math.max(applicants * 5 + 9, Math.round(daysLive * dailyReach * 0.9))

  return {
    requestId: r.id,
    views: Math.round(uniqueViewers * (1.5 + (i % 4) * 0.12)),
    uniqueViewers,
    likes: Math.round(uniqueViewers * (0.16 + (i % 3) * 0.03)),
    saves: Math.round(uniqueViewers * (0.09 + (i % 4) * 0.02)),
  }
})
