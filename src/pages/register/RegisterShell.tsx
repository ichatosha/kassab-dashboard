import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Languages } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { KassabMark } from '../../components/layout/Logo'
import { BrandCredit } from '../../components/shared/BrandCredit'
import { ThemeToggle } from '../../components/shared/ThemeToggle'

// The frame both sign-up flows share: brand, language, theme, and a way
// back to the marketing page.
export function RegisterShell({
  title, subtitle, aside, children,
}: {
  title: string
  subtitle: string
  aside?: ReactNode
  children: ReactNode
}) {
  const { t, dir, toggleLocale } = useI18n()
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  return (
    <div className="min-h-[100dvh] bg-canvas">
      <header className="border-b border-ink-200 bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <KassabMark size={32} />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-tight text-ink-950">{t('brand.name')}</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-600">{t('brand.tagline')}</span>
            </span>
          </Link>
          <div className="ms-auto flex items-center gap-1">
            <button
              onClick={toggleLocale}
              aria-label={t('header.language')}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg p-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 sm:px-2.5"
            >
              <Languages className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden />
              <span className="hidden sm:inline">{t('header.language')}</span>
            </button>
            <ThemeToggle />
            <Link
              to="/login"
              className="ms-1 inline-flex h-9 items-center rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              {t('landing.nav.signIn')}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
        >
          <BackIcon className="h-4 w-4" aria-hidden />
          {t('register.backHome')}
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-950">{title}</h1>
            <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          {aside && <div className="space-y-4 lg:pt-16">{aside}</div>}
        </div>

        <BrandCredit className="mt-10 text-center text-[11px] text-ink-400" />
      </main>
    </div>
  )
}
