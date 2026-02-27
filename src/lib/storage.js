const TRANSACTIONS_KEY = 'fintrack_transactions'
const API_KEY_KEY = 'fintrack_api_key'
const ACCOUNT_KEY = 'fintrack_account'
const WALLETS_KEY = 'fintrack_wallets'

export const WALLET_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'debit', label: 'Debit Card' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
]

const DEFAULT_WALLETS = [
  { id: 'w1', name: 'Cash', type: 'cash' },
  { id: 'w2', name: 'Debit Card', type: 'debit' },
  { id: 'w3', name: 'Credit Card', type: 'credit' },
  { id: 'w4', name: 'E-Wallet', type: 'ewallet' },
  { id: 'w5', name: 'Savings', type: 'savings' },
]

export const CATEGORIES = [
  'Housing', 'Transportation', 'Food & Dining', 'Groceries', 'Utilities',
  'Entertainment', 'Shopping', 'Health', 'Income', 'Other',
]

export function getTransactions() {
  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  if (!stored) {
    saveTransactions([])
    return []
  }
  return JSON.parse(stored)
}

export function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export function addTransaction(transaction) {
  const transactions = getTransactions()
  const newTx = { ...transaction, id: crypto.randomUUID() }
  const updated = [newTx, ...transactions]
  saveTransactions(updated)
  return updated
}

export function updateTransaction(id, updates) {
  const transactions = getTransactions()
  const updated = transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
  saveTransactions(updated)
  return updated
}

export function deleteTransaction(id) {
  const transactions = getTransactions()
  const updated = transactions.filter((tx) => tx.id !== id)
  saveTransactions(updated)
  return updated
}

export function getApiKey() {
  return localStorage.getItem(API_KEY_KEY) || ''
}

export function saveApiKey(key) {
  localStorage.setItem(API_KEY_KEY, key)
}

export function getAccount() {
  const stored = localStorage.getItem(ACCOUNT_KEY)
  if (!stored) return { name: '', email: '', password: '' }
  return JSON.parse(stored)
}

export function saveAccount(data) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(data))
}

export function resetAllData() {
  localStorage.removeItem(TRANSACTIONS_KEY)
  localStorage.removeItem(API_KEY_KEY)
  localStorage.removeItem(ACCOUNT_KEY)
  localStorage.removeItem(WALLETS_KEY)
}

export function getWallets() {
  const stored = localStorage.getItem(WALLETS_KEY)
  if (!stored) {
    saveWallets(DEFAULT_WALLETS)
    return DEFAULT_WALLETS
  }
  return JSON.parse(stored)
}

export function saveWallets(wallets) {
  localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets))
}

export function addWallet(wallet) {
  const wallets = getWallets()
  const newWallet = { ...wallet, id: crypto.randomUUID() }
  const updated = [...wallets, newWallet]
  saveWallets(updated)
  return updated
}

export function updateWallet(id, updates) {
  const wallets = getWallets()
  const updated = wallets.map((w) => (w.id === id ? { ...w, ...updates } : w))
  saveWallets(updated)
  return updated
}

export function deleteWallet(id) {
  const wallets = getWallets()
  const updated = wallets.filter((w) => w.id !== id)
  saveWallets(updated)
  return updated
}
