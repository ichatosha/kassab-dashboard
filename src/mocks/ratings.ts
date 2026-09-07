import type { Rating } from '../types/domain'
import { mockDrivers } from './drivers'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

const comments: Array<{ en: string; ar: string }> = [
  { en: 'Always on time and handles customers professionally.', ar: 'دائمًا في الموعد ويتعامل مع العملاء باحترافية.' },
  { en: 'Excellent care with fragile pharmacy orders.', ar: 'عناية ممتازة بطلبات الصيدلية القابلة للكسر.' },
  { en: 'Reliable during peak hours, never missed a shift.', ar: 'يعتمد عليه في ساعات الذروة ولم يتغيب عن وردية.' },
  { en: 'Good performance, occasionally slow on long routes.', ar: 'أداء جيد، بطيء أحيانًا في الطرق الطويلة.' },
  { en: 'Very organised and communicates clearly with the branch.', ar: 'منظم جدًا ويتواصل بوضوح مع الفرع.' },
  { en: 'Strong month, took extra shifts without being asked.', ar: 'شهر قوي، أخذ ورديات إضافية دون طلب.' },
]

// One employer review per hired driver, scored on the three criteria
// companies rate delivery staff on.
export const mockRatings: Rating[] = mockDrivers
  .filter((d) => d.status === 'hired' && d.employment)
  .map((d, i) => {
    const base = Math.max(3, Math.min(5, Math.round(d.performance.rating)))
    return {
      id: `rat-${d.id}`,
      driverId: d.id,
      companyId: d.employment!.companyId,
      punctuality: base,
      behavior: Math.min(5, base + (i % 2)),
      deliverySpeed: Math.max(3, base - (i % 2)),
      comment: comments[i % comments.length].en,
      commentAr: comments[i % comments.length].ar,
      at: daysAgo(2 + i * 3),
    }
  })
