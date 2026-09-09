import type { Locale } from '../i18n'

const localeTag = (locale: Locale) => (locale === 'ar' ? 'ar-EG' : 'en-EG')

export function formatMoney(amount: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount)
  return locale === 'ar' ? `${formatted} ج.م` : `EGP ${formatted}`
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag(locale)).format(value)
}

export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag(locale), { maximumFractionDigits: 1 }).format(value) + '%'
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

// "2026-08" → "Aug 2026" / "أغسطس ٢٠٢٦"
export function formatPeriod(period: string, locale: Locale): string {
  const [year, month] = period.split('-').map(Number)
  return new Intl.DateTimeFormat(localeTag(locale), { month: 'short', year: 'numeric' })
    .format(new Date(year, (month ?? 1) - 1, 1))
}

export function formatRelative(iso: string, locale: Locale): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  const rtf = new Intl.RelativeTimeFormat(localeTag(locale), { numeric: 'auto' })
  if (Math.abs(mins) < 60) return rtf.format(-mins, 'minute')
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour')
  return rtf.format(-Math.round(hours / 24), 'day')
}
