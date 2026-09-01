import type { Locale } from '../i18n'

// Display names for zones, cities, and pricing profiles in both locales.
// Kept here (not in i18n dictionaries) because they are data-derived labels,
// mirroring what a real backend would return as localized fields.
const zoneAr: Record<string, string> = {
  'Nasr City': 'مدينة نصر',
  Heliopolis: 'مصر الجديدة',
  Maadi: 'المعادي',
  Downtown: 'وسط البلد',
  Zamalek: 'الزمالك',
  'New Cairo': 'القاهرة الجديدة',
  Dokki: 'الدقي',
  Mohandessin: 'المهندسين',
  '6th of October': '٦ أكتوبر',
  Shubra: 'شبرا',
  Giza: 'الجيزة',
}

const cityAr: Record<string, string> = {
  Cairo: 'القاهرة',
  Giza: 'الجيزة',
}

const profileAr: Record<string, string> = {
  'Restaurant Standard': 'تسعير المطاعم القياسي',
  'Pharmacy Priority': 'أولوية الصيدليات',
  'Corporate Volume': 'حجم الشركات',
}

export const zoneName = (zone: string, locale: Locale): string =>
  locale === 'ar' ? zoneAr[zone] ?? zone : zone

export const cityName = (city: string, locale: Locale): string =>
  locale === 'ar' ? cityAr[city] ?? city : city

export const profileName = (profile: string, locale: Locale): string =>
  locale === 'ar' ? profileAr[profile] ?? profile : profile
