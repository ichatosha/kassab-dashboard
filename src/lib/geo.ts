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
