import { useState, useEffect, useRef } from 'react'
import { X, Camera, Loader2 } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CATEGORIES } from '../lib/storage'
import { scanReceipt } from '../lib/receipt'

const defaultForm = {
  description: '',
  category: 'Other',
  date: new Date().toISOString().split('T')[0],
  amount: '',
  type: 'expense',
  status: 'complete',
  wallet: '',
}

export default function TransactionModal({ open, onClose, onSave, transaction, wallets = [] }) {
  const [form, setForm] = useState(defaultForm)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        amount: String(transaction.amount),
        type: transaction.type,
        status: transaction.status,
        wallet: transaction.wallet || (wallets.length > 0 ? wallets[0].id : ''),
      })
    } else {
      setForm({ ...defaultForm, wallet: wallets.length > 0 ? wallets[0].id : '' })
    }
    setScanError('')
    setErrors({})
  }, [transaction, open])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.description) {
      newErrors.description = 'Please enter a description.'
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount.'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    onSave({
      ...form,
      amount: parseFloat(form.amount),
    })
    onClose()
  }

  const handleScanReceipt = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setScanError('')
    try {
      const result = await scanReceipt(file)
      setForm((prev) => ({
        ...prev,
        description: result.description || prev.description,
        amount: result.amount != null ? String(result.amount) : prev.amount,
        date: result.date || prev.date,
        category: CATEGORIES.includes(result.category) ? result.category : prev.category,
        type: 'expense',
      }))
    } catch (err) {
      setScanError(err.message || 'Failed to scan receipt.')
    } finally {
      setScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--color-card)] rounded-xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Scan Receipt button */}
          {!transaction && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleScanReceipt}
              />
              <button
                type="button"
                disabled={scanning}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Scanning receipt...
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    Scan Receipt
                  </>
                )}
              </button>
              {scanError && (
                <p className="text-xs text-[var(--color-red)] mt-2">{scanError}</p>
              )}
              <p className="text-[11px] text-[var(--color-accent)] mt-2 text-center bg-[var(--color-accent)]/10 rounded-md px-3 py-1.5">
                * Scanned values may not be 100% accurate. Please verify before saving.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">DESCRIPTION</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors((prev) => ({ ...prev, description: '' })) }}
              placeholder="e.g. Whole Foods Market"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)] ${errors.description ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}
            />
            {errors.description && (
              <p className="text-[11px] text-[var(--color-accent)] mt-1">{errors.description}</p>
            )}
          </div>

          {/* Amount + Type row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">AMOUNT</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => { setForm({ ...form, amount: e.target.value }); setErrors((prev) => ({ ...prev, amount: '' })) }}
                placeholder="0.00"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)] ${errors.amount ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}
              />
              {errors.amount && (
                <p className="text-[11px] text-[var(--color-accent)] mt-1">{errors.amount}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">TYPE</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          {/* Category + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">CATEGORY</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">DATE</label>
              <DatePicker
                selected={(() => { const d = form.date ? new Date(form.date + 'T00:00:00') : new Date(); return isNaN(d.getTime()) ? new Date() : d })()}
                onChange={(date) => {
                  if (date) {
                    const y = date.getFullYear()
                    const m = String(date.getMonth() + 1).padStart(2, '0')
                    const d = String(date.getDate()).padStart(2, '0')
                    setForm({ ...form, date: `${y}-${m}-${d}` })
                  }
                }}
                dateFormat="dd MMM yyyy"
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          {/* Wallet + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">WALLET</label>
              <select
                value={form.wallet}
                onChange={(e) => setForm({ ...form, wallet: e.target.value })}
                className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">STATUS</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="complete">Complete</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              {transaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
