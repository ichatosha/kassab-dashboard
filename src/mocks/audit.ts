import type { AuditLogEntry } from '../types/domain'

const minsAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString()

// Sensitive actions, recorded with who did them. Several Kassab staff
// share the platform, so "who approved this company" has to be answerable.
export const mockAuditLog: AuditLogEntry[] = [
  {
    id: 'aud-001', actorId: 'emp-003', actorName: 'Nourhan Adel', actorNameAr: 'نورهان عادل',
    action: 'candidate.hired', entity: 'application', entityId: 'app-014',
    entityLabel: 'Tarek Samir → Koshary El Tahrir', entityLabelAr: 'طارق سمير ← كشري التحرير',
    at: minsAgo(38),
  },
  {
    id: 'aud-002', actorId: 'emp-002', actorName: 'Mostafa Zaki', actorNameAr: 'مصطفى زكي',
    action: 'integration.connected', entity: 'integration', entityId: 'int-misr',
    entityLabel: 'Misr Logistics Co. — Odoo ERP', entityLabelAr: 'شركة مصر للوجستيات — أودو',
    at: minsAgo(96),
  },
  {
    id: 'aud-003', actorId: 'emp-001', actorName: 'Kassab Admin', actorNameAr: 'إدارة كساب',
    action: 'employee.created', entity: 'employee', entityId: 'emp-006',
    entityLabel: 'Ahmed Mohamed — Recruitment admin', entityLabelAr: 'أحمد محمد — مسؤول توظيف',
    at: minsAgo(180),
  },
  {
    id: 'aud-004', actorId: 'emp-004', actorName: 'Tarek Selim', actorNameAr: 'طارق سليم',
    action: 'payment.recorded', entity: 'payment', entityId: 'pay-003',
    entityLabel: 'TechZone Egypt — September settlement', entityLabelAr: 'تك زون مصر — تسوية سبتمبر',
    at: minsAgo(320),
  },
  {
    id: 'aud-005', actorId: 'emp-002', actorName: 'Mostafa Zaki', actorNameAr: 'مصطفى زكي',
    action: 'company.approved', entity: 'company', entityId: 'cmp-nile',
    entityLabel: 'Nile Retail Group', entityLabelAr: 'مجموعة النيل للتجزئة',
    at: minsAgo(540),
  },
  {
    id: 'aud-006', actorId: 'emp-003', actorName: 'Nourhan Adel', actorNameAr: 'نورهان عادل',
    action: 'application.updated', entity: 'application', entityId: 'app-021',
    entityLabel: 'Ali Ramadan → Interview', entityLabelAr: 'علي رمضان ← مقابلة',
    at: minsAgo(610),
  },
  {
    id: 'aud-007', actorId: 'emp-001', actorName: 'Kassab Admin', actorNameAr: 'إدارة كساب',
    action: 'employee.role_changed', entity: 'employee', entityId: 'emp-002',
    entityLabel: 'Mostafa Zaki → General manager', entityLabelAr: 'مصطفى زكي ← مدير عام',
    at: minsAgo(1440),
  },
  {
    id: 'aud-008', actorId: 'emp-001', actorName: 'Kassab Admin', actorNameAr: 'إدارة كساب',
    action: 'employee.disabled', entity: 'employee', entityId: 'emp-007',
    entityLabel: 'Salma Ezzat', entityLabelAr: 'سلمى عزت',
    at: minsAgo(2600),
  },
  {
    id: 'aud-009', actorId: 'emp-005', actorName: 'Mai Hassan', actorNameAr: 'مي حسن',
    action: 'driver.approved', entity: 'driver', entityId: 'drv-019',
    entityLabel: 'Youssef Hassan', entityLabelAr: 'يوسف حسن',
    at: minsAgo(3100),
  },
  {
    id: 'aud-010', actorId: 'emp-002', actorName: 'Mostafa Zaki', actorNameAr: 'مصطفى زكي',
    action: 'integration.disconnected', entity: 'integration', entityId: 'int-bazaar',
    entityLabel: 'Bazaar Online — WooCommerce', entityLabelAr: 'بازار أونلاين — ووكومرس',
    at: minsAgo(4300),
  },
]
