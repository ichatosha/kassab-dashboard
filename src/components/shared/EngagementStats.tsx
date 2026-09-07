import { Bookmark, Eye, Heart, Lock, UserRound } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { formatNumber, formatPercent } from '../../lib/format'
import type { OpportunityEngagement } from '../../types/domain'

const EMPTY: Omit<OpportunityEngagement, 'requestId'> = {
  views: 0, uniqueViewers: 0, likes: 0, saves: 0,
}

/** Counters for one opportunity, or zeroes if it was never published. */
export function useEngagement(requestId: string) {
  const { engagement } = useAppState()
  return engagement.find((e) => e.requestId === requestId) ?? { requestId, ...EMPTY }
}

// Compact strip for opportunity cards and table rows.
export function EngagementInline({ requestId }: { requestId: string }) {
  const { t, locale } = useI18n()
  const stats = useEngagement(requestId)

  const items = [
    { icon: <Eye className="h-3.5 w-3.5" aria-hidden />, value: stats.views, label: t('eng.views') },
    { icon: <Heart className="h-3.5 w-3.5" aria-hidden />, value: stats.likes, label: t('eng.likes') },
    { icon: <Bookmark className="h-3.5 w-3.5" aria-hidden />, value: stats.saves, label: t('eng.saves') },
  ]

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1" title={item.label}>
          {item.icon}
          <span className="sr-only">{item.label}: </span>
          <span className="tnum font-medium text-ink-700">{formatNumber(item.value, locale)}</span>
        </span>
      ))}
    </span>
  )
}

// Full breakdown for the opportunity page: who saw the post, who reacted
// to it, and how much of that traffic turned into real applications.
export function EngagementPanel({ requestId, applicants }: { requestId: string; applicants: number }) {
  const { t, locale } = useI18n()
  const stats = useEngagement(requestId)
  const conversion = stats.uniqueViewers > 0 ? (applicants / stats.uniqueViewers) * 100 : 0

  const tiles = [
    { icon: <Eye className="h-4 w-4" aria-hidden />, label: t('eng.views'), value: stats.views },
    { icon: <UserRound className="h-4 w-4" aria-hidden />, label: t('eng.uniqueViewers'), value: stats.uniqueViewers },
    { icon: <Heart className="h-4 w-4" aria-hidden />, label: t('eng.likes'), value: stats.likes },
    { icon: <Bookmark className="h-4 w-4" aria-hidden />, label: t('eng.saves'), value: stats.saves },
  ]

  return (
    <>
      <dl className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-lg border border-ink-100 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-ink-500">
              <span className="text-ink-400">{tile.icon}</span>
              {tile.label}
            </dt>
            <dd className="tnum mt-1 text-lg font-bold text-ink-950">{formatNumber(tile.value, locale)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-ink-50 px-3 py-2 text-sm">
        <span className="text-ink-600">{t('eng.conversion')}</span>
        <span className="tnum font-semibold text-brand-700">
          {formatPercent(conversion, locale)}
          <span className="ms-1.5 text-xs font-normal text-ink-500">
            ({formatNumber(applicants, locale)} {t('eng.applicants')})
          </span>
        </span>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-400">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        {t('eng.restricted')}
      </p>
    </>
  )
}

// Icon-only reactions, for job cards where there is no room for labels.
export function InterestIconButtons({ requestId }: { requestId: string }) {
  const { t } = useI18n()
  const { likedOpportunities, savedOpportunities, dispatch } = useAppState()
  const liked = likedOpportunities.includes(requestId)
  const saved = savedOpportunities.includes(requestId)

  const base =
    'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        aria-pressed={liked}
        aria-label={liked ? t('eng.liked') : t('eng.like')}
        title={liked ? t('eng.liked') : t('eng.like')}
        onClick={() => dispatch({ type: 'toggleOpportunityLike', requestId })}
        className={`${base} ${
          liked
            ? 'border-brand-200 bg-brand-50 text-brand-700'
            : 'border-ink-200 bg-surface text-ink-400 hover:border-brand-300 hover:text-brand-700'
        }`}
      >
        <Heart className={`h-4 w-4 ${liked ? 'fill-brand-600 text-brand-600' : ''}`} aria-hidden />
      </button>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? t('eng.saved') : t('eng.save')}
        title={saved ? t('eng.saved') : t('eng.save')}
        onClick={() => dispatch({ type: 'toggleOpportunitySave', requestId })}
        className={`${base} ${
          saved
            ? 'border-ink-300 bg-ink-100 text-ink-900'
            : 'border-ink-200 bg-surface text-ink-400 hover:border-ink-400 hover:text-ink-900'
        }`}
      >
        <Bookmark className={`h-4 w-4 ${saved ? 'fill-ink-700 text-ink-700' : ''}`} aria-hidden />
      </button>
    </span>
  )
}

// The visitor-facing reactions. Anyone browsing an opportunity can like or
// save it; only the roles above get to see what those numbers add up to.
export function InterestActions({ requestId }: { requestId: string }) {
  const { t } = useI18n()
  const { likedOpportunities, savedOpportunities, dispatch } = useAppState()
  const liked = likedOpportunities.includes(requestId)
  const saved = savedOpportunities.includes(requestId)

  const base =
    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        aria-pressed={liked}
        onClick={() => dispatch({ type: 'toggleOpportunityLike', requestId })}
        className={`${base} ${
          liked
            ? 'border-brand-200 bg-brand-50 text-brand-700'
            : 'border-ink-200 bg-surface text-ink-600 hover:border-brand-300 hover:text-brand-700'
        }`}
      >
        <Heart className={`h-4 w-4 ${liked ? 'fill-brand-600 text-brand-600' : ''}`} aria-hidden />
        {liked ? t('eng.liked') : t('eng.like')}
      </button>
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => dispatch({ type: 'toggleOpportunitySave', requestId })}
        className={`${base} ${
          saved
            ? 'border-ink-300 bg-ink-100 text-ink-900'
            : 'border-ink-200 bg-surface text-ink-600 hover:border-ink-400 hover:text-ink-900'
        }`}
      >
        <Bookmark className={`h-4 w-4 ${saved ? 'fill-ink-700 text-ink-700' : ''}`} aria-hidden />
        {saved ? t('eng.saved') : t('eng.save')}
      </button>
    </span>
  )
}
