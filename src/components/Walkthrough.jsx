import { useState, useEffect, useCallback } from 'react'

const STEPS = [
  {
    title: 'Welcome to FinTrack!',
    description: "Let's take a quick tour to help you get started.",
    targetId: null,
  },
  {
    title: 'Financial Overview',
    description: 'Track your income, expenses, balance, and savings rate at a glance.',
    targetId: 'stats-cards',
    position: 'bottom',
  },
  {
    title: 'Add Transactions',
    description: 'Record your spending manually or scan a receipt to auto-fill.',
    targetId: 'btn-add-transaction',
    position: 'bottom',
    page: 'transactions',
  },
  {
    title: 'Manage Wallets',
    description: 'Set up your payment methods — e-wallets, cards, savings, and more.',
    targetId: 'nav-wallets',
    position: 'right',
  },
  {
    title: "You're all set!",
    description: 'Start tracking your finances. You can always explore more features as you go.',
    targetId: null,
  },
]

export default function Walkthrough({ step, onNext, onSkip, onNavigate }) {
  const [rect, setRect] = useState(null)
  const current = STEPS[step]

  const measure = useCallback(() => {
    if (!current?.targetId) {
      setRect(null)
      return
    }
    const el = document.getElementById(current.targetId)
    if (el) {
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    } else {
      setRect(null)
    }
  }, [current])

  useEffect(() => {
    if (current?.page && onNavigate) {
      onNavigate(current.page)
    }
  }, [step])

  useEffect(() => {
    const timer = setTimeout(measure, 100)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  if (!current) return null

  const isCenter = !current.targetId || !rect
  const isLast = step === STEPS.length - 1
  const padding = 8

  const tooltipStyle = {}
  if (!isCenter && rect) {
    const pos = current.position || 'bottom'
    if (pos === 'bottom') {
      tooltipStyle.top = rect.top + rect.height + padding + 12
      tooltipStyle.left = Math.max(16, rect.left + rect.width / 2 - 160)
    } else if (pos === 'right') {
      tooltipStyle.top = rect.top + rect.height / 2 - 60
      tooltipStyle.left = rect.left + rect.width + padding + 12
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - padding}
                y={rect.top - padding}
                width={rect.width + padding * 2}
                height={rect.height + padding * 2}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: 'all' }}
          onClick={onSkip}
        />
      </svg>

      {/* Spotlight border ring */}
      {rect && (
        <div
          className="absolute border-2 border-[var(--color-accent)] rounded-xl pointer-events-none"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className={`absolute bg-[var(--color-card)] rounded-xl shadow-2xl p-5 w-[320px] ${isCenter ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
        style={isCenter ? {} : tooltipStyle}
      >
        <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1.5">{current.title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">{current.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">{step + 1} of {STEPS.length}</span>
          <div className="flex gap-2">
            {!isLast && (
              <button
                onClick={onSkip}
                className="px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Skip
              </button>
            )}
            <button
              onClick={isLast ? onSkip : onNext}
              className="px-4 py-1.5 bg-[var(--color-accent)] text-white rounded-lg text-xs font-semibold hover:opacity-90"
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
