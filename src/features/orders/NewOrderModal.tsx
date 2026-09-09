import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { useI18n } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useCompanyScope } from '../../hooks/usePortalScope'
import { useToast } from '../../components/ui/Toast'

// A delivery, created by the company itself. Assigning a driver here is
// optional: an unassigned order waits on the desk until someone takes it.
export function NewOrderModal({
  companyId, city, onClose,
}: {
  companyId: string
  city: string
  onClose: () => void
}) {
  const { t, locale } = useI18n()
  const { liveStates, dispatch } = useAppState()
  const { drivers } = useCompanyScope()
  const { toast } = useToast()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [dropoffLabel, setDropoffLabel] = useState('')
  const [amount, setAmount] = useState('150')
  const [driverId, setDriverId] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  // On shift and not already running a delivery. An off-shift driver
  // cannot be handed work: they would never see it, and they are not on
  // the map for anyone to follow.
  const freeDrivers = drivers.filter((d) => {
    const live = liveStates.find((l) => l.driverId === d.id)
    return Boolean(live) && live!.status === 'available'
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!customerName.trim()) next.customerName = t('form.required')
    if (!/^[+0-9\s]{9,}$/.test(customerPhone.trim())) next.customerPhone = t('form.phoneInvalid')
    if (!dropoffLabel.trim()) next.dropoffLabel = t('form.required')
    if (Number(amount) <= 0) next.amount = t('orders.errAmount')
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setBusy(true)
    await new Promise((r) => setTimeout(r, 400))
    dispatch({
      type: 'createOrder',
      id: `ord-new-${Date.now().toString(36)}`,
      input: {
        companyId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        dropoffLabel: dropoffLabel.trim(),
        city,
        amount: Number(amount),
        driverId: driverId || undefined,
        note: note.trim() || undefined,
      },
    })
    setBusy(false)
    toast(driverId ? t('orders.createdAssigned') : t('orders.created'))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={t('orders.new')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" form="order-form" disabled={busy}>
            {busy ? t('register.creating') : t('orders.create')}
          </Button>
        </>
      }
    >
      <form id="order-form" onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label={t('orders.customer')}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            error={errors.customerName}
            required
          />
          <TextField
            label={t('common.phone')}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            error={errors.customerPhone}
            placeholder="+20 1XXXXXXXXX"
            dir="ltr"
            required
          />
          <TextField
            label={t('orders.dropoffAddress')}
            value={dropoffLabel}
            onChange={(e) => setDropoffLabel(e.target.value)}
            error={errors.dropoffLabel}
            placeholder={t('orders.dropoffPlaceholder')}
            className="sm:col-span-2"
            required
          />
          <TextField
            label={t('orders.amount')}
            type="number"
            min={0}
            step={10}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            hint={t('orders.amountHint')}
          />
          <SelectField
            label={t('orders.assignTo')}
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            hint={freeDrivers.length === 0 ? t('orders.noFreeDrivers') : t('orders.assignHint')}
          >
            <option value="">{t('orders.leaveUnassigned')}</option>
            {freeDrivers.map((d) => (
              <option key={d.id} value={d.id}>{locale === 'ar' ? d.nameAr : d.name}</option>
            ))}
          </SelectField>
          <TextField
            label={t('orders.note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('orders.notePlaceholder')}
            className="sm:col-span-2"
          />
        </div>
      </form>
    </Modal>
  )
}
