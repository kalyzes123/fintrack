import { useState, useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import StatsCards from './components/StatsCards'
import RevenueTrend from './components/RevenueTrend'
import SpendingBreakdown from './components/SpendingBreakdown'
import RecentTransactions from './components/RecentTransactions'
import TransactionsPage from './components/TransactionsPage'
import SettingsPage from './components/SettingsPage'
import AccountsPage from './components/AccountsPage'
import ConfirmModal from './components/ConfirmModal'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from './lib/storage'
import { getToken, getUser, logout } from './lib/auth'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function MonthPicker({ value, onChange, className }) {
  const [y, m] = value.split('-')
  const year = Number(y)
  const month = Number(m)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i)

  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      <select
        value={month}
        onChange={(e) => onChange(`${year}-${String(e.target.value).padStart(2, '0')}`)}
        className="px-2.5 py-2 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-[var(--color-card)] cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
      >
        {MONTHS.map((name, i) => (
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
  )
}

function App() {
  const [authPage, setAuthPage] = useState('loading')
  const [user, setUser] = useState(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [transactions, setTransactions] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Check auth on mount
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setAuthPage('landing')
      return
    }
    getUser().then((u) => {
      if (u) {
        setUser(u)
        setAuthPage('app')
        setTransactions(getTransactions())
      } else {
        setAuthPage('landing')
      }
    })
  }, [])

  const handleAuth = (u) => {
    setUser(u)
    setAuthPage('app')
    setTransactions(getTransactions())
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setAuthPage('landing')
    setCurrentPage('dashboard')
  }

  const handleAdd = useCallback((data) => {
    setTransactions(addTransaction(data))
  }, [])

  const handleUpdate = useCallback((id, data) => {
    setTransactions(updateTransaction(id, data))
  }, [])

  const handleDeleteRequest = useCallback((id) => {
    const tx = getTransactions().find((t) => t.id === id)
    setDeleteTarget(tx || { id })
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      setTransactions(deleteTransaction(deleteTarget.id))
    }
    setDeleteTarget(null)
  }, [deleteTarget])

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

  // Authenticated app
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))
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
        onLogout={handleLogout}
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

              <StatsCards transactions={filtered} />

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
                <div className="lg:col-span-3">
                  <RevenueTrend transactions={sorted} />
                </div>
                <div className="lg:col-span-2">
                  <SpendingBreakdown transactions={filtered} />
                </div>
              </div>

              <div className="mt-6">
                <RecentTransactions transactions={filtered} onNavigate={setCurrentPage} />
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
              />
            </>
          )}

          {currentPage === 'settings' && (
            <>
              {mobileMenuBtn}
              <SettingsPage />
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
    </div>
  )
}

export default App
