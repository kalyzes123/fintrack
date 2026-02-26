import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-[var(--color-card)] rounded-xl w-full max-w-sm shadow-xl animate-[fadeIn_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-[var(--color-red)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            {title}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex border-t border-[var(--color-border)]">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-black/[0.03] rounded-bl-xl transition-colors"
          >
            Cancel
          </button>
          <div className="w-px bg-[var(--color-border)]" />
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-sm font-semibold text-[var(--color-red)] hover:bg-red-50 rounded-br-xl transition-colors"
          >
            {confirmLabel || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
