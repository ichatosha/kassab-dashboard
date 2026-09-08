import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlugZap, ShieldAlert } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useToast } from '../../components/ui/Toast'
import { integrationProviders } from '../../mocks/integrations'
import type { IntegrationMethod } from '../../types/domain'

// Connecting is two different conversations. A company with a system picks
// it and supplies credentials; a company without one just switches Kassab
// tracking on and starts creating orders.
export function ConnectIntegrationModal({
  companyId, mode, onClose,
}: {
  companyId: string
  mode: 'system' | 'kassab'
  onClose: () => void
}) {
  const { t, locale } = useI18n()
  const { dispatch } = useAppState()
  const { toast } = useToast()
  const navigate = useNavigate()

  const selectable = integrationProviders.filter((p) => p.kind !== 'kassab')
  const [providerId, setProviderId] = useState(selectable[0].id)
  const provider = integrationProviders.find((p) => p.id === providerId)!
  const [method, setMethod] = useState<IntegrationMethod>(provider.methods[0])
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production')
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const pickProvider = (id: string) => {
    const next = integrationProviders.find((p) => p.id === id)!
    setProviderId(id)
    setMethod(next.methods[0])
    setErrors({})
  }

  const needsUrl = method === 'rest' || method === 'webhook' || method === 'manual'
  const needsKey = method === 'rest' || method === 'manual'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'system') {
      const next: Record<string, string> = {}
      if (needsUrl && !/^https?:\/\/.+/.test(baseUrl.trim())) next.baseUrl = t('int.errUrl')
      if (needsKey && apiKey.trim().length < 8) next.apiKey = t('int.errKey')
      setErrors(next)
      if (Object.keys(next).length > 0) return
    }

    setBusy(true)
    await new Promise((r) => setTimeout(r, 600))
    const id = `int-new-${Date.now().toString(36)}`
    dispatch({
      type: 'connectIntegration',
      id,
      input: mode === 'kassab'
        ? { companyId, providerId: 'kassab-native', method: 'native', environment: 'production' }
        : {
            companyId,
            providerId,
            method,
            environment,
            baseUrl: needsUrl ? baseUrl.trim() : undefined,
            apiKey: needsKey ? apiKey.trim() : undefined,
          },
    })
    setBusy(false)
    toast(mode === 'kassab' ? t('int.kassabEnabled') : t('int.connectedToast'))
    onClose()
    if (mode === 'kassab') navigate('/company/orders')
  }

  if (mode === 'kassab') {
    return (
      <Modal
        open
        onClose={onClose}
        title={t('int.useKassab')}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" form="connect-form" variant="success" disabled={busy}>
              {busy ? t('int.enabling') : t('int.enableTracking')}
            </Button>
          </>
        }
      >
        <form id="connect-form" onSubmit={submit}>
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <PlugZap className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-ink-900">{t('int.kassabModalTitle')}</p>
            <p className="max-w-sm text-sm leading-relaxed text-ink-600">{t('int.kassabModalBody')}</p>
          </div>
          <ol className="mt-4 space-y-2.5">
            {(['int.step1', 'int.step2', 'int.step3'] as TranslationKey[]).map((key, i) => (
              <li key={key} className="flex items-start gap-2.5 text-sm text-ink-700">
                <span aria-hidden className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
                  {i + 1}
                </span>
                {t(key)}
              </li>
            ))}
          </ol>
        </form>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={t('int.connectSystem')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" form="connect-form" disabled={busy}>
            {busy ? t('int.connecting') : t('int.connect')}
          </Button>
        </>
      }
    >
      <form id="connect-form" onSubmit={submit} noValidate className="space-y-4">
        <SelectField label={t('int.system')} value={providerId} onChange={(e) => pickProvider(e.target.value)}>
          {selectable.map((p) => (
            <option key={p.id} value={p.id}>{locale === 'ar' ? p.nameAr : p.name}</option>
          ))}
        </SelectField>

        <p className="rounded-lg bg-ink-50 px-3 py-2 text-xs leading-relaxed text-ink-600">
          {t(provider.descriptionKey as TranslationKey)}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label={t('int.method')} value={method} onChange={(e) => setMethod(e.target.value as IntegrationMethod)}>
            {provider.methods.map((m) => (
              <option key={m} value={m}>{t(`intMethod.${m}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <SelectField
            label={t('int.environment')}
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as 'production' | 'sandbox')}
          >
            <option value="production">{t('intEnv.production')}</option>
            <option value="sandbox">{t('intEnv.sandbox')}</option>
          </SelectField>
        </div>

        {needsUrl && (
          <TextField
            label={t('int.baseUrl')}
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            error={errors.baseUrl}
            placeholder="https://api.your-system.com/v1"
            dir="ltr"
          />
        )}

        {needsKey && (
          <TextField
            label={t('int.apiKey')}
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            error={errors.apiKey}
            hint={t('int.apiKeyHint')}
            dir="ltr"
          />
        )}

        {method === 'oauth' && (
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-700">
            {t('int.oauthNote')}
          </p>
        )}

        {method === 'webhook' && (
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-700">
            {t('int.webhookNote')}
          </p>
        )}

        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {t('int.securityNote')}
        </p>
      </form>
    </Modal>
  )
}
