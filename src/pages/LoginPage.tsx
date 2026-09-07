import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Languages, LockKeyhole } from 'lucide-react'
import { useAuth, DEMO_EMAIL, DEMO_PASSWORD } from '../store/auth'
import { useI18n } from '../i18n'
import { TextField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { KassabMark } from '../components/layout/Logo'
import { BrandCredit } from '../components/shared/BrandCredit'
import { ThemeToggle } from '../components/shared/ThemeToggle'

export function LoginPage() {
  const { user, signIn } = useAuth()
  const { t, toggleLocale } = useI18n()
  const navigate = useNavigate()
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const ok = await signIn(email, password)
    setBusy(false)
    if (ok) navigate('/dashboard')
    else setError(t('auth.error'))
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-night-950 p-10 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative flex items-center gap-3">
          <KassabMark size={40} />
          <div>
            <p className="text-lg font-extrabold tracking-tight text-white">{t('brand.name')}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-400">{t('brand.tagline')}</p>
          </div>
        </div>
        <div className="relative max-w-md">
          <p className="text-3xl font-bold leading-snug text-white">{t('brand.slogan')}</p>
          <p className="mt-3 text-sm leading-relaxed text-night-300">{t('auth.subtitle')}</p>
        </div>
        <BrandCredit className="relative text-xs text-night-400" prefix="Kassab Logistics Services · " />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-ink-50 px-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5 lg:hidden">
              <KassabMark />
              <span className="text-base font-extrabold text-ink-950">{t('brand.name')}</span>
            </div>
            <span className="ms-auto flex items-center gap-1">
              <button
                onClick={toggleLocale}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100"
              >
                <Languages className="h-4 w-4" aria-hidden />
                {t('header.language')}
              </button>
              <ThemeToggle />
            </span>
          </div>
          <h1 className="text-xl font-bold text-ink-950">{t('auth.title')}</h1>
          <p className="mt-1 text-sm text-ink-500">{t('auth.subtitle')}</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <TextField
              label={t('auth.email')}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
            <TextField
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error || undefined}
              required
              dir="ltr"
            />
            <Button type="submit" disabled={busy} className="w-full" icon={<LockKeyhole className="h-4 w-4" aria-hidden />}>
              {busy ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </form>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{t('auth.demoHint')}</p>
            <p className="mt-1 text-xs text-amber-700">{t('auth.demoNote')}</p>
            <dl className="mt-2 space-y-1 text-xs text-amber-700" dir="ltr">
              <div className="flex justify-between gap-4">
                <dt className="font-medium">Email</dt>
                <dd className="font-mono">{DEMO_EMAIL}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-medium">Password</dt>
                <dd className="font-mono">{DEMO_PASSWORD}</dd>
              </div>
            </dl>
          </div>
          <BrandCredit className="mt-6 text-center text-[11px] text-ink-400 lg:hidden" />
        </div>
      </div>
    </div>
  )
}
