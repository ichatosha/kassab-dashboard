// ── Raw demo seeds ────────────────────────────────────────────────────
// Single source of truth for the demo scenario. Every aggregate shown in
// the UI (positions filled, workforce cost, application counts, payouts)
// is DERIVED from these seeds, so no two screens can contradict each other.
// No imports here on purpose: this module sits at the bottom of the graph.

import type {
  BusinessType, CompanyStatus, DriverStatus, EmploymentType, MotorcycleBrand,
  WorkforceRequestStatus,
} from '../types/domain'

export interface CompanySeed {
  key: string
  name: string
  nameAr: string
  type: BusinessType
  city: string
  address: string
  contact: string
  contactAr: string
  status?: CompanyStatus
  verified?: boolean
  registeredDaysAgo: number
}

export interface RequestSeed {
  key: string
  companyKey: string
  required: number
  salary: number
  bonuses: number
  area: string
  areaAr: string
  hours: string
  hoursAr: string
  days: string
  daysAr: string
  employmentType: EmploymentType
  experienceYears: number
  requirements: string[]
  benefits: string[]
  createdDaysAgo: number
  deadlineInDays: number
  draft?: boolean
  statusOverride?: WorkforceRequestStatus
}

export interface DriverSeed {
  name: string
  nameAr: string
  age: number
  city: string
  address: string
  brand: MotorcycleBrand
  model: string
  rating: number
  successRate: number
  completed: number
  failed: number
  cancelled: number
  experience: number
  status: DriverStatus
  hiredAt?: string // request key
  availability: EmploymentType
  area: string
  registeredDaysAgo: number
}

export const companySeeds: CompanySeed[] = [
  { key: 'koshary', name: 'Koshary El Tahrir', nameAr: 'كشري التحرير', type: 'restaurant', city: 'Cairo', address: '12 Tahrir Square, Downtown', contact: 'Hassan Mahmoud', contactAr: 'حسن محمود', registeredDaysAgo: 240 },
  { key: 'sehha', name: 'Sehha Pharmacies', nameAr: 'صيدليات صحة', type: 'pharmacy', city: 'Giza', address: '31 Tahrir St., Dokki', contact: 'Dr. Walid Anwar', contactAr: 'د. وليد أنور', registeredDaysAgo: 205 },
  { key: 'techzone', name: 'TechZone Egypt', nameAr: 'تك زون مصر', type: 'ecommerce', city: 'Cairo', address: 'Industrial Zone, Obour City', contact: 'Nourhan Ashraf', contactAr: 'نورهان أشرف', registeredDaysAgo: 190 },
  { key: 'fresh', name: 'Fresh Market', nameAr: 'فريش ماركت', type: 'retail', city: 'Mansoura', address: '18 Gomhoria St., Mansoura', contact: 'Adel Ghoneim', contactAr: 'عادل غنيم', registeredDaysAgo: 160 },
  { key: 'shawerma', name: 'Shawerma House', nameAr: 'بيت الشاورما', type: 'restaurant', city: 'Tanta', address: '44 El-Geish St., Tanta', contact: 'Mostafa Kandil', contactAr: 'مصطفى قنديل', registeredDaysAgo: 140 },
  { key: 'misr', name: 'Misr Logistics Co.', nameAr: 'شركة مصر للوجستيات', type: 'company', city: 'Alexandria', address: 'Smouha Business Park, Alexandria', contact: 'Eng. Sameh Fouad', contactAr: 'م. سامح فؤاد', registeredDaysAgo: 120 },
  { key: 'bazaar', name: 'Bazaar Online', nameAr: 'بازار أونلاين', type: 'ecommerce', city: 'Zagazig', address: 'Industrial Area, Zagazig', contact: 'Mohamed Serag', contactAr: 'محمد سراج', registeredDaysAgo: 95 },
  { key: 'glow', name: 'Glow Cosmetics', nameAr: 'جلو كوزمتكس', type: 'ecommerce', city: 'Cairo', address: 'Katameya Industrial Area', contact: 'Yasmin Tarek', contactAr: 'ياسمين طارق', registeredDaysAgo: 80 },
  { key: 'delta', name: 'Delta Pharma', nameAr: 'دلتا فارما', type: 'pharmacy', city: 'Mansoura', address: '7 El-Thawra St., Mansoura', contact: 'Dr. Amira Loutfy', contactAr: 'د. أميرة لطفي', registeredDaysAgo: 62 },
  { key: 'broasted', name: 'Broasted El Sheikh', nameAr: 'بروستد الشيخ', type: 'restaurant', city: 'Ismailia', address: '9 Sultan Hussein St., Ismailia', contact: 'Sheikh Ramadan', contactAr: 'الشيخ رمضان', registeredDaysAgo: 48 },
  { key: 'nile', name: 'Nile Retail Group', nameAr: 'مجموعة النيل للتجزئة', type: 'retail', city: 'Port Said', address: '23 El-Gomhoria St., Port Said', contact: 'Ayman Roshdy', contactAr: 'أيمن رشدي', registeredDaysAgo: 34 },
  { key: 'damietta', name: 'Damietta Furniture Express', nameAr: 'دمياط إكسبريس للأثاث', type: 'company', city: 'Damietta', address: 'Furniture City, Damietta', contact: 'Ehab Selim', contactAr: 'إيهاب سليم', status: 'pending_review', verified: false, registeredDaysAgo: 6 },
]

