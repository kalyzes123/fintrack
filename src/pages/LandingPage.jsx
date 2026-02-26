import { BarChart3, Camera, PieChart } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Track Spending',
    desc: 'Monitor your income and expenses with a beautiful dashboard. See where your money goes at a glance.',
  },
  {
    icon: Camera,
    title: 'Scan Receipts',
    desc: 'Snap a photo of your receipt and let our OCR technology automatically extract the details.',
  },
  {
    icon: PieChart,
    title: 'Financial Insights',
    desc: 'Get breakdowns by category, track savings rate, and visualize your spending trends over time.',
  },
]

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 sm:px-12 py-5 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--color-accent)] rounded-sm" />
          <span className="text-[var(--color-text-primary)] font-semibold tracking-wider text-sm">FINTRACK</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:opacity-70 transition-opacity"
          >
            Log in
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-5 py-2 bg-[var(--color-text-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 sm:px-12 pt-16 sm:pt-24 pb-20 max-w-[1200px] mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] leading-tight max-w-[700px] mx-auto">
          Take control of your <span className="text-[var(--color-accent)]">finances</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-[var(--color-text-secondary)] max-w-[500px] mx-auto leading-relaxed">
          Track spending, scan receipts, and gain insights into your financial health — all in one simple dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('register')}
            className="px-7 py-3 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start for free
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-7 py-3 border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-semibold rounded-lg hover:bg-white transition-colors"
          >
            Sign in
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 sm:px-12 pb-24 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-7 hover:shadow-sm transition-shadow"
            >
              <div className="w-11 h-11 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center mb-4">
                <f.icon size={22} className="text-[var(--color-accent)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-6 sm:px-12 py-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-sm" />
            <span className="text-xs font-medium text-[var(--color-text-muted)] tracking-wider">FINTRACK</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">&copy; 2026 FinTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
