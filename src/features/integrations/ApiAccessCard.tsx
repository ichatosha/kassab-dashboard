import { useState } from 'react'
import { Check, Copy, KeyRound, RefreshCw, ShieldAlert, Webhook } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useToast } from '../../components/ui/Toast'
import { formatDate, formatRelative } from '../../lib/format'

// ── API access ────────────────────────────────────────────────────────
// The other half of connecting a system: credentials Kassab issues so the
// company's own software can call in. Shown in full once, masked after —
// the same contract every serious API uses.

const EVENTS = [
  'order.created', 'order.assigned', 'order.picked_up',
  'order.delivered', 'order.cancelled', 'driver.changed',
]

function newToken() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `ksb_live_${hex}`
}

const mask = (token: string) => `${token.slice(0, 12)}${'•'.repeat(12)}${token.slice(-4)}`

export function ApiAccessCard({ companyId, readOnly = false }: { companyId: string; readOnly?: boolean }) {
  const { t, locale } = useI18n()
  const { apiCredentials, dispatch } = useAppState()
  const { toast } = useToast()

  const credential = apiCredentials.find((c) => c.companyId === companyId)
  // A freshly issued key is the only time the full value is on screen
  const [revealed, setRevealed] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const webhookUrl = `https://api.kassab.eg/v1/companies/${companyId}/orders`

  const copy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(field)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      toast(t('api.copyFailed'), 'info')
    }
  }

  const issue = () => {
    const token = newToken()
    dispatch({ type: 'issueApiKey', companyId, token })
    setRevealed(token)
    toast(t('api.issued'))
  }

  return (
    <Card title={t('api.title')}>
      <p className="mb-4 text-sm leading-relaxed text-ink-600">{t('api.body')}</p>

      {!credential ? (
        <EmptyState
          title={t('api.noKey')}
          hint={t('api.noKeyHint')}
          icon={<KeyRound className="h-6 w-6" />}
          action={<Button size="sm" disabled={readOnly} onClick={issue}>{t('api.generate')}</Button>}
        />
      ) : (
        <>
          {revealed && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
              {t('api.copyNow')}
            </p>
          )}

          <div className="rounded-lg border border-ink-100 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-500">{t('api.key')}</span>
              <Button
                size="sm"
                variant="ghost"
                icon={copied === 'key'
                  ? <Check className="h-3.5 w-3.5" aria-hidden />
                  : <Copy className="h-3.5 w-3.5" aria-hidden />}
                onClick={() => copy(revealed ?? credential.token, 'key')}
              >
                {copied === 'key' ? t('api.copied') : t('api.copy')}
              </Button>
            </div>
            <p className="mt-1 break-all font-mono text-xs text-ink-900" dir="ltr">
              {revealed ?? mask(credential.token)}
            </p>
            <p className="mt-2 text-[11px] text-ink-400">
              {t('api.createdOn')} {formatDate(credential.createdAt, locale)}
              {credential.lastUsedAt && ` · ${t('api.lastUsed')} ${formatRelative(credential.lastUsedAt, locale)}`}
            </p>
          </div>

          <div className="mt-3 rounded-lg border border-ink-100 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                <Webhook className="h-3.5 w-3.5" aria-hidden />
                {t('api.endpoint')}
              </span>
              <Button
                size="sm"
                variant="ghost"
                icon={copied === 'url'
                  ? <Check className="h-3.5 w-3.5" aria-hidden />
                  : <Copy className="h-3.5 w-3.5" aria-hidden />}
                onClick={() => copy(webhookUrl, 'url')}
              >
                {copied === 'url' ? t('api.copied') : t('api.copy')}
              </Button>
            </div>
            <p className="mt-1 break-all font-mono text-xs text-ink-900" dir="ltr">{webhookUrl}</p>
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-ink-500">{t('api.sample')}</p>
            <pre
              className="overflow-x-auto scroll-thin rounded-lg bg-night-950 p-3 text-[11px] leading-relaxed text-night-100"
              dir="ltr"
            >
{`curl -X POST ${webhookUrl} \\
  -H "Authorization: Bearer ${revealed ? revealed : 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "reference": "ORD-10921",
    "customer": { "name": "Mona Fathy", "phone": "+201008842231" },
    "dropoff": { "label": "Nasr City, Block 12", "lat": 30.0566, "lng": 31.3300 },
    "amount": 210,
    "driver_external_id": "EMP-8900"
  }'`}
            </pre>
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-ink-500">{t('api.events')}</p>
            <div className="flex flex-wrap gap-1.5">
              {EVENTS.map((event) => (
                <span key={event} className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-[10px] text-ink-700">
                  {event}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-700">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('api.secretWarning')}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={readOnly}
              icon={<RefreshCw className="h-3.5 w-3.5" aria-hidden />}
              onClick={issue}
            >
              {t('api.rotate')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={readOnly}
              onClick={() => {
                dispatch({ type: 'revokeApiKey', companyId })
                setRevealed(null)
                toast(t('api.revoked'), 'info')
              }}
            >
              {t('api.revoke')}
            </Button>
          </div>
        </>
      )}

      <ul className="mt-4 space-y-1.5 border-t border-ink-100 pt-3">
        {(['api.step1', 'api.step2', 'api.step3'] as TranslationKey[]).map((key, i) => (
          <li key={key} className="flex items-start gap-2 text-xs text-ink-600">
            <span aria-hidden className="tnum mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold text-ink-600">
              {i + 1}
            </span>
            {t(key)}
          </li>
        ))}
      </ul>
    </Card>
  )
}
