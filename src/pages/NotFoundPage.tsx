import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useI18n } from '../i18n'
import { EmptyState } from '../components/ui/EmptyState'

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <EmptyState
      title={t('notFound.title')}
      hint={t('notFound.body')}
      icon={<Compass className="h-6 w-6" />}
      action={
        <Link to="/admin/dashboard" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          {t('notFound.back')}
        </Link>
      }
    />
  )
}
