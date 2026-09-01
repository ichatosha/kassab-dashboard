import { useMemo, useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SelectField } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/misc'
import { formatRelative } from '../lib/format'
import type { NotificationKind } from '../types/domain'

const KINDS: NotificationKind[] = [
  'new_order', 'order_accepted', 'order_cancelled', 'order_picked_up', 'order_delivered',
  'bonus', 'earnings', 'admin_message', 'driver_approval', 'company_approval',
]

export function NotificationsPage() {
  const { t, locale } = useI18n()
  const { notifications, dispatch } = useAppState()
  const [kind, setKind] = useState('all')
  const [readFilter, setReadFilter] = useState('all')

  const filtered = useMemo(
    () =>
      notifications.filter((n) => {
        if (kind !== 'all' && n.kind !== kind) return false
        if (readFilter === 'unread' && n.read) return false
        if (readFilter === 'read' && !n.read) return false
        return true
      }),
    [notifications, kind, readFilter],
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('notif.title')}
        subtitle={t('notif.subtitle')}
        actions={
          unreadCount > 0 ? (
            <Button variant="secondary" size="sm" icon={<CheckCheck className="h-4 w-4" aria-hidden />} onClick={() => dispatch({ type: 'markAllNotificationsRead' })}>
              {t('header.markAllRead')}
            </Button>
          ) : undefined
        }
      />
      <Card padded={false}>
        <div className="flex flex-wrap items-end gap-2 border-b border-ink-100 p-4">
          <SelectField label={t('companies.type')} value={kind} onChange={(e) => setKind(e.target.value)} className="w-full sm:w-52">
            <option value="all">{t('common.all')}</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>{t(`notif.kind.${k}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField label={t('common.status')} value={readFilter} onChange={(e) => setReadFilter(e.target.value)} className="w-full sm:w-40">
            <option value="all">{t('common.all')}</option>
            <option value="unread">{t('notif.unread')}</option>
            <option value="read">{t('notif.read')}</option>
          </SelectField>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title={t('notif.empty')} icon={<BellOff className="h-6 w-6" />} />
        ) : (
          <ul className="divide-y divide-ink-100">
            {filtered.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 px-4 py-3.5 ${n.read ? '' : 'bg-brand-50/30'}`}>
                <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-ink-200' : 'bg-brand-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={n.read ? 'neutral' : 'brand'}>{t(n.titleKey as TranslationKey)}</Badge>
                    <span className="text-xs text-ink-400">{formatRelative(n.at, locale)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-700">{locale === 'ar' ? n.bodyAr : n.body}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'markNotificationRead', id: n.id })}>
                    {t('notif.markRead')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
