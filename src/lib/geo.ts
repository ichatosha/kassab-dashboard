import type { Locale } from '../i18n'

// Localized display names for Egyptian governorates/cities and working
// areas. Kept as data-derived labels (not i18n UI keys), mirroring what a
// real backend would return as localized fields.
const cityAr: Record<string, string> = {
  Cairo: 'القاهرة',
  Giza: 'الجيزة',
  Alexandria: 'الإسكندرية',
  Mansoura: 'المنصورة',
  Tanta: 'طنطا',
  Zagazig: 'الزقازيق',
  Damietta: 'دمياط',
  Ismailia: 'الإسماعيلية',
  'Port Said': 'بورسعيد',
}

export const EGYPT_CITIES = Object.keys(cityAr)

export const cityName = (city: string, locale: Locale): string =>
  locale === 'ar' ? cityAr[city] ?? city : city

// Motorcycle brands are proper nouns — identical in both locales, but the
// "Other" option needs translating.
export const brandLabel = (brand: string, locale: Locale): string => {
  const names: Record<string, string> = {
    honda: 'Honda', yamaha: 'Yamaha', bajaj: 'Bajaj', sym: 'SYM', tvs: 'TVS',
    other: locale === 'ar' ? 'أخرى' : 'Other',
  }
  return names[brand] ?? brand
}

// Real centre coordinates for each city Kassab covers. The tracking map
// projects driver positions inside a small box around these points — see
// lib/map.ts. Coordinates are data, not a map-vendor dependency.
export const CITY_CENTRES: Record<string, { lat: number; lng: number }> = {
  Cairo: { lat: 30.0444, lng: 31.2357 },
  Giza: { lat: 30.0131, lng: 31.2089 },
  Alexandria: { lat: 31.2001, lng: 29.9187 },
  Mansoura: { lat: 31.0409, lng: 31.3785 },
  Tanta: { lat: 30.7865, lng: 31.0004 },
  Zagazig: { lat: 30.5877, lng: 31.502 },
  Damietta: { lat: 31.4165, lng: 31.8133 },
  Ismailia: { lat: 30.5965, lng: 32.2715 },
  'Port Said': { lat: 31.2653, lng: 32.3019 },
}

export const cityCentre = (city: string) => CITY_CENTRES[city] ?? CITY_CENTRES.Cairo
