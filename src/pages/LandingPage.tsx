import { Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Bike, Building2, Check, ClipboardList, Languages,
  LayoutDashboard, MapPin, Pill, Radar, Route, Star, UtensilsCrossed, Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAuth } from '../store/auth'
import { KassabMark } from '../components/layout/Logo'
import { Avatar } from '../components/ui/misc'

// Compact live-network visualization: the same map language the product's
// tracking screen uses, rendered as a real component (not a fake screenshot).
function HeroPreview() {
  const { t, locale } = useI18n()
  const drivers = [
    { x: 30, y: 24, h: 40 }, { x: 62, y: 40, h: 160 }, { x: 46, y: 62, h: 250 },
    { x: 74, y: 20, h: 90 }, { x: 22, y: 52, h: 310 },
  ]
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-pop">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-semibold text-ink-700">
          <Radar className="h-3.5 w-3.5 text-brand-600" aria-hidden />
          {t('landing.hero.live')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
          {locale === 'ar' ? 'مباشر' : 'Live'}
        </span>
      </div>
      <div dir="ltr" className="relative aspect-[16/9] bg-[#eef1f5]">
        <svg viewBox="0 0 100 56" className="h-full w-full" role="img" aria-label={t('landing.hero.live')}>
          {[14, 28, 42].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#fff" strokeWidth="1.4" />
          ))}
          {[18, 36, 54, 72, 88].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="56" stroke="#fff" strokeWidth="1.4" />
          ))}
          <path d="M40 0 C 38 14, 44 26, 41 38 C 39 47, 43 52, 41 56" stroke="#bcd7ef" strokeWidth="3" fill="none" opacity="0.8" />
          <path d="M22 46 L46 30 L74 18" stroke="#d6242e" strokeWidth="0.9" strokeDasharray="2 1.2" fill="none" />
          <circle cx="22" cy="46" r="1.8" fill="#059669" stroke="#fff" strokeWidth="0.5" />
          <circle cx="74" cy="18" r="1.8" fill="#d6242e" stroke="#fff" strokeWidth="0.5" />
          {drivers.map((d, i) => (
            <g key={i} transform={`translate(${d.x} ${d.y})`}>
              <circle r="1.9" fill="#394253" stroke="#fff" strokeWidth="0.55">
                <animate attributeName="opacity" values="1;0.55;1" dur="1.9s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <g transform={`rotate(${d.h})`}>
                <path d="M0 -3.2 L1 -1.5 L-1 -1.5 Z" fill="#394253" />
              </g>
            </g>
          ))}
        </svg>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-ink-100 border-t border-ink-100 rtl:divide-x-reverse">
        {[
          { label: 'landing.hero.previewOrders', value: locale === 'ar' ? '٧٤' : '74' },
          { label: 'landing.hero.previewOnline', value: locale === 'ar' ? '١٠' : '10' },
          { label: 'landing.hero.previewEta', value: locale === 'ar' ? '٣٦ د' : '36 min' },
        ].map((s) => (
          <div key={s.label} className="px-4 py-3 text-center">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{t(s.label as TranslationKey)}</dt>
            <dd className="tnum mt-0.5 text-lg font-bold text-ink-950">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function FeatureList({ items, icon }: { items: TranslationKey[]; icon?: ReactNode }) {
  const { t } = useI18n()
  return (
    <ul className="space-y-3">
      {items.map((key) => (
        <li key={key} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden>
            {icon ?? <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
          <span className="text-sm text-ink-700">{t(key)}</span>
        </li>
      ))}
    </ul>
  )
}

export function LandingPage() {
  const { t, dir, toggleLocale } = useI18n()
  const { user } = useAuth()
  const CtaArrow = dir === 'rtl' ? ArrowLeft : ArrowRight

  const brands = ['Koshary El Tahrir', 'El Ezaby Pharmacy', 'TechZone Egypt', 'Fresh Market', 'Shawerma House', 'Misr Logistics Co.']
  const brandsAr = ['كشري التحرير', 'صيدلية العزبي', 'تك زون مصر', 'فريش ماركت', 'بيت الشاورما', 'مصر للوجستيات']
  const { locale } = useI18n()

  return (
    <div className="min-h-[100dvh] bg-white text-ink-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 lg:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <KassabMark size={34} />
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight">{t('brand.name')}</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-600">{t('brand.tagline')}</span>
            </span>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-medium text-ink-600 md:flex">
            <a href="#business" className="transition-colors hover:text-ink-950">{t('landing.nav.business')}</a>
            <a href="#drivers" className="transition-colors hover:text-ink-950">{t('landing.nav.drivers')}</a>
            <a href="#how" className="transition-colors hover:text-ink-950">{t('landing.nav.how')}</a>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100"
            >
              <Languages className="h-4 w-4" aria-hidden />
              {t('header.language')}
            </button>
            <Link
              to={user ? '/dashboard' : '/login'}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 sm:px-4"
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
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
              {t('landing.hero.title1')}
              <br />
              <span className="text-brand-600">{t('landing.hero.title2')}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600">{t('landing.hero.sub')}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:translate-y-px"
              >
                {t('landing.hero.cta')}
                <CtaArrow className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#drivers"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-ink-800 ring-1 ring-inset ring-ink-200 transition-colors hover:bg-ink-50"
              >
                <Bike className="h-4 w-4" aria-hidden />
                {t('landing.hero.ctaDriver')}
              </a>
            </div>
          </div>
          <div className="animate-slide-up">
            <HeroPreview />
          </div>
        </section>

        {/* Brands on the network */}
        <section className="border-y border-ink-100 bg-ink-50/60">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
            <p className="text-center text-xs font-medium text-ink-500">{t('landing.brands')}</p>
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {brands.map((name, i) => (
                <li key={name} className="flex items-center gap-2">
                  <Avatar name={name} size="sm" />
                  <span className="text-sm font-semibold text-ink-700">{locale === 'ar' ? brandsAr[i] : name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Segments */}
        <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6" aria-labelledby="seg-title">
          <h2 id="seg-title" className="text-2xl font-bold tracking-tight md:text-3xl">{t('landing.seg.title')}</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-600">{t('landing.seg.sub')}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-inset ring-emerald-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white" aria-hidden>
                <Pill className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-950">{t('landing.seg.pharmacy')}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t('landing.seg.pharmacyDesc')}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-inset ring-amber-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white" aria-hidden>
                <UtensilsCrossed className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-950">{t('landing.seg.restaurant')}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t('landing.seg.restaurantDesc')}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-6 ring-1 ring-inset ring-sky-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white" aria-hidden>
                <Building2 className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-950">{t('landing.seg.company')}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t('landing.seg.companyDesc')}</p>
            </div>
          </div>
        </section>

        {/* For businesses */}
        <section id="business" className="border-t border-ink-100 bg-ink-50/40 scroll-mt-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('landing.biz.title')}</h2>
              <p className="mt-2 max-w-md text-sm text-ink-600">{t('landing.biz.sub')}</p>
              <div className="mt-6">
                <FeatureList items={['landing.biz.f1', 'landing.biz.f2', 'landing.biz.f3', 'landing.biz.f4', 'landing.biz.f5']} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <ClipboardList className="h-5 w-5" aria-hidden />, k: 'landing.how.s1' },
                { icon: <Route className="h-5 w-5" aria-hidden />, k: 'landing.how.s2' },
                { icon: <Radar className="h-5 w-5" aria-hidden />, k: 'landing.how.s3' },
                { icon: <Wallet className="h-5 w-5" aria-hidden />, k: 'landing.biz.f5' },
              ].map((c) => (
                <div key={c.k} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
                  <span className="text-brand-600">{c.icon}</span>
                  <p className="mt-3 text-sm font-semibold text-ink-900">{t(c.k as TranslationKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For drivers */}
        <section id="drivers" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-6 scroll-mt-16">
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
                {[
                  { label: 'landing.facts.coverage', value: 'landing.facts.coverageV' },
                  { label: 'landing.facts.vehicles', value: 'landing.facts.vehiclesV' },
                  { label: 'landing.facts.langs', value: 'landing.facts.langsV' },
                  { label: 'landing.facts.support', value: 'landing.facts.supportV' },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl bg-white p-3.5 ring-1 ring-inset ring-ink-100">
                    <dt className="text-[11px] font-medium text-ink-400">{t(f.label as TranslationKey)}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-ink-900">{t(f.value as TranslationKey)}</dd>
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
        <section id="how" className="border-t border-ink-100 scroll-mt-16">
          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">{t('landing.how.title')}</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { icon: <ClipboardList className="h-5 w-5" aria-hidden />, title: 'landing.how.s1', desc: 'landing.how.s1d' },
                { icon: <Route className="h-5 w-5" aria-hidden />, title: 'landing.how.s2', desc: 'landing.how.s2d' },
                { icon: <Radar className="h-5 w-5" aria-hidden />, title: 'landing.how.s3', desc: 'landing.how.s3d' },
              ].map((s) => (
                <li key={s.title} className="relative rounded-2xl border border-ink-200 p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 text-white" aria-hidden>
                    {s.icon}
                  </span>
                  <h3 className="mt-4 text-base font-bold">{t(s.title as TranslationKey)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t(s.desc as TranslationKey)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Final CTA: single deliberate brand color block */}
        <section className="bg-brand-700">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center lg:px-6">
            <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-white md:text-3xl">{t('landing.cta.title')}</h2>
            <p className="text-sm text-brand-100">{t('landing.cta.sub')}</p>
            <Link
              to={user ? '/dashboard' : '/login'}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:bg-brand-50 active:translate-y-px"
            >
              {t('landing.hero.cta')}
              <CtaArrow className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:text-start lg:px-6">
          <div className="flex items-center gap-2.5">
            <KassabMark size={28} />
            <div className="leading-tight">
              <p className="text-sm font-bold">{t('landing.footer.rights')}</p>
              <p className="text-xs text-ink-500">{t('brand.slogan')}</p>
            </div>
          </div>
          <p className="text-xs text-ink-400" dir="ltr">{t('landing.footer.credit')}</p>
        </div>
      </footer>
    </div>
  )
}
