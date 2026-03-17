import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const FILTERS = [
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
]

const formatYAxis = (value) => {
  if (value >= 1000) return `RM${(value / 1000).toFixed(1)}K`
  return `RM${value}`
}

function buildDailyData(transactions, days) {
  const now = new Date()
  const entries = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    entries.push({ key, label, income: 0, expenses: 0 })
  }
  for (const t of transactions) {
    const entry = entries.find((e) => e.key === t.date)
    if (entry) {
      if (t.type === 'income') entry.income += t.amount
      else entry.expenses += t.amount
    }
  }
  return entries.map(({ label, income, expenses }) => ({
    label,
    income: Math.round(income * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
  }))
}

function buildMonthlyData(transactions, months) {
  const now = new Date()
  const entries = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    entries.push({ key, label, income: 0, expenses: 0 })
  }
  for (const t of transactions) {
    const monthKey = t.date.slice(0, 7)
    const entry = entries.find((e) => e.key === monthKey)
    if (entry) {
      if (t.type === 'income') entry.income += t.amount
      else entry.expenses += t.amount
    }
  }
  return entries.map(({ label, income, expenses }) => ({
    label,
    income: Math.round(income * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
  }))
}

export default function RevenueTrend({ transactions }) {
  const [activeFilter, setActiveFilter] = useState('6M')

  const data = useMemo(() => {
    if (activeFilter === '7D') return buildDailyData(transactions, 7)
    if (activeFilter === '1M') return buildDailyData(transactions, 30)
    if (activeFilter === '3M') return buildMonthlyData(transactions, 3)
    return buildMonthlyData(transactions, 6)
  }, [transactions, activeFilter])

  // For 1M daily view, only show every 5th label to avoid crowding
  const tickFormatter = (label, index) => {
    if (activeFilter === '1M' && index % 5 !== 0) return ''
    return label
  }

  const hasData = data.some((d) => d.income > 0 || d.expenses > 0)

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Income vs Expenses</h3>
        <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-lg p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeFilter === f.label
                  ? 'bg-[var(--color-text-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#999' }}
                tickFormatter={tickFormatter}
                interval={activeFilter === '7D' ? 0 : activeFilter === '1M' ? 4 : 0}
              />
              <YAxis
                tickFormatter={formatYAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#999' }}
              />
              <Tooltip
                formatter={(value, name) => [`RM${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Expenses']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e0db', fontSize: '13px' }}
              />
              <Legend
                formatter={(value) => value === 'income' ? 'Income' : 'Expenses'}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="income" stroke="var(--color-green)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: 'var(--color-green)' }} />
              <Line type="monotone" dataKey="expenses" stroke="var(--color-accent)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: 'var(--color-accent)' }} />
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
