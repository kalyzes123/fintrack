import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function MonthPicker({ value, onChange, className }) {
  const [y, m] = value.split('-')
  const year = Number(y)
  const month = Number(m)

  const now = new Date()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const go = (delta) => {
    const d = new Date(year, month - 1 + delta, 1)
    const ny = d.getFullYear()
    const nm = String(d.getMonth() + 1).padStart(2, '0')
    onChange(`${ny}-${nm}`)
  }

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <button
        onClick={() => go(-1)}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/5 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-sm font-semibold text-[var(--color-text-primary)] min-w-[120px] text-center select-none">
        {MONTHS_FULL[month - 1]} {year}
      </span>

      <button
        onClick={() => go(1)}
        disabled={isCurrentMonth}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
