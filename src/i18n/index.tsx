import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { en } from './en'
import type { TranslationKey } from './en'
import { ar } from './ar'

export type Locale = 'en' | 'ar'

interface I18nContextValue {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: (key: TranslationKey) => string
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, ar }

const STORAGE_KEY = 'kassab.locale'

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'ar' ? 'ar' : 'en'
  } catch {
    return 'en'
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // storage unavailable — locale simply won't persist
    }
  }, [locale, dir])

  const t = useCallback(
    (key: TranslationKey) => dictionaries[locale][key] ?? en[key] ?? key,
    [locale],
  )

  const setLocale = useCallback((next: Locale) => setLocaleState(next), [])
  const toggleLocale = useCallback(
    () => setLocaleState((prev) => (prev === 'en' ? 'ar' : 'en')),
    [],
  )

  const value = useMemo(
    () => ({ locale, dir, t, setLocale, toggleLocale }),
    [locale, dir, t, setLocale, toggleLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export type { TranslationKey }
