import { ArrowRight } from 'lucide-react'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatAmount(amount, type) {
  const prefix = type === 'income' ? '+' : '-'
  return `${prefix}RM${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function RecentTransactions({ transactions, onNavigate }) {
  const recent = transactions.slice(0, 5)

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Transactions</h3>
        <button
          onClick={() => onNavigate('transactions')}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] tracking-wider hover:opacity-80"
        >
          VIEW ALL <ArrowRight size={14} />
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="pb-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">DESCRIPTION</th>
              <th className="pb-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">CATEGORY</th>
              <th className="pb-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">DATE</th>
              <th className="pb-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">AMOUNT</th>
              <th className="pb-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((tx) => (
              <tr key={tx.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-4 text-sm font-medium text-[var(--color-text-primary)]">{tx.description}</td>
                <td className="py-4 text-sm text-[var(--color-text-secondary)]">{tx.category}</td>
                <td className="py-4 text-sm text-[var(--color-text-secondary)]">{formatDate(tx.date)}</td>
                <td className={`py-4 text-sm font-semibold ${tx.type === 'income' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
                  {formatAmount(tx.amount, tx.type)}
                </td>
                <td className="py-4">
                  <span className={`
                    inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider text-white uppercase
                    ${tx.status === 'complete' ? 'bg-[var(--color-text-primary)]' : 'bg-[var(--color-accent)]'}
                  `}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {recent.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{tx.description}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{tx.category} · {formatDate(tx.date)}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
                {formatAmount(tx.amount, tx.type)}
              </p>
              <span className={`
                inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider text-white mt-1 uppercase
                ${tx.status === 'complete' ? 'bg-[var(--color-text-primary)]' : 'bg-[var(--color-accent)]'}
              `}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
