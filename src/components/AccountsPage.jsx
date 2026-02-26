import { useState } from 'react'
import { Eye, EyeOff, Check, User, AlertTriangle } from 'lucide-react'
import { updateProfile } from '../lib/auth'
import { resetAllData } from '../lib/storage'
import ConfirmModal from './ConfirmModal'

function PasswordInput({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

export default function AccountsPage({ user, onUserUpdate }) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' })

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  const handleProfileSave = async () => {
    setProfileError('')
    try {
      const updated = await updateProfile({ name, email })
      onUserUpdate(updated)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch (err) {
      setProfileError(err.message)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setPwdMessage({ type: '', text: '' })

    if (newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    try {
      await updateProfile({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwdMessage({ type: 'success', text: 'Password updated successfully.' })
      setTimeout(() => setPwdMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setPwdMessage({ type: 'error', text: err.message })
    }
  }

  const handleReset = () => {
    resetAllData()
    window.location.reload()
  }

  return (
    <div className="max-w-[600px]">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Account</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">Manage your profile and security</p>

      {/* Profile Information */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <User size={20} className="text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Profile Information</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Your personal details</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">FULL NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider mb-1.5">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {profileError && (
            <p className="text-xs font-medium text-[var(--color-red)]">{profileError}</p>
          )}

          <button
            onClick={handleProfileSave}
            className={`self-end px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
              profileSaved ? 'bg-[var(--color-green)]' : 'bg-[var(--color-text-primary)] hover:opacity-90'
            }`}
          >
            {profileSaved ? (
              <span className="flex items-center gap-1"><Check size={16} /> Saved</span>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 mb-4">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Change Password</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5">Update your account password</p>

        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
          <PasswordInput
            label="CURRENT PASSWORD"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
          <PasswordInput
            label="NEW PASSWORD"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <PasswordInput
            label="CONFIRM NEW PASSWORD"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />

          {pwdMessage.text && (
            <p className={`text-xs font-medium ${
              pwdMessage.type === 'error' ? 'text-[var(--color-red)]' : 'text-[var(--color-green)]'
            }`}>
              {pwdMessage.text}
            </p>
          )}

          <button
            type="submit"
            className="self-end px-5 py-2.5 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-[var(--color-card)] border border-[var(--color-red)]/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={18} className="text-[var(--color-red)]" />
          <h3 className="text-base font-semibold text-[var(--color-red)]">Danger Zone</h3>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          This will permanently delete all your transactions, account data, and settings. This action cannot be undone.
        </p>
        <button
          onClick={() => setResetConfirmOpen(true)}
          className="px-5 py-2.5 border border-[var(--color-red)] text-[var(--color-red)] rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Reset Account
        </button>
      </div>

      <ConfirmModal
        open={resetConfirmOpen}
        title="Reset Account"
        message="This will permanently delete all your transactions, profile data, and settings. Are you sure?"
        confirmLabel="Reset Everything"
        onConfirm={handleReset}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  )
}
