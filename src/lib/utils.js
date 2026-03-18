// Shared formatting and lookup utilities used across components

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatAmount(amount, type) {
  const prefix = type === 'income' ? '+' : '-'
  return `${prefix}RM${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatBalance(amount) {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (amount < 0 ? '-' : '') + 'RM' + formatted
}

export function formatCurrency(value) {
  if (value >= 1000) {
    return 'RM' + value.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }
  return 'RM' + value.toFixed(2)
}

export function getWalletName(wallets, id) {
  const w = wallets.find((w) => w.id === id)
  return w ? w.name : '—'
}
