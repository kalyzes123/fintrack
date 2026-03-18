import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { updatePassword } from '../lib/auth'

export default function ResetPasswordPage({ onNavigate }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-[var(--color-bg)] flex flex-col">
      <div className="px-6 sm:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--color-accent)] rounded-sm" />
          <span className="font-semibold tracking-wider text-[var(--color-text-primary)]">FINTRACK</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Set new password</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {done ? 'Your password has been updated.' : 'Choose a new password for your account.'}
            </p>
          </div>

          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
            {done ? (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-12 h-12 rounded-full bg-[var(--color-green)]/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] text-center">Password updated successfully!</p>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-2.5 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">NEW PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className="w-full px-3 py-2.5 pr-10 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                {error && <p className="text-xs font-medium text-[var(--color-red)]">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
