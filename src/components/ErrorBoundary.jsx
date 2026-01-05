import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    this.handleReset()
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error} 
        onReset={this.handleReset}
        onGoHome={this.handleGoHome}
      />
    }

    return this.props.children
  }
}

function ErrorFallback({ error, onReset, onGoHome }) {

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-neu-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="p-8 rounded-2xl shadow-neu bg-neu-bg">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-neu-inset bg-neu-bg flex items-center justify-center"
          >
            <AlertTriangle className="w-10 h-10 text-coral-500" />
          </motion.div>

          {/* Title */}
          <h1 className="font-display text-2xl font-bold text-text-primary text-center mb-3">
            Something went wrong
          </h1>

          {/* Message */}
          <p className="text-text-secondary text-sm text-center mb-6 leading-relaxed">
            We encountered an unexpected error. Don't worry, your data is safe and processed locally in your browser.
          </p>

          {/* Error details (collapsible) */}
          {error && (
            <details className="mb-6">
              <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary transition-colors mb-2">
                Technical details
              </summary>
              <div className="mt-2 p-3 rounded-2xl shadow-neu-inset-sm bg-neu-bg">
                <p className="text-xs text-coral-500 font-mono break-all">
                  {error.toString()}
                </p>
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={onReset}
              className="neu-btn flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>

            <motion.button
              onClick={onGoHome}
              className="neu-btn-primary flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-4 h-4" />
              Go Home
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ErrorBoundary

