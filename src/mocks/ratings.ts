import type { Rating } from '../types/domain'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

export const mockRatings: Rating[] = [
  { id: 'rt-01', orderId: 'ord-0015', companyId: 'cmp-001', driverId: 'drv-001', commitment: 5, behavior: 5, speed: 4, comment: 'Fast and polite, called before arriving.', commentAr: 'سريع ومهذب، اتصل قبل الوصول.', at: daysAgo(0.2) },
  { id: 'rt-02', orderId: 'ord-0018', companyId: 'cmp-003', driverId: 'drv-003', commitment: 5, behavior: 4, speed: 5, comment: 'Excellent handling of a fragile package.', commentAr: 'تعامل ممتاز مع طرد قابل للكسر.', at: daysAgo(0.6) },
  { id: 'rt-03', orderId: 'ord-0021', companyId: 'cmp-002', driverId: 'drv-002', commitment: 4, behavior: 5, speed: 4, comment: 'Slight delay at pickup but kept us informed.', commentAr: 'تأخير بسيط عند الاستلام لكنه أبقانا على اطلاع.', at: daysAgo(1.1) },
  { id: 'rt-04', orderId: 'ord-0026', companyId: 'cmp-005', driverId: 'drv-006', commitment: 5, behavior: 5, speed: 5, comment: 'Perfect delivery, customer very satisfied.', commentAr: 'توصيل مثالي والعميل راضٍ جدًا.', at: daysAgo(1.8) },
  { id: 'rt-05', orderId: 'ord-0031', companyId: 'cmp-007', driverId: 'drv-004', commitment: 3, behavior: 4, speed: 3, comment: 'Took a longer route than needed.', commentAr: 'سلك طريقًا أطول من اللازم.', at: daysAgo(2.4) },
  { id: 'rt-06', orderId: 'ord-0034', companyId: 'cmp-008', driverId: 'drv-008', commitment: 5, behavior: 5, speed: 4, comment: 'Reliable as always.', commentAr: 'موثوق كالعادة.', at: daysAgo(3.2) },
]
