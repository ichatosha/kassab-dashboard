import { useMemo, useState } from 'react'
import { Info, Wallet } from 'lucide-react'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useAppState } from '../store/AppState'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar, PageHeader, Tabs } from '../components/ui/misc'
import { formatDateTime, formatMoney } from '../lib/format'
import type { WalletTransaction } from '../types/domain'

function TxList({ transactions }: { transactions: WalletTransaction[] }) {
  const { t, locale } = useI18n()
  if (transactions.length === 0) return <EmptyState title={t('notif.empty')} icon={<Wallet className="h-6 w-6" />} />
  return (
    <ul className="divide-y divide-ink-100">
      {transactions.map((tx) => (
        <li key={tx.id} className="flex items-center gap-3 px-4 py-2.5">
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink-900">{t(`wallets.tx.${tx.type}` as TranslationKey)}</span>
            <span className="tnum block text-xs text-ink-400" dir="ltr">{tx.reference}</span>
          </span>
          <span className="tnum text-xs text-ink-400">{formatDateTime(tx.at, locale)}</span>
          <span className={`tnum w-28 text-end text-sm font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount, locale)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function WalletsPage() {
  const { t, locale } = useI18n()
  const { drivers, companies, driverTransactions, companyTransactions } = useAppState()
  const [tab, setTab] = useState('drivers')
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  const walletDrivers = useMemo(() => drivers.filter((d) => d.status === 'approved' && d.balance > 0), [drivers])
  const walletCompanies = useMemo(() => companies.filter((c) => c.status === 'approved'), [companies])

  const activeDriver = walletDrivers.find((d) => d.id === selectedDriver) ?? walletDrivers[0]
  const activeCompany = walletCompanies.find((c) => c.id === selectedCompany) ?? walletCompanies[0]

  const driverTx = useMemo(() => driverTransactions.filter((tx) => tx.ownerId === activeDriver?.id), [driverTransactions, activeDriver])
  const companyTx = useMemo(() => companyTransactions.filter((tx) => tx.ownerId === activeCompany?.id), [companyTransactions, activeCompany])

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('wallets.title')} subtitle={t('wallets.subtitle')} />
      <p className="mb-4 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs text-sky-800">
        <Info className="h-4 w-4 shrink-0" aria-hidden />
        {t('wallets.integrationNote')}
      </p>

      <Tabs
        tabs={[
          { id: 'drivers', label: t('wallets.driverWallets') },
          { id: 'companies', label: t('wallets.companyWallets') },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card padded={false} title={tab === 'drivers' ? t('wallets.driverWallets') : t('wallets.companyWallets')}>
          <ul className="max-h-[28rem] divide-y divide-ink-100 overflow-y-auto scroll-thin">
            {(tab === 'drivers' ? walletDrivers : walletCompanies).map((entity) => {
              const isDriver = tab === 'drivers'
              const active = isDriver ? entity.id === activeDriver?.id : entity.id === activeCompany?.id
              const balance = isDriver ? (entity as typeof walletDrivers[number]).balance : (entity as typeof walletCompanies[number]).walletBalance
              return (
                <li key={entity.id}>
                  <button
                    className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-start transition-colors hover:bg-brand-50/40 ${active ? 'bg-brand-50/70' : ''}`}
                    onClick={() => (isDriver ? setSelectedDriver(entity.id) : setSelectedCompany(entity.id))}
                    aria-current={active}
                  >
                    <Avatar name={entity.name} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">
                      {locale === 'ar' ? entity.nameAr : entity.name}
                    </span>
                    <span className="tnum text-sm font-semibold text-ink-800">{formatMoney(balance, locale)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>

        <div className="lg:col-span-2">
          {tab === 'drivers' && activeDriver && (
            <Card
              padded={false}
              title={
                <div className="flex items-center gap-3">
                  <Avatar name={activeDriver.name} size="sm" />
                  <span className="text-sm font-semibold text-ink-900">{locale === 'ar' ? activeDriver.nameAr : activeDriver.name}</span>
                  <span className="tnum ms-auto text-base font-bold text-ink-950">{formatMoney(activeDriver.balance, locale)}</span>
                </div>
              }
            >
              <TxList transactions={driverTx} />
            </Card>
          )}
          {tab === 'companies' && activeCompany && (
            <Card
              padded={false}
              title={
                <div className="flex items-center gap-3">
                  <Avatar name={activeCompany.name} size="sm" />
                  <span className="text-sm font-semibold text-ink-900">{locale === 'ar' ? activeCompany.nameAr : activeCompany.name}</span>
                  <span className="tnum ms-auto text-base font-bold text-ink-950">{formatMoney(activeCompany.walletBalance, locale)}</span>
                </div>
              }
            >
              <TxList transactions={companyTx} />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
