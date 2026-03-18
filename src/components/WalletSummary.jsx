import { ArrowRight, Wallet } from 'lucide-react'
import { WALLET_TYPES } from '../lib/storage'
import { formatBalance } from '../lib/utils'

function getTypeLabel(value) {
  const t = WALLET_TYPES.find((wt) => wt.value === value)
  return t ? t.label : value
}

export default function WalletSummary({ wallets = [], onNavigate }) {
  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance ?? 0), 0)

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Wallet Overview</h3>
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] tracking-wider hover:opacity-80"
        >
          MANAGE <ArrowRight size={14} />
        </button>
      </div>

      {wallets.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex flex-col gap-1.5 px-4 py-3 border border-[var(--color-border)] rounded-lg"
              >
                <div className="flex items-center gap-1.5">
                  <Wallet size={13} className="text-[var(--color-text-muted)] shrink-0" />
                  <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] tracking-wider truncate uppercase">
                    {getTypeLabel(wallet.type)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{wallet.name}</p>
                <p className={`text-base font-bold ${(wallet.balance ?? 0) < 0 ? 'text-[var(--color-red)]' : 'text-[var(--color-text-primary)]'}`}>
                  {formatBalance(wallet.balance ?? 0)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider">TOTAL ACROSS ALL WALLETS</p>
            <p className={`text-base font-bold ${totalBalance < 0 ? 'text-[var(--color-red)]' : 'text-[var(--color-text-primary)]'}`}>
              {formatBalance(totalBalance)}
            </p>
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-[var(--color-text-muted)] py-6">
          No wallets yet.{' '}
          <button onClick={() => onNavigate('settings')} className="text-[var(--color-accent)] font-medium hover:underline">
            Add one to get started
          </button>
        </p>
      )}
    </div>
  )
}
