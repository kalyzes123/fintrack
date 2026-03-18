const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function MonthPicker({ value, onChange, className }) {
  const [y, m] = value.split('-')
  const year = Number(y)
  const month = Number(m)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i)

  return (
    <div className={`flex flex-col items-start gap-1.5 ${className || ''}`}>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{MONTHS_FULL[month - 1]} {year}</p>
      <div className="flex items-center gap-1.5">
        <select
          value={month}
          onChange={(e) => onChange(`${year}-${String(e.target.value).padStart(2, '0')}`)}
          className="px-2.5 py-2 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-[var(--color-card)] cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
        >
          {MONTHS_SHORT.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => onChange(`${e.target.value}-${String(month).padStart(2, '0')}`)}
          className="px-2.5 py-2 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-[var(--color-card)] cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
        >
          {years.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
