import type { Driver, DriverDocument, VehicleType } from '../types/domain'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

const docs = (
  submittedDaysAgo: number,
  status: DriverDocument['status'] = 'approved',
): DriverDocument[] =>
  (['personal_photo', 'national_id', 'driving_license', 'vehicle_license'] as const).map(
    (kind, i) => ({
      id: `${kind}-${submittedDaysAgo}-${i}`,
      kind,
      status,
      submittedAt: daysAgo(submittedDaysAgo),
    }),
  )

interface DriverSeed {
  name: string
  nameAr: string
  zone: string
  city: string
  vehicle: VehicleType
  model: string
  plate: string
  status?: Driver['status']
  online?: boolean
  delivering?: boolean
  rating: number
  completed: number
  earnings: number
  x: number
  y: number
}

// Monthly earnings scale factor keeps driver payouts consistent with the
// network's ~74 orders/day revenue series (see mocks/finance.ts).
const EARNINGS_SCALE = 0.4

const seeds: DriverSeed[] = [
  { name: 'Mahmoud El-Sayed', nameAr: 'محمود السيد', zone: 'Nasr City', city: 'Cairo', vehicle: 'motorcycle', model: 'Honda CG 150', plate: 'ق ص م 4821', online: true, delivering: true, rating: 4.8, completed: 1243, earnings: 9840, x: 62, y: 38 },
  { name: 'Ahmed Abdel-Rahman', nameAr: 'أحمد عبدالرحمن', zone: 'Maadi', city: 'Cairo', vehicle: 'motorcycle', model: 'Bajaj Boxer', plate: 'س د ر 7302', online: true, delivering: true, rating: 4.6, completed: 987, earnings: 8420, x: 48, y: 71 },
  { name: 'Mohamed Fathy', nameAr: 'محمد فتحي', zone: 'Heliopolis', city: 'Cairo', vehicle: 'car', model: 'Chevrolet Aveo', plate: 'أ ن ص 1957', online: true, delivering: true, rating: 4.9, completed: 1511, earnings: 12760, x: 70, y: 24 },
  { name: 'Karim Mostafa', nameAr: 'كريم مصطفى', zone: 'Dokki', city: 'Giza', vehicle: 'motorcycle', model: 'SYM Wolf', plate: 'ج ط ع 6644', online: true, delivering: true, rating: 4.5, completed: 742, earnings: 7180, x: 32, y: 46 },
  { name: 'Hossam Ibrahim', nameAr: 'حسام إبراهيم', zone: 'Mohandessin', city: 'Giza', vehicle: 'tricycle', model: 'Dayun Cargo', plate: 'م هـ ل 3319', online: true, delivering: true, rating: 4.4, completed: 655, earnings: 6890, x: 27, y: 39 },
  { name: 'Omar Khaled', nameAr: 'عمر خالد', zone: 'New Cairo', city: 'Cairo', vehicle: 'car', model: 'Hyundai Accent', plate: 'ر ق ب 8265', online: true, rating: 4.7, completed: 1108, earnings: 10230, x: 82, y: 52 },
  { name: 'Tarek Samir', nameAr: 'طارق سمير', zone: 'Shubra', city: 'Cairo', vehicle: 'motorcycle', model: 'Halawa 200', plate: 'ص ن م 5127', online: true, rating: 4.3, completed: 519, earnings: 5940, x: 44, y: 18 },
  { name: 'Youssef Hassan', nameAr: 'يوسف حسن', zone: 'Zamalek', city: 'Cairo', vehicle: 'motorcycle', model: 'Honda CG 125', plate: 'ق ل ف 9083', online: true, rating: 4.8, completed: 1320, earnings: 11150, x: 39, y: 35 },
  { name: 'Amr Ezzat', nameAr: 'عمرو عزت', zone: 'Nasr City', city: 'Cairo', vehicle: 'tricycle', model: 'Zongshen Cargo', plate: 'ط ب ج 2276', online: true, rating: 4.2, completed: 431, earnings: 4870, x: 65, y: 41 },
  { name: 'Mostafa Gamal', nameAr: 'مصطفى جمال', zone: 'Maadi', city: 'Cairo', vehicle: 'motorcycle', model: 'Bajaj Pulsar', plate: 'د س ق 6691', online: true, rating: 4.6, completed: 863, earnings: 7920, x: 51, y: 67 },
  { name: 'Hany Adel', nameAr: 'هاني عادل', zone: 'Downtown', city: 'Cairo', vehicle: 'motorcycle', model: 'SYM GR 125', plate: 'ن ص ي 1408', rating: 4.5, completed: 704, earnings: 6540, x: 45, y: 42 },
  { name: 'Sherif Nabil', nameAr: 'شريف نبيل', zone: 'Heliopolis', city: 'Cairo', vehicle: 'car', model: 'Kia Rio', plate: 'ب م و 7754', rating: 4.7, completed: 921, earnings: 8860, x: 73, y: 27 },
  { name: 'Islam Farouk', nameAr: 'إسلام فاروق', zone: 'Giza', city: 'Giza', vehicle: 'motorcycle', model: 'Honda CG 150', plate: 'ع ج ن 3182', rating: 4.1, completed: 388, earnings: 4230, x: 24, y: 58 },
  { name: 'Abdullah Saad', nameAr: 'عبدالله سعد', zone: 'New Cairo', city: 'Cairo', vehicle: 'motorcycle', model: 'Bajaj Boxer', plate: 'ي ر ص 5563', rating: 4.4, completed: 597, earnings: 6120, x: 85, y: 49 },
  { name: 'Waleed Ashraf', nameAr: 'وليد أشرف', zone: '6th of October', city: 'Giza', vehicle: 'car', model: 'Nissan Sunny', plate: 'ف ق ط 8830', rating: 4.6, completed: 812, earnings: 8350, x: 12, y: 44 },
  { name: 'Mina Sameh', nameAr: 'مينا سامح', zone: 'Shubra', city: 'Cairo', vehicle: 'motorcycle', model: 'Halawa 150', plate: 'ك ن د 2914', rating: 4.3, completed: 465, earnings: 5210, x: 42, y: 15 },
  { name: 'Peter Emad', nameAr: 'بيتر عماد', zone: 'Heliopolis', city: 'Cairo', vehicle: 'motorcycle', model: 'SYM Wolf', plate: 'س ط ل 6072', rating: 4.5, completed: 678, earnings: 7040, x: 68, y: 22 },
  { name: 'Khaled Younis', nameAr: 'خالد يونس', zone: 'Maadi', city: 'Cairo', vehicle: 'tricycle', model: 'Dayun Cargo', plate: 'ج ب ر 4457', rating: 4.0, completed: 342, earnings: 3980, x: 53, y: 73 },
  // Pending review
  { name: 'Ali Ramadan', nameAr: 'علي رمضان', zone: 'Nasr City', city: 'Cairo', vehicle: 'motorcycle', model: 'Bajaj Boxer', plate: 'م ق و 7218', status: 'pending_review', rating: 0, completed: 0, earnings: 0, x: 60, y: 36 },
  { name: 'Ibrahim Hamdy', nameAr: 'إبراهيم حمدي', zone: 'Giza', city: 'Giza', vehicle: 'car', model: 'Hyundai Verna', plate: 'د ن س 9925', status: 'pending_review', rating: 0, completed: 0, earnings: 0, x: 26, y: 55 },
  { name: 'Saeed Mansour', nameAr: 'سعيد منصور', zone: 'Shubra', city: 'Cairo', vehicle: 'motorcycle', model: 'Honda CG 125', plate: 'ط ل ص 1633', status: 'pending_review', rating: 0, completed: 0, earnings: 0, x: 43, y: 17 },
  { name: 'Ehab Lotfy', nameAr: 'إيهاب لطفي', zone: '6th of October', city: 'Giza', vehicle: 'tricycle', model: 'Zongshen Cargo', plate: 'ب ص ع 8804', status: 'pending_review', rating: 0, completed: 0, earnings: 0, x: 14, y: 47 },
  // Rejected / suspended
  { name: 'Ragab Shaaban', nameAr: 'رجب شعبان', zone: 'Downtown', city: 'Cairo', vehicle: 'motorcycle', model: 'Halawa 150', plate: 'ن م ط 3391', status: 'rejected', rating: 0, completed: 0, earnings: 0, x: 46, y: 44 },
  { name: 'Gamal Abdo', nameAr: 'جمال عبده', zone: 'Dokki', city: 'Giza', vehicle: 'motorcycle', model: 'Bajaj Pulsar', plate: 'س ك هـ 6519', status: 'suspended', rating: 3.4, completed: 214, earnings: 0, x: 33, y: 48 },
]

