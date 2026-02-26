import { TrendingUp, TrendingDown } from 'lucide-react'

function formatCurrency(value) {
  if (value >= 1000) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }
  return '$' + value.toFixed(2)
}

export default function StatsCards({ transactions }) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expenses
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

  const stats = [
    { label: 'TOTAL BALANCE', value: formatCurrency(balance), change: '+12.4%', up: balance >= 0 },
    { label: 'MONTHLY INCOME', value: formatCurrency(income), change: '+8.2%', up: true },
    { label: 'MONTHLY EXPENSES', value: formatCurrency(expenses), change: '+3.1%', up: false },
    { label: 'SAVINGS RATE', value: `${savingsRate.toFixed(1)}%`, change: '+5.7%', up: savingsRate >= 0, accent: true },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`
            rounded-xl p-5 border
            ${stat.accent
              ? 'bg-[var(--color-card-accent)] text-white border-transparent'
              : 'bg-[var(--color-card)] text-[var(--color-text-primary)] border-[var(--color-border)]'
            }
          `}
        >
          <p
            className={`text-[10px] font-semibold tracking-widest mb-3 ${
              stat.accent ? 'text-white/70' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {stat.label}
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold">{stat.value}</p>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              stat.up ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
            } ${stat.accent ? '!text-green-300' : ''}`}>
              {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {stat.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
