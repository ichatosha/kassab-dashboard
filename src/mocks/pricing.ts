import type { AdditionalCharge, CommissionRule, VehiclePricing, ZonePricing } from '../types/domain'

export const mockZonePricing: ZonePricing[] = [
  { id: 'zn-01', zone: 'Nasr City', zoneAr: 'مدينة نصر', basePrice: 20, pricePerKm: 2.5, active: true },
  { id: 'zn-02', zone: 'Heliopolis', zoneAr: 'مصر الجديدة', basePrice: 20, pricePerKm: 2.5, active: true },
  { id: 'zn-03', zone: 'Maadi', zoneAr: 'المعادي', basePrice: 22, pricePerKm: 2.75, active: true },
  { id: 'zn-04', zone: 'Downtown', zoneAr: 'وسط البلد', basePrice: 18, pricePerKm: 2.25, active: true },
  { id: 'zn-05', zone: 'Zamalek', zoneAr: 'الزمالك', basePrice: 22, pricePerKm: 2.5, active: true },
  { id: 'zn-06', zone: 'New Cairo', zoneAr: 'القاهرة الجديدة', basePrice: 28, pricePerKm: 3.0, active: true },
  { id: 'zn-07', zone: 'Dokki', zoneAr: 'الدقي', basePrice: 20, pricePerKm: 2.5, active: true },
  { id: 'zn-08', zone: 'Mohandessin', zoneAr: 'المهندسين', basePrice: 20, pricePerKm: 2.5, active: true },
  { id: 'zn-09', zone: '6th of October', zoneAr: '٦ أكتوبر', basePrice: 30, pricePerKm: 3.25, active: true },
  { id: 'zn-10', zone: 'Shubra', zoneAr: 'شبرا', basePrice: 18, pricePerKm: 2.25, active: false },
]

export const mockVehiclePricing: VehiclePricing[] = [
  { id: 'vp-01', type: 'motorcycle', basePrice: 18, perKm: 2.0, maxWeightKg: 15 },
  { id: 'vp-02', type: 'tricycle', basePrice: 25, perKm: 2.75, maxWeightKg: 120 },
  { id: 'vp-03', type: 'car', basePrice: 35, perKm: 3.5, maxWeightKg: 250 },
]

export const mockAdditionalCharges: AdditionalCharge[] = [
  { id: 'ch-01', nameKey: 'pricing.charge.night', amount: 10, kind: 'fixed', active: true },
  { id: 'ch-02', nameKey: 'pricing.charge.express', amount: 15, kind: 'fixed', active: true },
  { id: 'ch-03', nameKey: 'pricing.charge.fragile', amount: 8, kind: 'fixed', active: true },
  { id: 'ch-04', nameKey: 'pricing.charge.wait', amount: 5, kind: 'fixed', active: false },
  { id: 'ch-05', nameKey: 'pricing.charge.extra_package', amount: 20, kind: 'percent', active: true },
]

export const mockCommissionRules: CommissionRule[] = [
  { id: 'cr-01', appliesTo: 'default', kassabPercent: 25, driverPercent: 75 },
  { id: 'cr-02', appliesTo: 'restaurant', kassabPercent: 25, driverPercent: 75 },
  { id: 'cr-03', appliesTo: 'pharmacy', kassabPercent: 22, driverPercent: 78 },
  { id: 'cr-04', appliesTo: 'ecommerce', kassabPercent: 28, driverPercent: 72 },
  { id: 'cr-05', appliesTo: 'company', kassabPercent: 20, driverPercent: 80 },
]
