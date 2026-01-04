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
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="p-8 rounded-3xl glass border border-white/10 shadow-2xl">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"
          >
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </motion.div>

          {/* Title */}
          <h1 className="font-display text-2xl font-bold text-white text-center mb-3">
            Something went wrong
          </h1>

          {/* Message */}
          <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
            We encountered an unexpected error. Don't worry, your data is safe and processed locally in your browser.
          </p>

          {/* Error details (collapsible) */}
          {error && (
            <details className="mb-6">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors mb-2">
                Technical details
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-dark-700/50 border border-white/5">
                <p className="text-xs text-red-400 font-mono break-all">
                  {error.toString()}
                </p>
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={onReset}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm bg-dark-600/50 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>

            <motion.button
              onClick={onGoHome}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white shadow-lg shadow-accent-500/25 transition-all duration-300 flex items-center justify-center gap-2"
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