export const mockDrivers: Driver[] = seeds.map((s, i) => {
  const status = s.status ?? 'approved'
  const pending = status === 'pending_review'
  return {
    id: `drv-${String(i + 1).padStart(3, '0')}`,
    code: `KSB-D${String(1001 + i)}`,
    name: s.name,
    nameAr: s.nameAr,
    phone: `+20 10${(23456789 + i * 1371).toString().slice(0, 8)}`,
    nationalId: `2960${(1234567890 + i * 97531).toString().slice(0, 10)}`,
    zone: s.zone,
    city: s.city,
    status,
    connection: s.online ? 'online' : 'offline',
    activity: s.delivering ? 'delivering' : 'idle',
    rating: s.rating,
    ratingCount: s.completed > 0 ? Math.round(s.completed * 0.62) : 0,
    vehicle: {
      type: s.vehicle,
      model: s.model,
      plate: s.plate,
      color: ['Red', 'Black', 'White', 'Silver'][i % 4],
      year: 2018 + (i % 6),
    },
    walletNumber: `010${(11223344 + i * 4321).toString().slice(0, 8)}`,
    activeOrders: s.delivering ? 1 : 0,
    completedOrders: s.completed,
    earningsMonth: Math.round(s.earnings * EARNINGS_SCALE),
    balance: pending ? 0 : Math.round(s.earnings * EARNINGS_SCALE * 0.31),
    registeredAt: daysAgo(pending ? 2 + i * 0.5 : 90 + i * 11),
    documents: docs(pending ? 2 : 90 + i * 11, pending ? 'pending' : 'approved'),
    position: { x: s.x, y: s.y, heading: (i * 47) % 360 },
  }
})