export const requestSeeds: RequestSeed[] = [
  {
    key: 'koshary-1', companyKey: 'koshary', required: 6, salary: 8000, bonuses: 700,
    area: 'Downtown & Nasr City', areaAr: 'وسط البلد ومدينة نصر',
    hours: '12:00 - 22:00', hoursAr: '١٢:٠٠ ظهرًا - ١٠:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 1,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone', 'req.area'],
    benefits: ['ben.bonus', 'ben.fuel', 'ben.insurance'],
    createdDaysAgo: 22, deadlineInDays: 12,
  },
  {
    key: 'sehha-1', companyKey: 'sehha', required: 5, salary: 8500, bonuses: 500,
    area: 'Dokki & Mohandessin', areaAr: 'الدقي والمهندسين',
    hours: '09:00 - 19:00', hoursAr: '٩:٠٠ صباحًا - ٧:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 1,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone', 'req.careful'],
    benefits: ['ben.bonus', 'ben.insurance', 'ben.meal'],
    createdDaysAgo: 19, deadlineInDays: 9,
  },
  {
    key: 'techzone-1', companyKey: 'techzone', required: 8, salary: 7800, bonuses: 900,
    area: 'Greater Cairo', areaAr: 'القاهرة الكبرى',
    hours: '10:00 - 20:00', hoursAr: '١٠:٠٠ صباحًا - ٨:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 2,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone', 'req.experience'],
    benefits: ['ben.bonus', 'ben.fuel', 'ben.maintenance'],
    createdDaysAgo: 26, deadlineInDays: 7,
  },
  {
    key: 'fresh-1', companyKey: 'fresh', required: 4, salary: 7500, bonuses: 400,
    area: 'Mansoura City', areaAr: 'مدينة المنصورة',
    hours: '08:00 - 18:00', hoursAr: '٨:٠٠ صباحًا - ٦:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 0,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone'],
    benefits: ['ben.bonus', 'ben.meal'],
    createdDaysAgo: 17, deadlineInDays: 14,
  },
  {
    key: 'shawerma-1', companyKey: 'shawerma', required: 1, salary: 7200, bonuses: 600,
    area: 'Tanta Center', areaAr: 'وسط طنطا',
    hours: '14:00 - 24:00', hoursAr: '٢:٠٠ ظهرًا - ١٢:٠٠ منتصف الليل',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'shifts', experienceYears: 0,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone'],
    benefits: ['ben.bonus', 'ben.meal', 'ben.fuel'],
    createdDaysAgo: 13, deadlineInDays: 16,
  },
  {
    key: 'misr-1', companyKey: 'misr', required: 10, salary: 9000, bonuses: 1000,
    area: 'Alexandria', areaAr: 'الإسكندرية',
    hours: '09:00 - 18:00', hoursAr: '٩:٠٠ صباحًا - ٦:٠٠ مساءً',
    days: '5 days / week', daysAr: '٥ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 2,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone', 'req.experience', 'req.area'],
    benefits: ['ben.bonus', 'ben.insurance', 'ben.fuel', 'ben.maintenance'],
    createdDaysAgo: 11, deadlineInDays: 19,
  },
  {
    key: 'bazaar-1', companyKey: 'bazaar', required: 5, salary: 7600, bonuses: 500,
    area: 'Zagazig & Sharqia', areaAr: 'الزقازيق والشرقية',
    hours: '10:00 - 20:00', hoursAr: '١٠:٠٠ صباحًا - ٨:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 1,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone'],
    benefits: ['ben.bonus', 'ben.fuel'],
    createdDaysAgo: 9, deadlineInDays: 21, statusOverride: 'reviewing',
  },
  {
    key: 'glow-1', companyKey: 'glow', required: 3, salary: 8000, bonuses: 400,
    area: 'New Cairo & Katameya', areaAr: 'القاهرة الجديدة والقطامية',
    hours: '11:00 - 19:00', hoursAr: '١١:٠٠ صباحًا - ٧:٠٠ مساءً',
    days: '5 days / week', daysAr: '٥ أيام في الأسبوع',
    employmentType: 'part_time', experienceYears: 0,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone', 'req.careful'],
    benefits: ['ben.bonus', 'ben.meal'],
    createdDaysAgo: 7, deadlineInDays: 23,
  },
  {
    key: 'delta-1', companyKey: 'delta', required: 4, salary: 8200, bonuses: 500,
    area: 'Mansoura & Talkha', areaAr: 'المنصورة وطلخا',
    hours: '09:00 - 19:00', hoursAr: '٩:٠٠ صباحًا - ٧:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 1,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone', 'req.careful'],
    benefits: ['ben.bonus', 'ben.insurance'],
    createdDaysAgo: 5, deadlineInDays: 25,
  },
  {
    key: 'broasted-1', companyKey: 'broasted', required: 3, salary: 7000, bonuses: 500,
    area: 'Ismailia Center', areaAr: 'وسط الإسماعيلية',
    hours: '13:00 - 23:00', hoursAr: '١:٠٠ ظهرًا - ١١:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'shifts', experienceYears: 0,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone'],
    benefits: ['ben.meal', 'ben.bonus'],
    createdDaysAgo: 4, deadlineInDays: 26,
  },
  {
    key: 'nile-1', companyKey: 'nile', required: 4, salary: 7800, bonuses: 400,
    area: 'Port Said', areaAr: 'بورسعيد',
    hours: '09:00 - 18:00', hoursAr: '٩:٠٠ صباحًا - ٦:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 1,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone'],
    benefits: ['ben.bonus', 'ben.fuel'],
    createdDaysAgo: 2, deadlineInDays: 28,
  },
  {
    key: 'damietta-1', companyKey: 'damietta', required: 5, salary: 8800, bonuses: 600,
    area: 'Damietta & New Damietta', areaAr: 'دمياط ودمياط الجديدة',
    hours: '09:00 - 18:00', hoursAr: '٩:٠٠ صباحًا - ٦:٠٠ مساءً',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'full_time', experienceYears: 2,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone', 'req.experience'],
    benefits: ['ben.bonus', 'ben.insurance', 'ben.fuel'],
    createdDaysAgo: 3, deadlineInDays: 30, draft: true,
  },
  {
    key: 'shawerma-2', companyKey: 'shawerma', required: 3, salary: 7400, bonuses: 600,
    area: 'Tanta & Kafr El-Zayat', areaAr: 'طنطا وكفر الزيات',
    hours: '14:00 - 24:00', hoursAr: '٢:٠٠ ظهرًا - ١٢:٠٠ منتصف الليل',
    days: '6 days / week', daysAr: '٦ أيام في الأسبوع',
    employmentType: 'shifts', experienceYears: 0,
    requirements: ['req.motorcycle', 'req.license', 'req.smartphone'],
    benefits: ['ben.bonus', 'ben.meal'],
    createdDaysAgo: 6, deadlineInDays: 24,
  },
  {
    key: 'fresh-2', companyKey: 'fresh', required: 2, salary: 7300, bonuses: 300,
    area: 'Talkha', areaAr: 'طلخا',
    hours: '08:00 - 16:00', hoursAr: '٨:٠٠ صباحًا - ٤:٠٠ مساءً',
    days: '5 days / week', daysAr: '٥ أيام في الأسبوع',
    employmentType: 'part_time', experienceYears: 0,
    requirements: ['req.motorcycle', 'req.license'],
    benefits: ['ben.meal'],
    createdDaysAgo: 58, deadlineInDays: -14, statusOverride: 'closed',
  },
]


