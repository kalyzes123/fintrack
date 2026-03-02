import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { WALLET_TYPES, MALAYSIAN_BANKS } from '../lib/storage'

const inputCls =
  'w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]'
const labelCls = 'block text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] mb-1'

function WalletForm({ form, setForm, onSave, onCancel, saveLabel, isDashed }) {
  const handleTypeChange = (newType) => {
    setForm({ ...form, type: newType, name: newType === 'bank' ? MALAYSIAN_BANKS[0] : '' })
  }

  return (
    <div
      className={`rounded-lg p-4 flex flex-col gap-3 border ${
        isDashed ? 'border-2 border-dashed border-[var(--color-border)]' : 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5'
      }`}
    >
      {/* Row 1: Name */}
      <div>
        <label className={labelCls}>WALLET NAME</label>
        {form.type === 'bank' ? (
          <select
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
            autoFocus
          >
            {MALAYSIAN_BANKS.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. My Wallet"
            className={inputCls}
            autoFocus
          />
        )}
      </div>

      {/* Row 2: Type + Balance */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>TYPE</label>
          <select
            value={form.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={inputCls}
          >
            {WALLET_TYPES.map((wt) => (
              <option key={wt.value} value={wt.value}>{wt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>BALANCE (RM)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
            placeholder="0.00"
            className={inputCls}
          />
        </div>
      </div>

      {/* Row 3: Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-black/5"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage({ wallets, onAddWallet, onUpdateWallet, onDeleteWallet }) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'cash', balance: '' })

  const handleAdd = () => {
    if (!form.name.trim()) return
    onAddWallet({ name: form.name.trim(), type: form.type, balance: parseFloat(form.balance) || 0 })
    setForm({ name: '', type: 'cash', balance: '' })
    setAdding(false)
  }

  const handleEdit = (wallet) => {
    setEditingId(wallet.id)
    setAdding(false)
    setForm({ name: wallet.name, type: wallet.type, balance: wallet.balance != null ? String(wallet.balance) : '' })
  }

  const handleUpdate = () => {
    if (!form.name.trim()) return
    onUpdateWallet(editingId, { name: form.name.trim(), type: form.type, balance: parseFloat(form.balance) || 0 })
    setEditingId(null)
    setForm({ name: '', type: 'cash', balance: '' })
  }

  const handleCancel = () => {
    setAdding(false)
    setEditingId(null)
    setForm({ name: '', type: 'cash', balance: '' })
  }

  const getTypeLabel = (value) => {
    const t = WALLET_TYPES.find((wt) => wt.value === value)
    return t ? t.label : value
  }

  return (
    <div className="max-w-[640px]">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Wallets</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">Manage your payment methods</p>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Wallets</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Manage your payment methods</p>
          </div>
          {!adding && !editingId && (
            <button
              onClick={() => { setAdding(true); setEditingId(null); setForm({ name: '', type: 'cash', balance: '' }) }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-text-primary)] text-white rounded-lg text-xs font-medium hover:opacity-90 shrink-0"
            >
              <Plus size={14} />
              <span>Add Wallet</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {wallets.map((wallet) => (
            <div key={wallet.id}>
              {editingId === wallet.id ? (
                <WalletForm
                  form={form}
                  setForm={setForm}
                  onSave={handleUpdate}
                  onCancel={handleCancel}
                  saveLabel="Save Changes"
                  isDashed={false}
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 border border-[var(--color-border)] rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{wallet.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{getTypeLabel(wallet.type)}</p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] shrink-0 mr-1">
                    RM {(wallet.balance ?? 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="p-1.5 rounded hover:bg-black/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDeleteWallet(wallet.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-[var(--color-red)] shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {adding && (
            <WalletForm
              form={form}
              setForm={setForm}
              onSave={handleAdd}
              onCancel={handleCancel}
              saveLabel="Add Wallet"
              isDashed
            />
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
