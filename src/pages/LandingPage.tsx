import { Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Bike, Briefcase, Building2, Check, ClipboardList,
  Languages, LayoutDashboard, MapPin, Star, UserCheck, Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAuth } from '../store/auth'
import { KassabMark } from '../components/layout/Logo'
import { BrandCredit } from '../components/shared/BrandCredit'
import { ThemeToggle } from '../components/shared/ThemeToggle'
import { Avatar } from '../components/ui/misc'
import { mockCompanies, mockWorkforceRequests } from '../mocks/companies'
import { mockDrivers } from '../mocks/drivers'
import { formatMoney, formatNumber } from '../lib/format'
import { cityName, EGYPT_CITIES } from '../lib/geo'
import { OPEN_REQUEST_STATUSES } from '../lib/status'

// A live snapshot of a real opportunity, built from the same data the
// product runs on rather than a mocked-up screenshot.
function OpportunityPreview() {
  const { t, locale } = useI18n()
  const request = mockWorkforceRequests.find((r) => OPEN_REQUEST_STATUSES.includes(r.status))
  const company = mockCompanies.find((c) => c.id === request?.companyId)
  if (!request || !company) return null
  const remaining = Math.max(0, request.driversRequired - request.driversHired)
  const filledPct = (request.driversHired / request.driversRequired) * 100

  return (
    <div className="rounded-2xl border border-ink-200 bg-surface p-5 shadow-pop">
      <div className="flex items-start gap-3">
        <Avatar name={company.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink-950">
            {locale === 'ar' ? company.nameAr : company.name}
          </p>
          <p className="text-xs text-ink-500">{cityName(company.city, locale)}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
          {t('reqStatus.open')}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-ink-900">
        {locale === 'ar' ? request.positionAr : request.position}
      </p>
      <p className="tnum mt-1 text-2xl font-bold text-brand-700">
        {formatMoney(request.salary, locale)}
        <span className="ms-1.5 text-xs font-medium text-ink-500">{t('common.perMonth')}</span>
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-500">{t('opp.progress')}</span>
          <span className="tnum font-semibold text-ink-800">
            {formatNumber(request.driversHired, locale)} / {formatNumber(request.driversRequired, locale)}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${filledPct}%` }} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 divide-x divide-ink-100 rounded-xl bg-ink-50 py-3 rtl:divide-x-reverse">
        {[
          { label: t('opp.remaining'), value: formatNumber(remaining, locale) },
          { label: t('wfr.employmentType'), value: t(`emp.${request.employmentType}` as TranslationKey) },
          { label: t('common.city'), value: cityName(request.city, locale) },
        ].map((s) => (
          <div key={s.label} className="px-2 text-center">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{s.label}</dt>
            <dd className="tnum mt-0.5 text-xs font-bold text-ink-900">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function FeatureList({ items }: { items: TranslationKey[] }) {
  const { t } = useI18n()
  return (
    <ul className="space-y-3">
      {items.map((key) => (
        <li key={key} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden>
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="text-sm text-ink-700">{t(key)}</span>
        </li>
      ))}
    </ul>
  )
}

export function LandingPage() {
  const { t, locale, dir, toggleLocale } = useI18n()
  const { user } = useAuth()
  const CtaArrow = dir === 'rtl' ? ArrowLeft : ArrowRight

  const verifiedDrivers = mockDrivers.filter((d) => d.status !== 'under_review').length
  const openPositions = mockWorkforceRequests
    .filter((r) => OPEN_REQUEST_STATUSES.includes(r.status))
    .reduce((s, r) => s + Math.max(0, r.driversRequired - r.driversHired), 0)
  const brands = mockCompanies.filter((c) => c.status === 'active').slice(0, 6)

  return (
    <div className="min-h-[100dvh] bg-surface text-ink-950">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 lg:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <KassabMark size={34} />
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight">{t('brand.name')}</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-600">{t('brand.tagline')}</span>
            </span>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-medium text-ink-600 md:flex">
            <a href="#companies" className="transition-colors hover:text-ink-950">{t('landing.nav.companies')}</a>
            <a href="#drivers" className="transition-colors hover:text-ink-950">{t('landing.nav.drivers')}</a>
            <a href="#how" className="transition-colors hover:text-ink-950">{t('landing.nav.how')}</a>
          </nav>
          <div className="ms-auto flex items-center gap-1 sm:gap-2">
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
              to={user ? '/dashboard' : '/login'}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800 sm:px-4"
            >
              <LayoutDashboard className="hidden h-4 w-4 sm:block" aria-hidden />
              {user ? t('landing.hero.cta') : t('landing.nav.signIn')}
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:px-6 lg:pt-20">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
              <MapPin className="h-3 w-3" aria-hidden />
              {t('landing.hero.pill')}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              {t('landing.hero.title1')}
              <br />
              <span className="text-brand-600">{t('landing.hero.title2')}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600">{t('landing.hero.sub')}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 active:translate-y-px"
              >
                {t('landing.hero.cta')}
                <CtaArrow className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#drivers"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-surface px-6 text-sm font-semibold text-ink-800 ring-1 ring-inset ring-ink-200 transition-colors hover:bg-ink-50"
              >
                <Bike className="h-4 w-4" aria-hidden />
                {t('landing.hero.ctaDriver')}
              </a>
            </div>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {[
                { label: t('landing.hero.statDrivers'), value: formatNumber(verifiedDrivers, locale) },
                { label: t('landing.hero.statOpen'), value: formatNumber(openPositions, locale) },
                { label: t('landing.hero.statCities'), value: formatNumber(EGYPT_CITIES.length, locale) },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-[11px] font-medium text-ink-400">{s.label}</dt>
                  <dd className="tnum mt-0.5 text-xl font-bold text-ink-950">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-slide-up">
            <OpportunityPreview />
          </div>
        </section>

        {/* Companies on the network */}
        <section className="border-y border-ink-100 bg-ink-50/60">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
            <p className="text-center text-xs font-medium text-ink-500">{t('landing.brands')}</p>
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {brands.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <Avatar name={c.name} size="sm" />
                  <span className="text-sm font-semibold text-ink-700">{locale === 'ar' ? c.nameAr : c.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The three-part promise */}
        <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6" aria-labelledby="seg-title">
          <h2 id="seg-title" className="text-2xl font-bold tracking-tight md:text-3xl">{t('landing.seg.title')}</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-600">{t('landing.seg.sub')}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-sky-50 p-6 ring-1 ring-inset ring-sky-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-800 text-white" aria-hidden>
                <ClipboardList className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-950">{t('landing.seg.request')}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t('landing.seg.requestDesc')}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-inset ring-emerald-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white" aria-hidden>
                <UserCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-950">{t('landing.seg.review')}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t('landing.seg.reviewDesc')}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-inset ring-amber-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white" aria-hidden>
                <Wallet className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-950">{t('landing.seg.settle')}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t('landing.seg.settleDesc')}</p>
            </div>
          </div>
        </section>

        {/* For companies */}
        <section id="companies" className="scroll-mt-16 border-t border-ink-100 bg-ink-50/40">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('landing.biz.title')}</h2>
              <p className="mt-2 max-w-md text-sm text-ink-600">{t('landing.biz.sub')}</p>
              <div className="mt-6">
                <FeatureList items={['landing.biz.f1', 'landing.biz.f2', 'landing.biz.f3', 'landing.biz.f4', 'landing.biz.f5']} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { icon: <ClipboardList className="h-5 w-5" aria-hidden />, k: 'nav.requests' },
                { icon: <Briefcase className="h-5 w-5" aria-hidden />, k: 'nav.pipeline' },
                { icon: <Building2 className="h-5 w-5" aria-hidden />, k: 'nav.salaries' },
                { icon: <Wallet className="h-5 w-5" aria-hidden />, k: 'nav.invoices' },
              ] as { icon: ReactNode; k: TranslationKey }[]).map((c) => (
                <div key={c.k} className="rounded-2xl border border-ink-200 bg-surface p-5 shadow-card">
                  <span className="text-brand-600">{c.icon}</span>
                  <p className="mt-3 text-sm font-semibold text-ink-900">{t(c.k)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For drivers */}
        <section id="drivers" className="mx-auto grid max-w-6xl scroll-mt-16 items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-6">
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl bg-brand-50 p-6 ring-1 ring-inset ring-brand-100">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white" aria-hidden>
                  <Bike className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-950">{t('brand.slogan')}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-500">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                    {t('landing.drv.f5')}
                  </p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                {([
                  { label: 'landing.facts.coverage', value: 'landing.facts.coverageV' },
                  { label: 'landing.facts.fleet', value: 'landing.facts.fleetV' },
                  { label: 'landing.facts.langs', value: 'landing.facts.langsV' },
                  { label: 'landing.facts.support', value: 'landing.facts.supportV' },
                ] as { label: TranslationKey; value: TranslationKey }[]).map((f) => (
                  <div key={f.label} className="rounded-xl bg-surface p-3.5 ring-1 ring-inset ring-ink-100">
                    <dt className="text-[11px] font-medium text-ink-400">{t(f.label)}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-ink-900">{t(f.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('landing.drv.title')}</h2>
            <p className="mt-2 max-w-md text-sm text-ink-600">{t('landing.drv.sub')}</p>
            <div className="mt-6">
              <FeatureList items={['landing.drv.f1', 'landing.drv.f2', 'landing.drv.f3', 'landing.drv.f4', 'landing.drv.f5']} />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 border-t border-ink-100">
          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">{t('landing.how.title')}</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {([
                { icon: <ClipboardList className="h-5 w-5" aria-hidden />, title: 'landing.how.s1', desc: 'landing.how.s1d' },
                { icon: <UserCheck className="h-5 w-5" aria-hidden />, title: 'landing.how.s2', desc: 'landing.how.s2d' },
                { icon: <Wallet className="h-5 w-5" aria-hidden />, title: 'landing.how.s3', desc: 'landing.how.s3d' },
              ] as { icon: ReactNode; title: TranslationKey; desc: TranslationKey }[]).map((s) => (
                <li key={s.title} className="rounded-2xl border border-ink-200 p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-night-950 text-white" aria-hidden>
                    {s.icon}
                  </span>
                  <h3 className="mt-4 text-base font-bold">{t(s.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t(s.desc)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-brandfx-700">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center lg:px-6">
            <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-white md:text-3xl">{t('landing.cta.title')}</h2>
            <p className="text-sm text-brandfx-100">{t('landing.cta.sub')}</p>
            <Link
              to={user ? '/dashboard' : '/login'}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-surface px-6 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:bg-brand-50 active:translate-y-px"
            >
              {t('landing.hero.cta')}
              <CtaArrow className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-100 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:text-start lg:px-6">
          <div className="flex items-center gap-2.5">
            <KassabMark size={28} />
            <div className="leading-tight">
              <p className="text-sm font-bold">{t('landing.footer.rights')}</p>
              <p className="text-xs text-ink-500">{t('brand.descriptor')}</p>
            </div>
          </div>
          <BrandCredit className="text-xs text-ink-400" />
        </div>
      </footer>
    </div>
  )
}
