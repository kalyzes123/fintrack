import { useState } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import TransactionModal from './TransactionModal'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatAmount(amount, type) {
  const prefix = type === 'income' ? '+' : '-'
  return `${prefix}RM${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getWalletName(wallets, id) {
  const w = wallets.find((w) => w.id === id)
  return w ? w.name : '—'
}

export default function TransactionsPage({ transactions, onAdd, onUpdate, onDelete, wallets = [] }) {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = transactions.filter((tx) =>
    tx.description.toLowerCase().includes(search.toLowerCase()) ||
    tx.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (formData) => {
    if (editing) {
      onUpdate(editing.id, formData)
    } else {
      onAdd(formData)
    }
    setEditing(null)
  }

  const handleEdit = (tx) => {
    setEditing(tx)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">Transactions</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{transactions.length} total transactions</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[200px] pl-9 pr-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm bg-[var(--color-card)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <button
            id="btn-add-transaction"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 shrink-0"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-6 py-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">DESCRIPTION</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">CATEGORY</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">DATE</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">AMOUNT</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">WALLET</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">STATUS</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)]">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-black/[0.02]">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-primary)]">{tx.description}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">{tx.category}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">{formatDate(tx.date)}</td>
                  <td className={`px-4 py-4 text-sm font-semibold ${tx.type === 'income' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
                    {formatAmount(tx.amount, tx.type)}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">{getWalletName(wallets, tx.wallet)}</td>
                  <td className="px-4 py-4">
                    <span className={`
                      inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider text-white uppercase
                      ${tx.status === 'complete' ? 'bg-[var(--color-text-primary)]' : 'bg-[var(--color-accent)]'}
                    `}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-1.5 rounded hover:bg-black/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-[var(--color-red)]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--color-text-muted)]">
                    {search ? 'No transactions match your search.' : 'No transactions yet. Add one to get started!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden p-4 flex flex-col gap-3">
          {filtered.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{tx.description}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{tx.category} · {formatDate(tx.date)} · {getWalletName(wallets, tx.wallet)}</p>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
                    {formatAmount(tx.amount, tx.type)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(tx)} className="p-1 text-[var(--color-text-muted)]">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDelete(tx.id)} className="p-1 text-[var(--color-text-muted)]">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-8">
              {search ? 'No matches found.' : 'No transactions yet.'}
            </p>
          )}
        </div>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        transaction={editing}
        wallets={wallets}
      />
    </div>
  )
}
