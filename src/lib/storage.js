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

const SEED_DATA = [
  // February 2026
  { id: '1', description: 'Spotify Premium', category: 'Entertainment', date: '2026-02-24', amount: 14.99, type: 'expense', status: 'complete' },
  { id: '2', description: 'Whole Foods Market', category: 'Groceries', date: '2026-02-23', amount: 187.42, type: 'expense', status: 'complete' },
  { id: '3', description: 'Salary Deposit', category: 'Income', date: '2026-02-20', amount: 8450, type: 'income', status: 'complete' },
  { id: '4', description: 'Electric Bill — ConEd', category: 'Utilities', date: '2026-02-18', amount: 142.30, type: 'expense', status: 'pending' },
  { id: '5', description: 'Amazon Purchase', category: 'Shopping', date: '2026-02-16', amount: 64.99, type: 'expense', status: 'complete' },
  { id: '6', description: 'Rent Payment', category: 'Housing', date: '2026-02-01', amount: 2200, type: 'expense', status: 'complete' },
  { id: '7', description: 'Freelance Payment', category: 'Income', date: '2026-02-15', amount: 3500, type: 'income', status: 'complete' },
  // January 2026
  { id: '8', description: 'Salary Deposit', category: 'Income', date: '2026-01-20', amount: 8450, type: 'income', status: 'complete' },
  { id: '9', description: 'Rent Payment', category: 'Housing', date: '2026-01-01', amount: 2200, type: 'expense', status: 'complete' },
  { id: '10', description: 'Grocery Run', category: 'Groceries', date: '2026-01-15', amount: 210.55, type: 'expense', status: 'complete' },
  { id: '11', description: 'Gas Station', category: 'Transportation', date: '2026-01-12', amount: 52.30, type: 'expense', status: 'complete' },
  { id: '12', description: 'Freelance Payment', category: 'Income', date: '2026-01-25', amount: 2800, type: 'income', status: 'complete' },
  // December 2025
  { id: '13', description: 'Salary Deposit', category: 'Income', date: '2025-12-20', amount: 8450, type: 'income', status: 'complete' },
  { id: '14', description: 'Rent Payment', category: 'Housing', date: '2025-12-01', amount: 2200, type: 'expense', status: 'complete' },
  { id: '15', description: 'Holiday Shopping', category: 'Shopping', date: '2025-12-18', amount: 420.00, type: 'expense', status: 'complete' },
  { id: '16', description: 'Restaurant Dinner', category: 'Food & Dining', date: '2025-12-24', amount: 135.50, type: 'expense', status: 'complete' },
  // November 2025
  { id: '17', description: 'Salary Deposit', category: 'Income', date: '2025-11-20', amount: 8450, type: 'income', status: 'complete' },
  { id: '18', description: 'Rent Payment', category: 'Housing', date: '2025-11-01', amount: 2200, type: 'expense', status: 'complete' },
  { id: '19', description: 'Electric Bill', category: 'Utilities', date: '2025-11-15', amount: 128.40, type: 'expense', status: 'complete' },
  { id: '20', description: 'Gym Membership', category: 'Health', date: '2025-11-05', amount: 49.99, type: 'expense', status: 'complete' },
  // October 2025
  { id: '21', description: 'Salary Deposit', category: 'Income', date: '2025-10-20', amount: 8450, type: 'income', status: 'complete' },
  { id: '22', description: 'Rent Payment', category: 'Housing', date: '2025-10-01', amount: 2200, type: 'expense', status: 'complete' },
  { id: '23', description: 'Grocery Run', category: 'Groceries', date: '2025-10-10', amount: 195.30, type: 'expense', status: 'complete' },
  // September 2025
  { id: '24', description: 'Salary Deposit', category: 'Income', date: '2025-09-20', amount: 8450, type: 'income', status: 'complete' },
  { id: '25', description: 'Rent Payment', category: 'Housing', date: '2025-09-01', amount: 2200, type: 'expense', status: 'complete' },
  { id: '26', description: 'Freelance Payment', category: 'Income', date: '2025-09-28', amount: 1500, type: 'income', status: 'complete' },
  { id: '27', description: 'Netflix Subscription', category: 'Entertainment', date: '2025-09-05', amount: 22.99, type: 'expense', status: 'complete' },
]

export const CATEGORIES = [
  'Housing', 'Transportation', 'Food & Dining', 'Groceries', 'Utilities',
  'Entertainment', 'Shopping', 'Health', 'Income', 'Other',
]

export function getTransactions() {
  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  if (!stored) {
    saveTransactions(SEED_DATA)
    return SEED_DATA
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
