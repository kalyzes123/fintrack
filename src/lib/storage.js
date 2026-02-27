import { supabase } from './supabase'

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

// --- Supabase helper ---
async function getSupabaseUserId() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// --- localStorage helpers (internal, avoid name clash with exported async versions) ---
function getTransactionsLocal() {
  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  if (!stored) {
    saveTransactionsLocal([])
    return []
  }
  return JSON.parse(stored)
}

function saveTransactionsLocal(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

function getWalletsLocal() {
  const stored = localStorage.getItem(WALLETS_KEY)
  if (!stored) {
    saveWalletsLocal(DEFAULT_WALLETS)
    return DEFAULT_WALLETS
  }
  return JSON.parse(stored)
}

function saveWalletsLocal(wallets) {
  localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets))
}

// --- Supabase row mapper: wallet_id <-> wallet ---
function mapTransactionFromDb({ wallet_id, user_id, ...rest }) {
  return { ...rest, wallet: wallet_id }
}

// ============================================
// TRANSACTIONS
// ============================================

export async function getTransactions() {
  const userId = await getSupabaseUserId()
  if (userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw new Error(error.message)
    return data.map(mapTransactionFromDb)
  }
  return getTransactionsLocal()
}

export async function addTransaction(transaction) {
  const userId = await getSupabaseUserId()
  if (userId) {
    const { wallet, ...rest } = transaction
    const { error } = await supabase
      .from('transactions')
      .insert({ ...rest, wallet_id: wallet || null, user_id: userId })
    if (error) throw new Error(error.message)
    return getTransactions()
  }
  const transactions = getTransactionsLocal()
  const newTx = { ...transaction, id: crypto.randomUUID() }
  const updated = [newTx, ...transactions]
  saveTransactionsLocal(updated)
  return updated
}

export async function updateTransaction(id, updates) {
  const userId = await getSupabaseUserId()
  if (userId) {
    const { wallet, ...rest } = updates
    const payload = { ...rest }
    if (wallet !== undefined) payload.wallet_id = wallet
    const { error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
    if (error) throw new Error(error.message)
    return getTransactions()
  }
  const transactions = getTransactionsLocal()
  const updated = transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
  saveTransactionsLocal(updated)
  return updated
}

export async function deleteTransaction(id) {
  const userId = await getSupabaseUserId()
  if (userId) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    return getTransactions()
  }
  const transactions = getTransactionsLocal()
  const updated = transactions.filter((tx) => tx.id !== id)
  saveTransactionsLocal(updated)
  return updated
}

// ============================================
// WALLETS
// ============================================

export async function getWallets() {
  const userId = await getSupabaseUserId()
  if (userId) {
    const { data, error } = await supabase
      .from('wallets')
      .select('id, name, type')
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data
  }
  return getWalletsLocal()
}

export async function addWallet(wallet) {
  const userId = await getSupabaseUserId()
  if (userId) {
    const { error } = await supabase
      .from('wallets')
      .insert({ ...wallet, user_id: userId })
    if (error) throw new Error(error.message)
    return getWallets()
  }
  const wallets = getWalletsLocal()
  const newWallet = { ...wallet, id: crypto.randomUUID() }
  const updated = [...wallets, newWallet]
  saveWalletsLocal(updated)
  return updated
}

export async function updateWallet(id, updates) {
  const userId = await getSupabaseUserId()
  if (userId) {
    const { error } = await supabase.from('wallets').update(updates).eq('id', id)
    if (error) throw new Error(error.message)
    return getWallets()
  }
  const wallets = getWalletsLocal()
  const updated = wallets.map((w) => (w.id === id ? { ...w, ...updates } : w))
  saveWalletsLocal(updated)
  return updated
}

export async function deleteWallet(id) {
  const userId = await getSupabaseUserId()
  if (userId) {
    const { error } = await supabase.from('wallets').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return getWallets()
  }
  const wallets = getWalletsLocal()
  const updated = wallets.filter((w) => w.id !== id)
  saveWalletsLocal(updated)
  return updated
}

// ============================================
// MISC (localStorage only)
// ============================================

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
