import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = {
  Housing: '#c45a3c',
  Transportation: '#1a1a1a',
  'Food & Dining': '#3d5a80',
  Groceries: '#6b8f71',
  Utilities: '#8a6552',
  Entertainment: '#d4a574',
  Shopping: '#7c6f64',
  Health: '#5c8a8a',
  Other: '#d4d0cb',
}

export default function SpendingBreakdown({ transactions }) {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + t.amount, 0)

  const categoryMap = {}
  for (const tx of expenses) {
    const cat = tx.category
    categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount
  }

  const data = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      pct: total > 0 ? `${Math.round((value / total) * 100)}%` : '0%',
      color: COLORS[name] || '#d4d0cb',
    }))
    .sort((a, b) => b.value - a.value)

  const totalFormatted = total >= 1000
    ? `RM${(total / 1000).toFixed(1)}K`
    : `RM${total.toFixed(0)}`

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Spending Breakdown</h3>
      {data.length > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
          <div className="relative w-[180px] h-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-[var(--color-text-primary)]">{totalFormatted}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {data.map((item) => (
              <div key={item.name} className="flex items-start gap-2.5">
                <div
                  className="w-3 h-3 rounded-sm mt-0.5 shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    RM{item.value.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} — {item.pct}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-12 text-sm text-[var(--color-text-muted)]">
          No expenses yet. Add transactions to see your breakdown.
        </div>
      )}
    </div>
  )
}
