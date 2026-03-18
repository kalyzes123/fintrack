import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-[var(--color-bg)] p-8">
          <div className="max-w-md w-full text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-[var(--color-accent)] rounded-sm" />
              <span className="text-[var(--color-text-primary)] font-semibold tracking-wider text-sm">FINTRACK</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Something went wrong</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[var(--color-text-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
