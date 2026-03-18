import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { login, resetPassword } from '../lib/auth'

export default function LoginPage({ onNavigate, onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      onAuth(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetRequest = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)
    try {
      await resetPassword(resetEmail)
      setResetSent(true)
    } catch (err) {
      setResetError(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-[var(--color-bg)] flex flex-col">
      {/* Back to home */}
      <div className="px-6 sm:px-12 py-5">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <div className="w-3 h-3 bg-[var(--color-accent)] rounded-sm" />
          <span className="font-semibold tracking-wider text-[var(--color-text-primary)]">FINTRACK</span>
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          {!forgotMode ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Welcome back</h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to your account</p>
              </div>

              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">EMAIL</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider">PASSWORD</label>
                      <button
                        type="button"
                        onClick={() => { setForgotMode(true); setResetEmail(email) }}
                        className="text-xs text-[var(--color-accent)] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
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

                  {error && (
                    <p className="text-xs font-medium text-[var(--color-red)]">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Sign In
                  </button>
                </form>
              </div>

              <p className="text-center text-sm text-[var(--color-text-secondary)] mt-5">
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('register')}
                  className="text-[var(--color-accent)] font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Reset password</h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {resetSent ? 'Check your email for the reset link.' : "We'll send a reset link to your email."}
                </p>
              </div>

              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
                {resetSent ? (
                  <div className="flex flex-col items-center gap-4 py-2">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-green)]/10 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] text-center">
                      Reset link sent to <span className="font-medium text-[var(--color-text-primary)]">{resetEmail}</span>
                    </p>
                    <button
                      onClick={() => { setForgotMode(false); setResetSent(false) }}
                      className="text-sm text-[var(--color-accent)] hover:underline"
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">EMAIL</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    {resetError && (
                      <p className="text-xs font-medium text-[var(--color-red)]">{resetError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-2.5 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {resetLoading && <Loader2 size={16} className="animate-spin" />}
                      Send Reset Link
                    </button>

                    <button
                      type="button"
                      onClick={() => setForgotMode(false)}
                      className="text-sm text-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      Back to sign in
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
