import { addTransaction, updateWallet, updateRecurring } from './storage'

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function advanceDate(date, frequency) {
  const d = new Date(date)
  switch (frequency) {
    case 'daily': d.setDate(d.getDate() + 1); break
    case 'weekly': d.setDate(d.getDate() + 7); break
    case 'monthly': d.setMonth(d.getMonth() + 1); break
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break
  }
  return d
}

export async function processRecurring(recurring, wallets) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const txsToAdd = []
  const rulesToUpdate = []

  for (const rule of recurring) {
    if (!rule.active) continue
    let due = new Date(rule.next_due + 'T00:00:00')
    const dates = []
    let count = 0

    while (due <= today && count < 12) {
      dates.push(toDateStr(due))
      due = advanceDate(due, rule.frequency)
      count++
    }

    if (dates.length > 0) {
      for (const dateStr of dates) {
        txsToAdd.push({
          description: rule.description,
          amount: rule.amount,
          type: rule.type,
          category: rule.category,
          wallet: rule.wallet,
          date: dateStr,
          status: 'complete',
        })
      }
      rulesToUpdate.push({ id: rule.id, next_due: toDateStr(due) })
    }
  }

  if (txsToAdd.length === 0) return null

  let finalTxs
  for (const tx of txsToAdd) {
    finalTxs = await addTransaction(tx)
  }

  // Compute net wallet deltas and apply
  const deltas = {}
  for (const tx of txsToAdd) {
    if (tx.wallet) {
      deltas[tx.wallet] = (deltas[tx.wallet] || 0) + (tx.type === 'income' ? tx.amount : -tx.amount)
    }
  }

  let currentWallets = wallets
  for (const [walletId, delta] of Object.entries(deltas)) {
    const wallet = currentWallets.find((w) => w.id === walletId)
    if (wallet) {
      currentWallets = await updateWallet(walletId, { balance: (wallet.balance ?? 0) + delta })
    }
  }

  for (const { id, next_due } of rulesToUpdate) {
    await updateRecurring(id, { next_due })
  }

  return { transactions: finalTxs, wallets: currentWallets }
}
