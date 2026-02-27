import { LayoutDashboard, Receipt, Wallet, Users, X, LogOut } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD', page: 'dashboard' },
  { icon: Receipt, label: 'TRANSACTIONS', page: 'transactions' },
  { icon: Wallet, label: 'WALLETS', page: 'settings' },
  { icon: Users, label: 'ACCOUNTS', page: 'accounts' },
]

export default function Sidebar({ open, onClose, currentPage, onNavigate, onLogout }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[220px] bg-[var(--color-sidebar)] flex flex-col py-8 px-6
          transition-transform duration-300
          lg:static lg:translate-x-0 lg:shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          className="lg:hidden absolute top-4 right-4 text-[var(--color-nav-text)] hover:text-white"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-10">
          <div className="w-3 h-3 bg-[var(--color-accent)] rounded-sm" />
          <span className="text-white font-semibold tracking-wider text-sm">FINTRACK</span>
        </div>

        <div className="w-full h-px bg-[#333] mb-6" />

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.page}
              id={item.page === 'settings' ? 'nav-wallets' : undefined}
              onClick={() => {
                onNavigate(item.page)
                onClose()
              }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wider transition-colors w-full text-left
                ${currentPage === item.page
                  ? 'text-[var(--color-nav-active)]'
                  : 'text-[var(--color-nav-text)] hover:text-white'
                }
              `}
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="w-full h-px bg-[#333] mb-4" />
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wider text-[var(--color-nav-text)] hover:text-white transition-colors w-full text-left"
          >
            <LogOut size={18} strokeWidth={1.5} />
            LOGOUT
          </button>
        </div>
      </aside>
    </>
  )
}
