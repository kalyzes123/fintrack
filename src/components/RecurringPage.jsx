import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { CATEGORIES } from '../lib/storage'
import ConfirmModal from './ConfirmModal'
import { formatDate } from '../lib/utils'

const inputCls =
  'w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]'
const labelCls = 'block text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] mb-1'

const defaultForm = {
  description: '',
  amount: '',
  type: 'expense',
  category: 'Other',
  wallet: '',
  frequency: 'monthly',
  next_due: new Date().toISOString().split('T')[0],
}

function RuleForm({ form, setForm, onSave, onCancel, saveLabel, wallets, isDashed, error }) {
  const handleTypeChange = (newType) => {
    setForm({ ...form, type: newType, category: newType === 'income' ? 'Income' : 'Other' })
  }

  return (
    <div
      className={`rounded-lg p-4 flex flex-col gap-3 border ${
        isDashed
          ? 'border-2 border-dashed border-[var(--color-border)]'
          : 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5'
      }`}
    >
      <div>
        <label className={labelCls}>DESCRIPTION</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g. Monthly Salary"
          className={inputCls}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>AMOUNT (RM)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>TYPE</label>
          <select
            value={form.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={inputCls}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>CATEGORY</label>
          <select
            value={form.type === 'income' ? 'Income' : form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            disabled={form.type === 'income'}
            className={`${inputCls} ${form.type === 'income' ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>WALLET</label>
          <select
            value={form.wallet}
            onChange={(e) => setForm({ ...form, wallet: e.target.value })}
            className={inputCls}
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>FREQUENCY</label>
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className={inputCls}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>NEXT DUE</label>
          <input
            type="date"
            value={form.next_due}
            onChange={(e) => setForm({ ...form, next_due: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {error && <p className="text-xs text-[var(--color-red)]">{error}</p>}

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

const FREQ_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }

export default function RecurringPage({ recurring, wallets, onAdd, onUpdate, onDelete }) {
  const defaultWithWallet = { ...defaultForm, wallet: wallets[0]?.id || '' }
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultWithWallet)
  const [saveError, setSaveError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleAdd = async () => {
    if (!form.description.trim() || !form.amount) {
      setSaveError('Please fill in description and amount.')
      return
    }
    setSaveError('')
    try {
      await onAdd({
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.type === 'income' ? 'Income' : form.category,
        wallet: form.wallet,
        frequency: form.frequency,
        next_due: form.next_due,
        active: true,
      })
      setForm(defaultWithWallet)
      setAdding(false)
    } catch (err) {
      setSaveError(err.message || 'Failed to add rule.')
    }
  }

  const handleEdit = (rule) => {
    setEditingId(rule.id)
    setAdding(false)
    setSaveError('')
    setForm({
      description: rule.description,
      amount: String(rule.amount),
      type: rule.type,
      category: rule.category,
      wallet: rule.wallet || wallets[0]?.id || '',
      frequency: rule.frequency,
      next_due: rule.next_due,
    })
  }

  const handleUpdate = async () => {
    if (!form.description.trim() || !form.amount) {
      setSaveError('Please fill in description and amount.')
      return
    }
    setSaveError('')
    try {
      await onUpdate(editingId, {
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.type === 'income' ? 'Income' : form.category,
        wallet: form.wallet,
        frequency: form.frequency,
        next_due: form.next_due,
      })
      setEditingId(null)
      setForm(defaultWithWallet)
    } catch (err) {
      setSaveError(err.message || 'Failed to update rule.')
    }
  }

  const handleCancel = () => {
    setAdding(false)
    setEditingId(null)
    setSaveError('')
    setForm(defaultWithWallet)
  }

  return (
    <div className="max-w-[640px]">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Recurring</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">Auto-log regular income & expenses</p>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Rules</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Logged automatically on app open when due
            </p>
          </div>
          {!adding && !editingId && (
            <button
              onClick={() => {
                setAdding(true)
                setEditingId(null)
                setForm(defaultWithWallet)
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-text-primary)] text-white rounded-lg text-xs font-medium hover:opacity-90 shrink-0"
            >
              <Plus size={14} />
              <span>Add Rule</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {recurring.map((rule) => (
            <div key={rule.id}>
              {editingId === rule.id ? (
                <RuleForm
                  form={form}
                  setForm={setForm}
                  onSave={handleUpdate}
                  onCancel={handleCancel}
                  saveLabel="Save Changes"
                  wallets={wallets}
                  isDashed={false}
                  error={saveError}
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 border border-[var(--color-border)] rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {rule.description}
                      </p>
                      <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] shrink-0">
                        {(FREQ_LABELS[rule.frequency] || rule.frequency).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      Next: {formatDate(rule.next_due)}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-semibold shrink-0 ${
                      rule.type === 'income' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
                    }`}
                  >
                    {rule.type === 'income' ? '+' : '-'}RM
                    {Number(rule.amount).toLocaleString('en-MY', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>

                  {/* Active toggle */}
                  <button
                    onClick={() => onUpdate(rule.id, { active: !rule.active })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
                      rule.active ? 'bg-[var(--color-green)]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                        rule.active ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-1.5 rounded hover:bg-black/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(rule)}
                    className="p-1.5 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-[var(--color-red)] shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {adding && (
            <RuleForm
              form={form}
              setForm={setForm}
              onSave={handleAdd}
              onCancel={handleCancel}
              saveLabel="Add Rule"
              wallets={wallets}
              isDashed
              error={saveError}
            />
          )}

          {recurring.length === 0 && !adding && (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-6">
              No recurring rules yet. Add one to get started!
            </p>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Rule"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.description}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={() => {
          onDelete(deleteTarget.id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
