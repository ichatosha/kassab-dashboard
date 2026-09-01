import type { Branch, Company, BusinessType } from '../types/domain'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

// Volume scale keeps company/branch order counts consistent with the
// network's ~74 orders/day revenue series (see mocks/finance.ts).
const VOLUME_SCALE = 0.25

interface CompanySeed {
  name: string
  nameAr: string
  type: BusinessType
  contact: string
  city: string
  status?: Company['status']
  price: number
  monthlyOrders: number
  outstanding: number
  branches: { name: string; nameAr: string; address: string; manager: string; daily: number }[]
}

const seeds: CompanySeed[] = [
  {
    name: 'Koshary El Tahrir', nameAr: 'كشري التحرير', type: 'restaurant', contact: 'Hassan Mahmoud', city: 'Cairo', price: 25, monthlyOrders: 1840, outstanding: 12400,
    branches: [
      { name: 'Downtown', nameAr: 'وسط البلد', address: '12 Tahrir Sq., Downtown, Cairo', manager: 'Sayed Ali', daily: 34 },
      { name: 'Nasr City', nameAr: 'مدينة نصر', address: '44 Abbas El-Akkad St., Nasr City', manager: 'Mohamed Reda', daily: 27 },
      { name: 'Maadi', nameAr: 'المعادي', address: '9 Road 9, Maadi', manager: 'Amir Fawzy', daily: 19 },
    ],
  },
  {
    name: 'El Ezaby Pharmacy', nameAr: 'صيدلية العزبي', type: 'pharmacy', contact: 'Dr. Mona Selim', city: 'Cairo', price: 30, monthlyOrders: 1420, outstanding: 8150,
    branches: [
      { name: 'Heliopolis', nameAr: 'مصر الجديدة', address: '87 El-Merghany St., Heliopolis', manager: 'Dr. Ahmed Zaki', daily: 25 },
      { name: 'Zamalek', nameAr: 'الزمالك', address: '5 26th of July St., Zamalek', manager: 'Dr. Rania Kamel', daily: 16 },
    ],
  },
  {
    name: 'Cairo Bites', nameAr: 'كايرو بايتس', type: 'restaurant', contact: 'Omar El-Shazly', city: 'Cairo', price: 25, monthlyOrders: 1230, outstanding: 0,
    branches: [
      { name: 'New Cairo', nameAr: 'القاهرة الجديدة', address: '90th St., 5th Settlement', manager: 'Khaled Emam', daily: 31 },
    ],
  },
  {
    name: 'Sehha Pharmacies', nameAr: 'صيدليات صحة', type: 'pharmacy', contact: 'Dr. Walid Anwar', city: 'Giza', price: 30, monthlyOrders: 980, outstanding: 5320,
    branches: [
      { name: 'Dokki', nameAr: 'الدقي', address: '31 Tahrir St., Dokki', manager: 'Dr. Heba Samy', daily: 18 },
      { name: 'Mohandessin', nameAr: 'المهندسين', address: '18 Gameat El-Dewal St.', manager: 'Dr. Tamer Hosny', daily: 14 },
    ],
  },
  {
    name: 'TechZone Egypt', nameAr: 'تك زون مصر', type: 'ecommerce', contact: 'Nourhan Ashraf', city: 'Cairo', price: 20, monthlyOrders: 2150, outstanding: 18750,
    branches: [
      { name: 'Fulfillment Center', nameAr: 'مركز التشغيل', address: 'Industrial Zone, Obour City', manager: 'Mahmoud Farid', daily: 72 },
    ],
  },
  {
    name: 'Fresh Market', nameAr: 'فريش ماركت', type: 'retail', contact: 'Adel Ghoneim', city: 'Cairo', price: 22, monthlyOrders: 860, outstanding: 3900,
    branches: [
      { name: 'Maadi', nameAr: 'المعادي', address: '2 Road 233, Degla, Maadi', manager: 'Hossam Refaat', daily: 15 },
      { name: 'Nasr City', nameAr: 'مدينة نصر', address: '12 Makram Ebeid St.', manager: 'Samir Wahba', daily: 13 },
    ],
  },
  {
    name: 'Shawerma House', nameAr: 'بيت الشاورما', type: 'restaurant', contact: 'Mostafa Kandil', city: 'Giza', price: 25, monthlyOrders: 1090, outstanding: 6200,
    branches: [
      { name: 'Mohandessin', nameAr: 'المهندسين', address: '55 Shehab St., Mohandessin', manager: 'Ashraf Galal', daily: 29 },
      { name: '6th of October', nameAr: '٦ أكتوبر', address: 'Central Axis, 6th of October', manager: 'Ehab Morsi', daily: 17 },
    ],
  },
  {
    name: 'Misr Logistics Co.', nameAr: 'شركة مصر للوجستيات', type: 'company', contact: 'Eng. Sameh Fouad', city: 'Cairo', price: 20, monthlyOrders: 1660, outstanding: 14300,
    branches: [
      { name: 'Head Office', nameAr: 'المقر الرئيسي', address: 'Smart Village, KM28 Cairo-Alex Rd.', manager: 'Eng. Dalia Nassar', daily: 41 },
    ],
  },
  {
    name: 'Glow Cosmetics', nameAr: 'جلو كوزمتكس', type: 'ecommerce', contact: 'Yasmin Tarek', city: 'Cairo', price: 20, monthlyOrders: 730, outstanding: 0,
    branches: [
      { name: 'Warehouse', nameAr: 'المخزن', address: 'Katameya Industrial Area', manager: 'Ola Shahin', daily: 24 },
    ],
  },
  {
    name: 'Broasted El Sheikh', nameAr: 'بروستد الشيخ', type: 'restaurant', contact: 'Sheikh Ramadan', city: 'Cairo', price: 25, monthlyOrders: 540, outstanding: 2750,
    branches: [
      { name: 'Shubra', nameAr: 'شبرا', address: '101 Shubra St.', manager: 'Fathy Selim', daily: 16 },
    ],
  },
  {
    name: 'Dawaa Express', nameAr: 'دواء إكسبريس', type: 'pharmacy', contact: 'Dr. Amira Loutfy', city: 'Giza', status: 'pending_review', price: 30, monthlyOrders: 0, outstanding: 0,
    branches: [
      { name: 'Haram', nameAr: 'الهرم', address: '210 El-Haram St., Giza', manager: 'Dr. Sameh Ragab', daily: 0 },
    ],
  },
  {
    name: 'Bazaar Online', nameAr: 'بازار أونلاين', type: 'ecommerce', contact: 'Mohamed Serag', city: 'Cairo', status: 'suspended', price: 20, monthlyOrders: 120, outstanding: 9800,
    branches: [
      { name: 'Storage Hub', nameAr: 'مركز التخزين', address: '10th of Ramadan City', manager: 'Ayman Roshdy', daily: 0 },
    ],
  },
]

