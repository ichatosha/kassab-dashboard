import { Moon, Sun } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useTheme } from '../../store/theme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? t('theme.toLight') : t('theme.toDark')}
      title={dark ? t('theme.toLight') : t('theme.toDark')}
      className={`cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 ${className}`}
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  )
}
