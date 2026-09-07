import type { Driver } from '../types/domain'
import { driverSeeds } from './seeds'
import { mockWorkforceRequests, requestIdFor } from './companies'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

export const mockDrivers: Driver[] = driverSeeds.map((s, i) => {
  const request = s.hiredAt
    ? mockWorkforceRequests.find((r) => r.id === requestIdFor(s.hiredAt!))
    : undefined
  const salary = request?.salary ?? 0
  // Wallet figures follow from the employment: two months paid, current
  // month pending. Available drivers carry no employment balance.
  const paidEarnings = request ? salary * 2 : 0
  const pendingEarnings = request ? salary : 0

  return {
    id: `drv-${String(i + 1).padStart(3, '0')}`,
    code: `KSB-D${1001 + i}`,
    name: s.name,
    nameAr: s.nameAr,
    age: s.age,
    address: s.address,
    city: s.city,
    phone: `+20 10${(23456789 + i * 1371).toString().slice(0, 8)}`,
    motorcycle: {
      brand: s.brand,
      model: s.model,
      plate: `${1000 + i * 37} ${['ق ص م', 'س د ر', 'أ ن ص', 'ج ط ع', 'م هـ ل'][i % 5]}`,
      year: 2017 + (i % 8),
    },
    status: s.status,
    verified: s.status !== 'under_review',
    performance: {
      rating: s.rating,
      ratingCount: s.completed > 0 ? Math.round(s.completed * 0.62) : 0,
      deliverySuccessRate: s.successRate,
      completedDeliveries: s.completed,
      failedDeliveries: s.failed,
      cancelledDeliveries: s.cancelled,
      experienceYears: s.experience,
    },
    wallet: {
      balance: pendingEarnings,
      totalEarnings: paidEarnings + pendingEarnings,
      pendingEarnings,
      paidEarnings,
    },
    employment: request
      ? {
          companyId: request.companyId,
          requestId: request.id,
          salary: request.salary,
          // The most recently registered hires started this month, so the
          // "hired this month" figure reflects real placements.
          startDate: daysAgo(
            s.registeredDaysAgo <= 120 ? 2 + (i % 5) : Math.max(20, s.registeredDaysAgo - 30),
          ),
        }
      : undefined,
    availability: s.availability,
    preferredArea: s.area,
    registeredAt: daysAgo(s.registeredDaysAgo),
  }
})

export const driverById = (id: string) => mockDrivers.find((d) => d.id === id)