const contactAr: Record<string, string> = {
  'Hassan Mahmoud': 'حسن محمود',
  'Dr. Mona Selim': 'د. منى سليم',
  'Omar El-Shazly': 'عمر الشاذلي',
  'Dr. Walid Anwar': 'د. وليد أنور',
  'Nourhan Ashraf': 'نورهان أشرف',
  'Adel Ghoneim': 'عادل غنيم',
  'Mostafa Kandil': 'مصطفى قنديل',
  'Eng. Sameh Fouad': 'م. سامح فؤاد',
  'Yasmin Tarek': 'ياسمين طارق',
  'Sheikh Ramadan': 'الشيخ رمضان',
  'Dr. Amira Loutfy': 'د. أميرة لطفي',
  'Mohamed Serag': 'محمد سراج',
}

export const mockBranches: Branch[] = []

export const mockCompanies: Company[] = seeds.map((s, i) => {
  const companyId = `cmp-${String(i + 1).padStart(3, '0')}`
  const branchIds: string[] = []
  s.branches.forEach((b, j) => {
    const id = `brn-${String(i + 1).padStart(2, '0')}${j + 1}`
    branchIds.push(id)
    mockBranches.push({
      id,
      companyId,
      name: b.name,
      nameAr: b.nameAr,
      address: b.address,
      manager: b.manager,
      phone: `+20 2 2${(4567890 + i * 111 + j * 7).toString().slice(0, 7)}`,
      active: (s.status ?? 'approved') === 'approved',
      dailyOrders: b.daily === 0 ? 0 : Math.max(1, Math.round(b.daily * VOLUME_SCALE)),
      monthlyOrders: b.daily === 0 ? 0 : Math.max(20, Math.round(b.daily * VOLUME_SCALE * 26)),
      successRate: 91 + ((i + j) % 8),
    })
  })
  const status = s.status ?? 'approved'
  return {
    id: companyId,
    code: `KSB-C${String(2001 + i)}`,
    name: s.name,
    nameAr: s.nameAr,
    type: s.type,
    contactName: s.contact,
    contactNameAr: contactAr[s.contact] ?? s.contact,
    phone: `+20 11${(12345678 + i * 2468).toString().slice(0, 8)}`,
    email: `ops@${s.name.toLowerCase().replace(/[^a-z]+/g, '')}.example`,
    city: s.city,
    status,
    pricingProfile: s.type === 'restaurant' ? 'Restaurant Standard' : s.type === 'pharmacy' ? 'Pharmacy Priority' : 'Corporate Volume',
    deliveryPrice: s.price,
    activeOrders: status === 'approved' ? 1 + (i % 3) : 0,
    monthlyOrders: Math.round(s.monthlyOrders * VOLUME_SCALE),
    monthlyRevenue: Math.round(s.monthlyOrders * VOLUME_SCALE) * s.price,
    outstandingBalance: Math.round(s.outstanding * 0.35),
    walletBalance: status === 'approved' ? 4200 + i * 1830 : 0,
    avgDeliveryMins: 32 + (i % 14),
    successRate: 90 + (i % 9),
    registeredAt: daysAgo(60 + i * 24),
    branchIds,
  }
})
