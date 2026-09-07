import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Heart } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useDriverScope } from '../../hooks/usePortalScope'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader, Tabs } from '../../components/ui/misc'
import { formatNumber } from '../../lib/format'
import { JobCard } from './JobCard'

// The jobs a driver kept for later: saved to come back to, or liked. Both
// lists come from the same interest state the counters are built on.
export function DriverSavedJobsPage() {
  const { t, locale } = useI18n()
  const { savedOpportunities, likedOpportunities } = useAppState()
  const { requests, appliedRequestIds } = useDriverScope()
  const [tab, setTab] = useState<'saved' | 'liked'>('saved')

  const byId = (ids: string[]) =>
    ids.map((id) => requests.find((r) => r.id === id)).filter((r) => r !== undefined)

  const saved = byId(savedOpportunities)
  const liked = byId(likedOpportunities)
  const shown = tab === 'saved' ? saved : liked

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('driver.savedTitle')} subtitle={t('driver.savedSub')} />

      <div className="mb-4">
        <Tabs
          active={tab}
          onChange={(id) => setTab(id as 'saved' | 'liked')}
          tabs={[
            { id: 'saved', label: `${t('eng.saved')} (${formatNumber(saved.length, locale)})` },
            { id: 'liked', label: `${t('eng.liked')} (${formatNumber(liked.length, locale)})` },
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <Card>
          <EmptyState
            title={tab === 'saved' ? t('driver.noSaved') : t('driver.noLiked')}
            hint={tab === 'saved' ? t('driver.noSavedHint') : t('driver.noLikedHint')}
            icon={tab === 'saved' ? <Bookmark className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
            action={<Link to="/delivery/jobs"><Button size="sm">{t('driver.findJobs')}</Button></Link>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((r) => (
            <JobCard key={r.id} request={r} applied={appliedRequestIds.has(r.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
