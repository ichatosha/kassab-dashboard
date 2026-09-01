import type { AppNotification } from '../types/domain'

const minsAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString()

export const mockNotifications: AppNotification[] = [
  { id: 'ntf-01', kind: 'new_order', titleKey: 'notif.kind.new_order', body: 'Koshary El Tahrir created order KSB-48210 — awaiting assignment', bodyAr: 'أنشأ كشري التحرير الطلب KSB-48210 — بانتظار التعيين', at: minsAgo(6), read: false },
  { id: 'ntf-02', kind: 'driver_approval', titleKey: 'notif.kind.driver_approval', body: 'Ali Ramadan submitted documents for review', bodyAr: 'قدّم علي رمضان مستنداته للمراجعة', at: minsAgo(18), read: false },
  { id: 'ntf-03', kind: 'order_delivered', titleKey: 'notif.kind.order_delivered', body: 'Order KSB-48222 delivered by Mahmoud El-Sayed in 34 min', bodyAr: 'سلّم محمود السيد الطلب KSB-48222 خلال ٣٤ دقيقة', at: minsAgo(31), read: false },
  { id: 'ntf-04', kind: 'order_cancelled', titleKey: 'notif.kind.order_cancelled', body: 'TechZone Egypt cancelled order KSB-48230 — item out of stock', bodyAr: 'ألغت تك زون مصر الطلب KSB-48230 — الصنف غير متوفر', at: minsAgo(52), read: false },
  { id: 'ntf-05', kind: 'order_picked_up', titleKey: 'notif.kind.order_picked_up', body: 'Ahmed Abdel-Rahman picked up order KSB-48217', bodyAr: 'استلم أحمد عبدالرحمن الأوردر KSB-48217', at: minsAgo(64), read: true },
  { id: 'ntf-06', kind: 'company_approval', titleKey: 'notif.kind.company_approval', body: 'Dawaa Express registration is pending review', bodyAr: 'تسجيل دواء إكسبريس بانتظار المراجعة', at: minsAgo(95), read: false },
  { id: 'ntf-07', kind: 'bonus', titleKey: 'notif.kind.bonus', body: 'Mohamed Fathy reached 1,500 completed orders — 250 EGP bonus granted', bodyAr: 'وصل محمد فتحي إلى ١٥٠٠ طلب مكتمل — تم منح بونص ٢٥٠ ج.م', at: minsAgo(140), read: true },
  { id: 'ntf-08', kind: 'earnings', titleKey: 'notif.kind.earnings', body: 'Daily earnings reports were generated for 18 drivers', bodyAr: 'تم إنشاء تقارير الأرباح اليومية لـ ١٨ مندوبًا', at: minsAgo(220), read: true },
  { id: 'ntf-09', kind: 'order_accepted', titleKey: 'notif.kind.order_accepted', body: 'Omar Khaled accepted order KSB-48213', bodyAr: 'قبل عمر خالد الطلب KSB-48213', at: minsAgo(300), read: true },
  { id: 'ntf-10', kind: 'admin_message', titleKey: 'notif.kind.admin_message', body: 'Zone pricing for 6th of October updated by Finance Admin', bodyAr: 'حدّث مدير المالية تسعير منطقة ٦ أكتوبر', at: minsAgo(420), read: true },
  { id: 'ntf-11', kind: 'order_delivered', titleKey: 'notif.kind.order_delivered', body: 'Order KSB-48208 delivered by Karim Mostafa in 28 min', bodyAr: 'سلّم كريم مصطفى الطلب KSB-48208 خلال ٢٨ دقيقة', at: minsAgo(510), read: true },
  { id: 'ntf-12', kind: 'admin_message', titleKey: 'notif.kind.admin_message', body: 'Weekly settlement completed for 9 companies', bodyAr: 'اكتملت التسوية الأسبوعية لـ ٩ شركات', at: minsAgo(1300), read: true },
]
