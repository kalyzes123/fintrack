import { useState } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES } from '../lib/storage'

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Income')

function CategoryRow({ category, spent, budget, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(budget != null ? String(budget) : '')

  const pct = budget ? Math.min((spent / budget) * 100, 100) : 0
  const barColor =
    !budget || spent === 0
      ? 'var(--color-green)'
      : spent >= budget
      ? 'var(--color-red)'
      : spent / budget >= 0.75
      ? '#f59e0b'
      : 'var(--color-green)'

  const handleSave = () => {
    const amount = parseFloat(value)
    if (!amount || amount <= 0) return
    onSave(amount)
    setEditing(false)
  }

  const handleCancel = () => {
    setValue(budget != null ? String(budget) : '')
    setEditing(false)
  }

  return (
    <div className="px-4 py-3 border border-[var(--color-border)] rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{category}</p>
          {budget != null ? (
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              RM{spent.toLocaleString('en-MY', { minimumFractionDigits: 2 })} of RM
              {budget.toLocaleString('en-MY', { minimumFractionDigits: 2 })} spent
              {spent > budget && (
                <span className="text-[var(--color-red)] font-medium ml-1">— over budget!</span>
              )}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">No limit set</p>
          )}
        </div>

        {editing ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]">
                RM
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') handleCancel()
                }}
                placeholder="0.00"
                className="w-28 pl-8 pr-2 py-1.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
                autoFocus
              />
            </div>
            <button
              onClick={handleSave}
              className="px-2.5 py-1.5 bg-[var(--color-text-primary)] text-white rounded-lg text-xs font-medium hover:opacity-90"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {budget != null ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
                >
                  RM{budget.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
                >
                  <X size={13} />
                </button>
              </>
            ) : (
              <button
                onClick={() => { setEditing(true); setValue('') }}
                className="text-xs font-medium text-[var(--color-accent)] hover:underline"
              >
                Set limit
              </button>
            )}
          </div>
        )}
      </div>

      {budget != null && (
        <div className="mt-2.5 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      )}
    </div>
  )
}

export default function BudgetsPage({ budgets, transactions, onSetBudget, onDeleteBudget }) {
  const currentMonth = new Date().toISOString().slice(0, 7)

  const spending = {}
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date.startsWith(currentMonth)) {
      spending[tx.category] = (spending[tx.category] || 0) + tx.amount
    }
  }

  const getBudget = (cat) => {
    const b = budgets.find((b) => b.category === cat)
    return b ? b.amount : null
  }

  return (
    <div className="max-w-[640px]">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Budgets</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        Set monthly spending limits by category
      </p>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Monthly Limits</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Click an amount to edit, or set a new limit for any category
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {EXPENSE_CATEGORIES.map((cat) => (
            <CategoryRow
              key={cat}
              category={cat}
              spent={spending[cat] || 0}
              budget={getBudget(cat)}
              onSave={(amount) => onSetBudget(cat, amount)}
              onDelete={() => onDeleteBudget(cat)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
