export default function SettingsPage() {
  return (
    <div className="max-w-[600px]">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Settings</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">Configure your FinTrack preferences</p>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Receipt Scanning</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          Receipt scanning is powered by Tesseract OCR running on your local server. No API keys required.
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-green)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">Backend OCR service (localhost:3001)</span>
        </div>
      </div>
    </div>
  )
}
