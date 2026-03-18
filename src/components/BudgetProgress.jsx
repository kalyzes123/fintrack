export default function BudgetProgress({ budgets, transactions }) {
  const currentMonth = new Date().toISOString().slice(0, 7)

  const spending = {}
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date.startsWith(currentMonth)) {
      spending[tx.category] = (spending[tx.category] || 0) + tx.amount
    }
  }

  const rows = budgets
    .map((b) => ({ ...b, spent: spending[b.category] || 0 }))
    .sort((a, b) => b.spent / b.amount - a.spent / a.amount)

  if (rows.length === 0) return null

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Budget Overview</h3>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        {rows.map(({ category, amount, spent }) => {
          const pct = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0
          const ratio = amount > 0 ? spent / amount : 0
          const barColor =
            ratio >= 1 ? 'var(--color-red)' : ratio >= 0.75 ? '#f59e0b' : 'var(--color-green)'
          const textColor =
            ratio >= 1
              ? 'text-[var(--color-red)]'
              : ratio >= 0.75
              ? 'text-[#f59e0b]'
              : 'text-[var(--color-text-secondary)]'

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[var(--color-text-primary)]">{category}</span>
                <span className={`text-xs font-medium ${textColor}`}>
                  RM{spent.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  <span className="text-[var(--color-text-muted)] font-normal">
                    {' / '}RM{amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </span>
                </span>
              </div>
              <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
