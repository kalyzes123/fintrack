import { useState, useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import StatsCards from './components/StatsCards'
import RevenueTrend from './components/RevenueTrend'
import SpendingBreakdown from './components/SpendingBreakdown'
import RecentTransactions from './components/RecentTransactions'
import WalletSummary from './components/WalletSummary'
import TransactionsPage from './components/TransactionsPage'
import SettingsPage from './components/SettingsPage'
import AccountsPage from './components/AccountsPage'
import ConfirmModal from './components/ConfirmModal'
import Walkthrough from './components/Walkthrough'
import MonthPicker from './components/MonthPicker'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getWallets, addWallet, updateWallet, deleteWallet } from './lib/storage'
import { getToken, getUser, logout } from './lib/auth'
import { supabase } from './lib/supabase'


function App() {
  const [authPage, setAuthPage] = useState('loading')
  const [user, setUser] = useState(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [transactions, setTransactions] = useState([])
  const [wallets, setWallets] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [walkthroughStep, setWalkthroughStep] = useState(0)
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Check auth on mount
  useEffect(() => {
    async function init() {
      // Check if there's an active session
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setAuthPage('landing')
          return
        }
      } else {
        const token = getToken()
        if (!token) {
          setAuthPage('landing')
          return
        }
      }
      const u = await getUser()
      if (u) {
        setUser(u)
        setAuthPage('app')
        setTransactions(await getTransactions())
        setWallets(await getWallets())
      } else {
        setAuthPage('landing')
      }
    }
    init()
  }, [])

  // Listen for Supabase password recovery event
  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthPage('reset-password')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (u) => {
    setUser(u)
    setAuthPage('app')
    setTransactions(await getTransactions())
    setWallets(await getWallets())
    if (!localStorage.getItem('fintrack_walkthrough_done')) {
      setShowWalkthrough(true)
      setWalkthroughStep(0)
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setAuthPage('landing')
    setCurrentPage('dashboard')
    setShowLogoutConfirm(false)
  }

  const handleAdd = useCallback(async (data) => {
    setTransactions(await addTransaction(data))
    if (data.wallet) {
      const wallet = wallets.find((w) => w.id === data.wallet)
      if (wallet) {
        const delta = data.type === 'income' ? data.amount : -data.amount
        setWallets(await updateWallet(data.wallet, { balance: (wallet.balance ?? 0) + delta }))
      }
    }
  }, [wallets])

  const handleUpdate = useCallback(async (id, updates) => {
    const oldTx = transactions.find((t) => t.id === id)
    setTransactions(await updateTransaction(id, updates))
    let freshWallets = wallets
    // Reverse the old transaction's effect
    if (oldTx?.wallet) {
      const oldWallet = freshWallets.find((w) => w.id === oldTx.wallet)
      if (oldWallet) {
        const reversal = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount
        freshWallets = await updateWallet(oldTx.wallet, { balance: (oldWallet.balance ?? 0) + reversal })
      }
    }
    // Apply the new transaction's effect
    if (updates.wallet) {
      const newWallet = freshWallets.find((w) => w.id === updates.wallet)
      if (newWallet) {
        const delta = updates.type === 'income' ? updates.amount : -updates.amount
        freshWallets = await updateWallet(updates.wallet, { balance: (newWallet.balance ?? 0) + delta })
      }
    }
    setWallets(freshWallets)
  }, [transactions, wallets])

  const handleDeleteRequest = useCallback((id) => {
    const tx = transactions.find((t) => t.id === id)
    setDeleteTarget(tx || { id })
  }, [transactions])

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget) {
      setTransactions(await deleteTransaction(deleteTarget.id))
      if (deleteTarget.wallet) {
        const wallet = wallets.find((w) => w.id === deleteTarget.wallet)
        if (wallet) {
          const reversal = deleteTarget.type === 'income' ? -deleteTarget.amount : deleteTarget.amount
          setWallets(await updateWallet(deleteTarget.wallet, { balance: (wallet.balance ?? 0) + reversal }))
        }
      }
    }
    setDeleteTarget(null)
  }, [deleteTarget, wallets])

  const handleAddWallet = useCallback(async (data) => {
    setWallets(await addWallet(data))
  }, [])

  const handleUpdateWallet = useCallback(async (id, data) => {
    setWallets(await updateWallet(id, data))
  }, [])

  const handleDeleteWallet = useCallback(async (id) => {
    setWallets(await deleteWallet(id))
  }, [])

  const handleWalkthroughNext = () => {
    setWalkthroughStep((s) => s + 1)
  }

  const handleWalkthroughSkip = () => {
    setShowWalkthrough(false)
    setWalkthroughStep(0)
    setCurrentPage('dashboard')
    localStorage.setItem('fintrack_walkthrough_done', 'true')
  }

  // Loading state
  if (authPage === 'loading') {
    return (
      <div className="font-primary h-full bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--color-accent)] rounded-sm" />
          <span className="text-[var(--color-text-primary)] font-semibold tracking-wider text-sm">FINTRACK</span>
        </div>
      </div>
    )
  }

  // Public pages
  if (authPage === 'landing') return <div className="font-primary h-full"><LandingPage onNavigate={setAuthPage} /></div>
  if (authPage === 'login') return <div className="font-primary h-full"><LoginPage onNavigate={setAuthPage} onAuth={handleAuth} /></div>
  if (authPage === 'register') return <div className="font-primary h-full"><RegisterPage onNavigate={setAuthPage} onAuth={handleAuth} /></div>
  if (authPage === 'reset-password') return <div className="font-primary h-full"><ResetPasswordPage onNavigate={setAuthPage} /></div>

  // Authenticated app
  const sorted = [...transactions].sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date)
    if (dateDiff !== 0) return dateDiff
    if (a.created_at && b.created_at) return b.created_at.localeCompare(a.created_at)
    return 0
  })
  const filtered = sorted.filter((t) => t.date.startsWith(dateRange))

  const dateLabel = (() => {
    const [y, m] = dateRange.split('-')
    const d = new Date(Number(y), Number(m) - 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })()

  const mobileMenuBtn = (
    <div className="flex items-center gap-4 mb-6 lg:hidden">
      <button
        className="p-2 rounded-lg hover:bg-black/5"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={22} className="text-[var(--color-text-primary)]" />
      </button>
    </div>
  )

  return (
    <div className="font-primary flex h-full bg-[var(--color-bg)]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
          {currentPage === 'dashboard' && (
            <>
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button
                    className="lg:hidden p-2 rounded-lg hover:bg-black/5"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu size={22} className="text-[var(--color-text-primary)]" />
                  </button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                      {user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Financial Overview'}
                    </h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{dateLabel} Summary</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center">
                  <MonthPicker value={dateRange} onChange={setDateRange} />
                </div>
              </div>

              <div className="flex sm:hidden mb-4">
                <MonthPicker value={dateRange} onChange={setDateRange} />
              </div>

              <div id="stats-cards">
                <StatsCards transactions={filtered} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
                <div className="lg:col-span-3">
                  <RevenueTrend transactions={sorted} />
                </div>
                <div className="lg:col-span-2">
                  <SpendingBreakdown transactions={filtered} />
                </div>
              </div>

              <div className="mt-6">
                <WalletSummary wallets={wallets} onNavigate={setCurrentPage} />
              </div>

              <div className="mt-6">
                <RecentTransactions transactions={filtered} onNavigate={setCurrentPage} wallets={wallets} />
              </div>

            </>
          )}

          {currentPage === 'transactions' && (
            <>
              {mobileMenuBtn}
              <TransactionsPage
                transactions={sorted}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={handleDeleteRequest}
                wallets={wallets}
              />
            </>
          )}

          {currentPage === 'settings' && (
            <>
              {mobileMenuBtn}
              <SettingsPage
                wallets={wallets}
                onAddWallet={handleAddWallet}
                onUpdateWallet={handleUpdateWallet}
                onDeleteWallet={handleDeleteWallet}
              />
            </>
          )}

          {currentPage === 'accounts' && (
            <>
              {mobileMenuBtn}
              <AccountsPage user={user} onUserUpdate={setUser} />
            </>
          )}
        </div>
      </main>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out of FinTrack?"
        confirmLabel="Log Out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Transaction"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.description}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {showWalkthrough && (
        <Walkthrough
          step={walkthroughStep}
          onNext={handleWalkthroughNext}
          onSkip={handleWalkthroughSkip}
          onNavigate={setCurrentPage}
        />
      )}
    </div>
  )
}

export default App
