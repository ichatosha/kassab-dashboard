import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useAppState } from '../../store/AppState'
import { useToast } from '../../components/ui/Toast'
import { EMPLOYEE_ROLES, ROLE_PERMISSIONS } from '../../lib/permissions'
import type { EmployeeRole } from '../../types/domain'

const DEPARTMENTS = ['Recruitment', 'Operations', 'Finance', 'Support', 'Executive']

// Adding a Kassab employee creates the account that person signs in with.
// The role decides what they can reach — shown here before it is granted.
export function EmployeeFormModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const { employees, dispatch } = useAppState()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<EmployeeRole>('recruitment_admin')
  const [department, setDepartment] = useState('Recruitment')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const granted = ROLE_PERMISSIONS[role]

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = t('form.required')
    if (!/^[a-z0-9._-]{3,}$/i.test(username.trim())) next.username = t('emp.errUsername')
    else if (employees.some((e) => e.username.toLowerCase() === username.trim().toLowerCase())) next.username = t('emp.errUsernameTaken')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = t('form.errEmail')
    else if (employees.some((e) => e.email.toLowerCase() === email.trim().toLowerCase())) next.email = t('emp.errEmailTaken')
    if (!/^[+0-9\s]{9,}$/.test(phone.trim())) next.phone = t('form.phoneInvalid')
    if (password.trim().length < 8) next.password = t('emp.errPassword')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 400))
    dispatch({
      type: 'addEmployee',
      id: `emp-new-${Date.now().toString(36)}`,
      input: {
        name: name.trim(),
        nameAr: nameAr.trim() || name.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        department,
      },
    })
    setBusy(false)
    toast(t('emp.created'))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={t('emp.add')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" form="employee-form" disabled={busy}>
            {busy ? t('register.creating') : t('emp.create')}
          </Button>
        </>
      }
    >
      <form id="employee-form" onSubmit={submit} noValidate className="space-y-5">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{t('form.personal')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label={t('emp.name')} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
            <TextField label={t('register.nameAr')} value={nameAr} onChange={(e) => setNameAr(e.target.value)} hint={t('register.optional')} dir="rtl" />
            <TextField label={t('common.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} placeholder="+20 1XXXXXXXXX" dir="ltr" required />
            <SelectField label={t('emp.department')} value={department} onChange={(e) => setDepartment(e.target.value)}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </SelectField>
          </div>
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <KeyRound className="h-3.5 w-3.5" aria-hidden />
            {t('emp.credentials')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label={t('emp.username')} value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} dir="ltr" required />
            <TextField label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} dir="ltr" required />
            <TextField
              label={t('emp.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              hint={t('emp.passwordHint')}
              className="sm:col-span-2"
              required
            />
          </div>
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            {t('emp.access')}
          </h3>
          <SelectField label={t('emp.role')} value={role} onChange={(e) => setRole(e.target.value as EmployeeRole)}>
            {EMPLOYEE_ROLES.map((r) => (
              <option key={r} value={r}>{t(`role.${r}` as TranslationKey)}</option>
            ))}
          </SelectField>
          <div className="mt-3 rounded-lg border border-ink-100 p-3">
            <p className="text-xs text-ink-500">{t('emp.willBeAbleTo')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {granted.map((p) => (
                <span key={p} className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-[10px] text-ink-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>
      </form>
    </Modal>
  )
}
