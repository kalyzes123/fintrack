import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { WALLET_TYPES } from '../lib/storage'

export default function SettingsPage({ wallets, onAddWallet, onUpdateWallet, onDeleteWallet }) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'cash' })

  const handleAdd = () => {
    if (!form.name.trim()) return
    onAddWallet({ name: form.name.trim(), type: form.type })
    setForm({ name: '', type: 'cash' })
    setAdding(false)
  }

  const handleEdit = (wallet) => {
    setEditingId(wallet.id)
    setForm({ name: wallet.name, type: wallet.type })
  }

  const handleUpdate = () => {
    if (!form.name.trim()) return
    onUpdateWallet(editingId, { name: form.name.trim(), type: form.type })
    setEditingId(null)
    setForm({ name: '', type: 'cash' })
  }

  const handleCancel = () => {
    setAdding(false)
    setEditingId(null)
    setForm({ name: '', type: 'cash' })
  }

  const getTypeLabel = (value) => {
    const t = WALLET_TYPES.find((wt) => wt.value === value)
    return t ? t.label : value
  }

  return (
    <div className="max-w-[600px]">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Settings</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">Configure your FinTrack preferences</p>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Wallets</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Manage your payment methods</p>
          </div>
          {!adding && (
            <button
              onClick={() => { setAdding(true); setEditingId(null); setForm({ name: '', type: 'cash' }) }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-text-primary)] text-white rounded-lg text-xs font-medium hover:opacity-90"
            >
              <Plus size={14} />
              Add Wallet
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="flex items-center gap-3 px-4 py-3 border border-[var(--color-border)] rounded-lg">
              {editingId === wallet.id ? (
                <>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
                    autoFocus
                  />
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="px-2.5 py-1.5 border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    {WALLET_TYPES.map((wt) => (
                      <option key={wt.value} value={wt.value}>{wt.label}</option>
                    ))}
                  </select>
                  <button onClick={handleUpdate} className="p-1.5 rounded hover:bg-green-50 text-[var(--color-green)]">
                    <Check size={16} />
                  </button>
                  <button onClick={handleCancel} className="p-1.5 rounded hover:bg-red-50 text-[var(--color-text-muted)]">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{wallet.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{getTypeLabel(wallet.type)}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="p-1.5 rounded hover:bg-black/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDeleteWallet(wallet.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-[var(--color-red)]"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}

          {adding && (
            <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-[var(--color-border)] rounded-lg">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Wallet name"
                className="flex-1 px-2.5 py-1.5 border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
                autoFocus
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="px-2.5 py-1.5 border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                {WALLET_TYPES.map((wt) => (
                  <option key={wt.value} value={wt.value}>{wt.label}</option>
                ))}
              </select>
              <button onClick={handleAdd} className="p-1.5 rounded hover:bg-green-50 text-[var(--color-green)]">
                <Check size={16} />
              </button>
              <button onClick={handleCancel} className="p-1.5 rounded hover:bg-red-50 text-[var(--color-text-muted)]">
                <X size={16} />
              </button>
            </div>
          )}

          {wallets.length === 0 && !adding && (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-6">
              No wallets yet. Add one to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
