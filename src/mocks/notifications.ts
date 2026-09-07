import type { AppNotification } from '../types/domain'

const minsAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString()

export const mockNotifications: AppNotification[] = [
  { id: 'ntf-01', kind: 'new_application', body: 'Ibrahim Hamdy applied to TechZone Egypt — Motorcycle Delivery Driver', bodyAr: 'تقدّم إبراهيم حمدي إلى تك زون مصر — مندوب توصيل موتوسيكل', at: minsAgo(8), read: false },
  { id: 'ntf-02', kind: 'new_workforce_request', body: 'Nile Retail Group published a request for 4 drivers in Port Said', bodyAr: 'نشرت مجموعة النيل للتجزئة طلبًا لـ ٤ مناديب في بورسعيد', at: minsAgo(24), read: false },
  { id: 'ntf-03', kind: 'new_company', body: 'Damietta Furniture Express registered and is awaiting review', bodyAr: 'سجّلت دمياط إكسبريس للأثاث وبانتظار المراجعة', at: minsAgo(46), read: false },
  { id: 'ntf-04', kind: 'candidate_accepted', body: 'Fady Nagy accepted for Sehha Pharmacies — awaiting start date', bodyAr: 'تم قبول فادي ناجي لدى صيدليات صحة — بانتظار تاريخ البدء', at: minsAgo(72), read: false },
  { id: 'ntf-05', kind: 'payment_overdue', body: 'Misr Logistics Co. payment for this cycle is overdue by 4 days', bodyAr: 'تأخرت دفعة شركة مصر للوجستيات لهذه الدورة ٤ أيام', at: minsAgo(95), read: false },
  { id: 'ntf-06', kind: 'driver_hired', body: 'Mina Sameh started at Shawerma House — request fully filled', bodyAr: 'بدأ مينا سامح العمل في بيت الشاورما — اكتمل الطلب بالكامل', at: minsAgo(140), read: true },
  { id: 'ntf-07', kind: 'new_driver', body: 'Mahmoud Rizk registered from Tanta and is under review', bodyAr: 'سجّل محمود رزق من طنطا وحسابه قيد المراجعة', at: minsAgo(180), read: true },
  { id: 'ntf-08', kind: 'invoice_generated', body: 'Invoices generated for 6 companies for the current cycle', bodyAr: 'تم إصدار فواتير ٦ شركات لدورة هذا الشهر', at: minsAgo(260), read: true },
  { id: 'ntf-09', kind: 'payment_received', body: 'Koshary El Tahrir settled the current cycle in full', bodyAr: 'سدّدت كشري التحرير دورة هذا الشهر بالكامل', at: minsAgo(320), read: true },
  { id: 'ntf-10', kind: 'application_reviewed', body: '7 applications moved to Under Review by the recruitment team', bodyAr: 'حوّل فريق التوظيف ٧ طلبات إلى قيد المراجعة', at: minsAgo(420), read: true },
  { id: 'ntf-11', kind: 'salary_cycle', body: 'Salary cycle opens in 3 days — 18 drivers to settle', bodyAr: 'دورة الرواتب تبدأ خلال ٣ أيام — ١٨ مندوبًا للتسوية', at: minsAgo(700), read: true },
  { id: 'ntf-12', kind: 'admin_message', body: 'Kassab service fee confirmed at 12.5% for the new contracts', bodyAr: 'تم اعتماد رسوم خدمة كساب بنسبة ١٢٫٥٪ للعقود الجديدة', at: minsAgo(1500), read: true },
]
