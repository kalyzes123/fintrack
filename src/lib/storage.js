import { supabase } from './supabase'

const TRANSACTIONS_KEY = 'fintrack_transactions'
const API_KEY_KEY = 'fintrack_api_key'
const ACCOUNT_KEY = 'fintrack_account'
const WALLETS_KEY = 'fintrack_wallets'

export const WALLET_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'debit', label: 'Debit Card' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
]

export const MALAYSIAN_BANKS = [
  'Maybank',
  'CIMB Bank',
  'Public Bank',
  'RHB Bank',
  'Hong Leong Bank',
  'AmBank',
  'Bank Islam',
  'Bank Rakyat',
  'BSN (Bank Simpanan Nasional)',
  'OCBC Bank',
  'Standard Chartered',
  'HSBC Bank',
  'Alliance Bank',
  'Affin Bank',
  'Bank Muamalat',
  'UOB Bank',
]

const DEFAULT_WALLETS = [
  { id: 'w1', name: 'Cash', type: 'cash', balance: 0 },
  { id: 'w2', name: 'Debit Card', type: 'debit', balance: 0 },
  { id: 'w3', name: 'Credit Card', type: 'credit', balance: 0 },
  { id: 'w4', name: 'E-Wallet', type: 'ewallet', balance: 0 },
  { id: 'w5', name: 'Savings', type: 'savings', balance: 0 },
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
      .order('created_at', { ascending: false })
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
      .select('id, name, type, balance')
      .order('created_at', { ascending: true })
    if (error) {
      // balance column may not exist yet — fall back without it
      const { data: data2, error: error2 } = await supabase
        .from('wallets')
        .select('id, name, type')
        .order('created_at', { ascending: true })
      if (error2) throw new Error(error2.message)
      return (data2 || []).map((w) => ({ ...w, balance: 0 }))
    }
    return data.map((w) => ({ ...w, balance: w.balance ?? 0 }))
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

// ============================================
// RECURRING TRANSACTIONS
// ============================================

const RECURRING_KEY = 'fintrack_recurring'

function getRecurringLocal() {
  const stored = localStorage.getItem(RECURRING_KEY)
  if (!stored) return []
  return JSON.parse(stored)
}

function saveRecurringLocal(items) {
  localStorage.setItem(RECURRING_KEY, JSON.stringify(items))
}

export async function getRecurring() {
  const userId = await getSupabaseUserId()
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (!error) return data || []
    } catch {}
  }
  return getRecurringLocal()
}

export async function addRecurring(rule) {
  const userId = await getSupabaseUserId()
  if (userId) {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .insert({ ...rule, user_id: userId })
      if (!error) return getRecurring()
    } catch {}
  }
  const items = getRecurringLocal()
  const newItem = { ...rule, id: crypto.randomUUID() }
  const updated = [...items, newItem]
  saveRecurringLocal(updated)
  return updated
}

export async function updateRecurring(id, updates) {
  const userId = await getSupabaseUserId()
  if (userId) {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
      if (!error) return getRecurring()
    } catch {}
  }
  const items = getRecurringLocal()
  const updated = items.map((r) => (r.id === id ? { ...r, ...updates } : r))
  saveRecurringLocal(updated)
  return updated
}

export async function deleteRecurring(id) {
  const userId = await getSupabaseUserId()
  if (userId) {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (!error) return getRecurring()
    } catch {}
  }
  const items = getRecurringLocal()
  const updated = items.filter((r) => r.id !== id)
  saveRecurringLocal(updated)
  return updated
}

// ============================================
// BUDGETS
// ============================================

const BUDGETS_KEY = 'fintrack_budgets'

function getBudgetsLocal() {
  const stored = localStorage.getItem(BUDGETS_KEY)
  if (!stored) return []
  return JSON.parse(stored)
}

function saveBudgetsLocal(items) {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(items))
}

export async function getBudgets() {
  const userId = await getSupabaseUserId()
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
      if (!error) return data || []
    } catch {}
  }
  return getBudgetsLocal()
}

export async function setBudget(category, amount) {
  const userId = await getSupabaseUserId()
  if (userId) {
    try {
      const { error } = await supabase
        .from('budgets')
        .upsert({ category, amount, user_id: userId }, { onConflict: 'user_id,category' })
      if (!error) return getBudgets()
    } catch {}
  }
  const budgets = getBudgetsLocal()
  const existing = budgets.find((b) => b.category === category)
  let updated
  if (existing) {
    updated = budgets.map((b) => (b.category === category ? { ...b, amount } : b))
  } else {
    updated = [...budgets, { id: crypto.randomUUID(), category, amount }]
  }
  saveBudgetsLocal(updated)
  return updated
}

export async function deleteBudget(category) {
  const userId = await getSupabaseUserId()
  if (userId) {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', userId)
        .eq('category', category)
      if (!error) return getBudgets()
    } catch {}
  }
  const budgets = getBudgetsLocal()
  const updated = budgets.filter((b) => b.category !== category)
  saveBudgetsLocal(updated)
  return updated
}
