import { useI18n } from '../../i18n'

export function KassabMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <rect width="48" height="48" rx="10" fill="#d6242e" />
      <path d="M14 10h7v13.2L32.4 10h8.2L28.2 24l12.8 14h-8.4L21 25.4V38h-7V10z" fill="#fff" />
      <path d="M33 26.5l7.6 11.5h-8.4l-5.4-8.1z" fill="#f9a825" />
    </svg>
  )
}

export function Logo({ compact }: { compact?: boolean }) {
  const { t } = useI18n()
  return (
    <span className="flex items-center gap-2.5">
      <KassabMark />
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-extrabold tracking-tight text-ink-950">{t('brand.name')}</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">
            {t('brand.tagline')}
          </span>
        </span>
      )}
    </span>
  )
}
