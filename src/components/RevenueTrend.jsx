import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const formatYAxis = (value) => {
  if (value >= 1000) return `RM${(value / 1000).toFixed(1)}K`
  return `RM${value}`
}

export default function RevenueTrend({ transactions }) {
  const data = useMemo(() => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      months.push({ key, label, income: 0, expenses: 0 })
    }

    for (const t of transactions) {
      const monthKey = t.date.slice(0, 7)
      const entry = months.find((m) => m.key === monthKey)
      if (entry) {
        if (t.type === 'income') entry.income += t.amount
        else entry.expenses += t.amount
      }
    }

    return months.map(({ label, income, expenses }) => ({
      month: label,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
    }))
  }, [transactions])

  const hasData = data.some((d) => d.income > 0 || d.expenses > 0)

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Income vs Expenses</h3>
        <span className="text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5">
          6 MONTHS
        </span>
      </div>
      <div style={{ width: '100%', height: 280 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#999' }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#999' }}
              />
              <Tooltip
                formatter={(value, name) => [`RM${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Expenses']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e0db',
                  fontSize: '13px',
                }}
              />
              <Legend
                formatter={(value) => value === 'income' ? 'Income' : 'Expenses'}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="var(--color-green)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--color-green)' }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-accent)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--color-accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-[var(--color-text-muted)]">
            No transaction data yet. Add transactions to see trends.
          </div>
        )}
      </div>
    </div>
  )
}
