import type { Employee } from '../types/domain'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString()

// Kassab's own staff — not drivers, not company employees. Every account
// on the login screen maps to one of these people.
export const mockEmployees: Employee[] = [
  {
    id: 'emp-001', code: 'KSB-E101',
    name: 'Kassab Admin', nameAr: 'إدارة كساب',
    username: 'admin', email: 'admin@kassab.demo', phone: '+20 100 111 2200',
    role: 'platform_owner', department: 'Executive', departmentAr: 'الإدارة العليا',
    status: 'active', lastLoginAt: hoursAgo(1), createdAt: daysAgo(420),
  },
  {
    id: 'emp-002', code: 'KSB-E102',
    name: 'Mostafa Zaki', nameAr: 'مصطفى زكي',
    username: 'm.zaki', email: 'gm@kassab.demo', phone: '+20 100 222 3311',
    role: 'general_manager', department: 'Operations', departmentAr: 'العمليات',
    status: 'active', lastLoginAt: hoursAgo(3), createdAt: daysAgo(300),
  },
  {
    id: 'emp-003', code: 'KSB-E103',
    name: 'Nourhan Adel', nameAr: 'نورهان عادل',
    username: 'n.adel', email: 'recruiter@kassab.demo', phone: '+20 101 333 4422',
    role: 'recruitment_admin', department: 'Recruitment', departmentAr: 'التوظيف',
    status: 'active', lastLoginAt: hoursAgo(2), createdAt: daysAgo(240),
  },
  {
    id: 'emp-004', code: 'KSB-E104',
    name: 'Tarek Selim', nameAr: 'طارق سليم',
    username: 't.selim', email: 'finance@kassab.demo', phone: '+20 102 444 5533',
    role: 'finance_admin', department: 'Finance', departmentAr: 'الحسابات',
    status: 'active', lastLoginAt: hoursAgo(20), createdAt: daysAgo(210),
  },
  {
    id: 'emp-005', code: 'KSB-E105',
    name: 'Mai Hassan', nameAr: 'مي حسن',
    username: 'm.hassan', email: 'support@kassab.demo', phone: '+20 103 555 6644',
    role: 'support', department: 'Support', departmentAr: 'الدعم',
    status: 'active', lastLoginAt: hoursAgo(6), createdAt: daysAgo(150),
  },
  {
    id: 'emp-006', code: 'KSB-E106',
    name: 'Ahmed Mohamed', nameAr: 'أحمد محمد',
    username: 'a.mohamed', email: 'ahmed.m@kassab.demo', phone: '+20 106 666 7755',
    role: 'recruitment_admin', department: 'Recruitment', departmentAr: 'التوظيف',
    status: 'active', lastLoginAt: hoursAgo(9), createdAt: daysAgo(95),
  },
  {
    id: 'emp-007', code: 'KSB-E107',
    name: 'Salma Ezzat', nameAr: 'سلمى عزت',
    username: 's.ezzat', email: 'salma.e@kassab.demo', phone: '+20 109 777 8866',
    role: 'support', department: 'Support', departmentAr: 'الدعم',
    status: 'disabled', lastLoginAt: daysAgo(38), createdAt: daysAgo(140),
  },
]