// 34 drivers: 18 hired (matching the seeded requests), 12 available,
// 3 under review, 1 suspended.
export const driverSeeds: DriverSeed[] = [
  // ── Hired: Koshary El Tahrir (4)
  { name: 'Mahmoud El-Sayed', nameAr: 'محمود السيد', age: 28, city: 'Cairo', address: '14 Abbas El-Akkad St., Nasr City', brand: 'honda', model: 'CG 150', rating: 4.8, successRate: 97.4, completed: 1243, failed: 21, cancelled: 12, experience: 4, status: 'hired', hiredAt: 'koshary-1', availability: 'full_time', area: 'Nasr City', registeredDaysAgo: 230 },
  { name: 'Ahmed Abdel-Rahman', nameAr: 'أحمد عبدالرحمن', age: 31, city: 'Cairo', address: '3 Road 9, Maadi', brand: 'bajaj', model: 'Boxer 150', rating: 4.6, successRate: 95.8, completed: 987, failed: 28, cancelled: 15, experience: 3, status: 'hired', hiredAt: 'koshary-1', availability: 'full_time', area: 'Maadi', registeredDaysAgo: 218 },
  { name: 'Youssef Hassan', nameAr: 'يوسف حسن', age: 25, city: 'Cairo', address: '7 26th of July St., Zamalek', brand: 'honda', model: 'CG 125', rating: 4.8, successRate: 96.9, completed: 1320, failed: 26, cancelled: 15, experience: 4, status: 'hired', hiredAt: 'koshary-1', availability: 'full_time', area: 'Downtown', registeredDaysAgo: 226 },
  { name: 'Tarek Samir', nameAr: 'طارق سمير', age: 33, city: 'Cairo', address: '5 Ahmed Orabi St., Shubra', brand: 'sym', model: 'Wolf 150', rating: 4.3, successRate: 93.2, completed: 519, failed: 25, cancelled: 12, experience: 2, status: 'hired', hiredAt: 'koshary-1', availability: 'shifts', area: 'Shubra', registeredDaysAgo: 199 },
  // ── Hired: Sehha Pharmacies (3)
  { name: 'Karim Mostafa', nameAr: 'كريم مصطفى', age: 27, city: 'Giza', address: '31 Tahrir St., Dokki', brand: 'yamaha', model: 'Crux 110', rating: 4.5, successRate: 95.1, completed: 742, failed: 27, cancelled: 11, experience: 3, status: 'hired', hiredAt: 'sehha-1', availability: 'full_time', area: 'Dokki', registeredDaysAgo: 195 },
  { name: 'Hossam Ibrahim', nameAr: 'حسام إبراهيم', age: 30, city: 'Giza', address: '25 Gameat El-Dewal St., Mohandessin', brand: 'honda', model: 'CG 150', rating: 4.4, successRate: 94.3, completed: 655, failed: 26, cancelled: 12, experience: 2, status: 'hired', hiredAt: 'sehha-1', availability: 'full_time', area: 'Mohandessin', registeredDaysAgo: 188 },
  { name: 'Islam Farouk', nameAr: 'إسلام فاروق', age: 24, city: 'Giza', address: '210 El-Haram St., Giza', brand: 'bajaj', model: 'Pulsar 150', rating: 4.1, successRate: 92.6, completed: 388, failed: 22, cancelled: 9, experience: 1, status: 'hired', hiredAt: 'sehha-1', availability: 'full_time', area: 'Haram', registeredDaysAgo: 175 },
  // ── Hired: TechZone Egypt (5)
  { name: 'Mohamed Fathy', nameAr: 'محمد فتحي', age: 29, city: 'Cairo', address: '72 El-Merghany St., Heliopolis', brand: 'honda', model: 'CB 150', rating: 4.9, successRate: 98.1, completed: 1511, failed: 19, cancelled: 10, experience: 5, status: 'hired', hiredAt: 'techzone-1', availability: 'full_time', area: 'Heliopolis', registeredDaysAgo: 210 },
  { name: 'Omar Khaled', nameAr: 'عمر خالد', age: 26, city: 'Cairo', address: '112 90th St., 5th Settlement', brand: 'yamaha', model: 'FZ 150', rating: 4.7, successRate: 96.4, completed: 1108, failed: 25, cancelled: 16, experience: 4, status: 'hired', hiredAt: 'techzone-1', availability: 'full_time', area: 'New Cairo', registeredDaysAgo: 204 },
  { name: 'Mostafa Gamal', nameAr: 'مصطفى جمال', age: 32, city: 'Cairo', address: '2 Road 233, Degla, Maadi', brand: 'bajaj', model: 'Pulsar 180', rating: 4.6, successRate: 95.6, completed: 863, failed: 24, cancelled: 14, experience: 3, status: 'hired', hiredAt: 'techzone-1', availability: 'full_time', area: 'Maadi', registeredDaysAgo: 182 },
  { name: 'Peter Emad', nameAr: 'بيتر عماد', age: 27, city: 'Cairo', address: '8 Baghdad St., Korba', brand: 'sym', model: 'Wolf 125', rating: 4.5, successRate: 94.9, completed: 678, failed: 24, cancelled: 12, experience: 2, status: 'hired', hiredAt: 'techzone-1', availability: 'full_time', area: 'Heliopolis', registeredDaysAgo: 170 },
  { name: 'Abdullah Saad', nameAr: 'عبدالله سعد', age: 23, city: 'Cairo', address: '44 Makram Ebeid St., Nasr City', brand: 'honda', model: 'CG 125', rating: 4.4, successRate: 94.1, completed: 597, failed: 23, cancelled: 12, experience: 2, status: 'hired', hiredAt: 'techzone-1', availability: 'full_time', area: 'Nasr City', registeredDaysAgo: 164 },
  // ── Hired: Fresh Market (2)
  { name: 'Sameh Riad', nameAr: 'سامح رياض', age: 34, city: 'Mansoura', address: '18 Gomhoria St., Mansoura', brand: 'yamaha', model: 'Crux 110', rating: 4.5, successRate: 95.3, completed: 704, failed: 24, cancelled: 11, experience: 3, status: 'hired', hiredAt: 'fresh-1', availability: 'full_time', area: 'Mansoura', registeredDaysAgo: 152 },
  { name: 'Hazem Ismail', nameAr: 'حازم إسماعيل', age: 26, city: 'Mansoura', address: '6 El-Sekka El-Hadid St., Mansoura', brand: 'bajaj', model: 'Boxer 150', rating: 4.2, successRate: 93.4, completed: 431, failed: 21, cancelled: 9, experience: 2, status: 'hired', hiredAt: 'fresh-1', availability: 'full_time', area: 'Mansoura', registeredDaysAgo: 145 },
  // ── Hired: Shawerma House (1)
  { name: 'Mina Sameh', nameAr: 'مينا سامح', age: 25, city: 'Tanta', address: '44 El-Geish St., Tanta', brand: 'sym', model: 'GR 125', rating: 4.3, successRate: 93.8, completed: 465, failed: 22, cancelled: 10, experience: 2, status: 'hired', hiredAt: 'shawerma-1', availability: 'shifts', area: 'Tanta', registeredDaysAgo: 133 },
  // ── Hired: Misr Logistics (3)
  { name: 'Waleed Ashraf', nameAr: 'وليد أشرف', age: 35, city: 'Alexandria', address: '19 Smouha Rd., Alexandria', brand: 'honda', model: 'CB 150', rating: 4.6, successRate: 96.1, completed: 812, failed: 22, cancelled: 11, experience: 4, status: 'hired', hiredAt: 'misr-1', availability: 'full_time', area: 'Smouha', registeredDaysAgo: 118 },
  { name: 'Sherif Nabil', nameAr: 'شريف نبيل', age: 30, city: 'Alexandria', address: '77 Gamal Abdel Nasser Rd., Miami', brand: 'yamaha', model: 'FZ 150', rating: 4.7, successRate: 96.7, completed: 921, failed: 21, cancelled: 10, experience: 4, status: 'hired', hiredAt: 'misr-1', availability: 'full_time', area: 'Miami', registeredDaysAgo: 112 },
  { name: 'Khaled Younis', nameAr: 'خالد يونس', age: 28, city: 'Alexandria', address: '5 El-Nasr St., Sidi Gaber', brand: 'bajaj', model: 'Pulsar 150', rating: 4.0, successRate: 91.8, completed: 342, failed: 20, cancelled: 10, experience: 1, status: 'hired', hiredAt: 'misr-1', availability: 'full_time', area: 'Sidi Gaber', registeredDaysAgo: 104 },
  // ── Available (12)
  { name: 'Hany Adel', nameAr: 'هاني عادل', age: 29, city: 'Cairo', address: '17 Shehab St., Mohandessin', brand: 'honda', model: 'CG 150', rating: 4.5, successRate: 95.0, completed: 604, failed: 22, cancelled: 10, experience: 3, status: 'available', availability: 'full_time', area: 'Mohandessin', registeredDaysAgo: 41 },
  { name: 'Ayman Sherif', nameAr: 'أيمن شريف', age: 24, city: 'Cairo', address: '2 El-Nasr Rd., Nasr City', brand: 'bajaj', model: 'Boxer 150', rating: 4.4, successRate: 94.2, completed: 512, failed: 21, cancelled: 10, experience: 2, status: 'available', availability: 'full_time', area: 'Nasr City', registeredDaysAgo: 33 },
  { name: 'Fady Nagy', nameAr: 'فادي ناجي', age: 27, city: 'Giza', address: '60 Central Axis, 6th of October', brand: 'yamaha', model: 'Crux 110', rating: 4.6, successRate: 95.7, completed: 688, failed: 21, cancelled: 10, experience: 3, status: 'available', availability: 'full_time', area: '6th of October', registeredDaysAgo: 29 },
  { name: 'Mostafa Amin', nameAr: 'مصطفى أمين', age: 22, city: 'Mansoura', address: '11 El-Thawra St., Mansoura', brand: 'sym', model: 'Wolf 125', rating: 4.2, successRate: 93.1, completed: 298, failed: 16, cancelled: 6, experience: 1, status: 'available', availability: 'full_time', area: 'Mansoura', registeredDaysAgo: 26 },
  { name: 'Sayed Mansour', nameAr: 'سيد منصور', age: 36, city: 'Alexandria', address: '3 Port Said St., Cleopatra', brand: 'honda', model: 'CG 125', rating: 4.7, successRate: 96.5, completed: 934, failed: 21, cancelled: 11, experience: 5, status: 'available', availability: 'full_time', area: 'Cleopatra', registeredDaysAgo: 22 },
  { name: 'Ramy Sobhy', nameAr: 'رامي صبحي', age: 31, city: 'Tanta', address: '9 El-Nahda St., Tanta', brand: 'tvs', model: 'Apache 160', rating: 4.3, successRate: 93.9, completed: 447, failed: 19, cancelled: 9, experience: 2, status: 'available', availability: 'shifts', area: 'Tanta', registeredDaysAgo: 19 },
  { name: 'Nader Fahmy', nameAr: 'نادر فهمي', age: 26, city: 'Zagazig', address: '22 El-Qawmia St., Zagazig', brand: 'bajaj', model: 'Pulsar 150', rating: 4.4, successRate: 94.6, completed: 521, failed: 20, cancelled: 9, experience: 2, status: 'available', availability: 'full_time', area: 'Zagazig', registeredDaysAgo: 16 },
  { name: 'Emad Zaki', nameAr: 'عماد زكي', age: 33, city: 'Ismailia', address: '4 Sultan Hussein St., Ismailia', brand: 'honda', model: 'CG 150', rating: 4.5, successRate: 95.2, completed: 617, failed: 21, cancelled: 10, experience: 3, status: 'available', availability: 'full_time', area: 'Ismailia', registeredDaysAgo: 13 },
  { name: 'Bassem Helmy', nameAr: 'باسم حلمي', age: 23, city: 'Port Said', address: '23 El-Gomhoria St., Port Said', brand: 'yamaha', model: 'FZ 150', rating: 4.1, successRate: 92.4, completed: 265, failed: 15, cancelled: 6, experience: 1, status: 'available', availability: 'part_time', area: 'Port Said', registeredDaysAgo: 11 },
  { name: 'Sherif Lotfy', nameAr: 'شريف لطفي', age: 28, city: 'Damietta', address: '8 El-Nile St., Damietta', brand: 'sym', model: 'GR 125', rating: 4.6, successRate: 95.9, completed: 703, failed: 20, cancelled: 10, experience: 3, status: 'available', availability: 'full_time', area: 'Damietta', registeredDaysAgo: 9 },
  { name: 'Ibrahim Hamdy', nameAr: 'إبراهيم حمدي', age: 30, city: 'Cairo', address: '5 Mostafa El-Nahas St., Nasr City', brand: 'honda', model: 'CB 150', rating: 4.8, successRate: 97.1, completed: 1042, failed: 21, cancelled: 10, experience: 5, status: 'available', availability: 'full_time', area: 'Nasr City', registeredDaysAgo: 7 },
  { name: 'Amr Ezzat', nameAr: 'عمرو عزت', age: 25, city: 'Giza', address: '18 Gameat El-Dewal St., Mohandessin', brand: 'tvs', model: 'Apache 150', rating: 4.3, successRate: 93.7, completed: 389, failed: 18, cancelled: 8, experience: 2, status: 'available', availability: 'full_time', area: 'Mohandessin', registeredDaysAgo: 5 },
  // ── Under review (3)
  { name: 'Ali Ramadan', nameAr: 'علي رمضان', age: 24, city: 'Cairo', address: '9 El-Zohour St., Nasr City', brand: 'bajaj', model: 'Boxer 150', rating: 0, successRate: 0, completed: 0, failed: 0, cancelled: 0, experience: 1, status: 'under_review', availability: 'full_time', area: 'Nasr City', registeredDaysAgo: 3 },
  { name: 'Saeed Abdel-Aziz', nameAr: 'سعيد عبدالعزيز', age: 27, city: 'Mansoura', address: '14 El-Gala St., Mansoura', brand: 'honda', model: 'CG 125', rating: 0, successRate: 0, completed: 0, failed: 0, cancelled: 0, experience: 2, status: 'under_review', availability: 'full_time', area: 'Mansoura', registeredDaysAgo: 2 },
  { name: 'Mahmoud Rizk', nameAr: 'محمود رزق', age: 22, city: 'Tanta', address: '3 El-Bahr St., Tanta', brand: 'sym', model: 'Wolf 125', rating: 0, successRate: 0, completed: 0, failed: 0, cancelled: 0, experience: 0, status: 'under_review', availability: 'shifts', area: 'Tanta', registeredDaysAgo: 1 },
  // ── Suspended (1)
  { name: 'Gamal Abdo', nameAr: 'جمال عبده', age: 38, city: 'Giza', address: '12 El-Sudan St., Dokki', brand: 'bajaj', model: 'Pulsar 150', rating: 3.4, successRate: 84.2, completed: 214, failed: 29, cancelled: 11, experience: 2, status: 'suspended', availability: 'full_time', area: 'Dokki', registeredDaysAgo: 88 },
]

// Kassab charges companies a service fee on top of driver salaries.
export const KASSAB_FEE_RATE = 0.125
