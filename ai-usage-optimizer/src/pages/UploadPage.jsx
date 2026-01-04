import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Sparkles, ArrowRight } from 'lucide-react'
import TiltCard from '../components/TiltCard'
import Papa from 'papaparse'

export default function UploadPage({ onFileUpload, onAnalysisComplete }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const processFile = useCallback((file) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setError(null)
    setUploadedFile(file)
    onFileUpload?.(file)
  }, [onFileUpload])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }, [processFile])

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }, [processFile])

  const handleAnalyze = useCallback(() => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    
    Papa.parse(uploadedFile, {
      header: true,
      complete: (results) => {
        // Process the data
        const data = results.data.filter(row => Object.values(row).some(v => v))
        
        // Calculate mock analysis (replace with real logic)
        const analysis = {
          totalSpent: 229,
          totalRequests: data.length || 1250,
          models: [
            { name: 'GPT-4', usage: 45, cost: 103.05, color: '#F97CF5', requests: 562 },
            { name: 'GPT-3.5', usage: 30, cost: 68.70, color: '#A855F7', requests: 375 },
            { name: 'Claude', usage: 25, cost: 57.25, color: '#8B5CF6', requests: 313 },
          ],
          recommendations: [
            { 
              title: 'Switch to GPT-3.5 for simple tasks',
              description: 'Analysis shows 40% of your GPT-4 queries are simple enough for GPT-3.5',
              savings: 45,
              impact: 'high'
            },
            { 
              title: 'Batch similar requests',
              description: 'Combine sequential similar queries to reduce API overhead',
              savings: 28,
              impact: 'medium'
            },
            { 
              title: 'Cache repeated queries',
              description: '15% of your queries are identical and could be cached',
              savings: 22,
              impact: 'medium'
            },
            { 
              title: 'Optimize prompt length',
              description: 'Reduce average prompt length by removing redundant context',
              savings: 15,
              impact: 'low'
            },
          ],
          weeklyUsage: [
            { day: 'Mon', requests: 180, cost: 32 },
            { day: 'Tue', requests: 220, cost: 41 },
            { day: 'Wed', requests: 195, cost: 35 },
            { day: 'Thu', requests: 240, cost: 45 },
            { day: 'Fri', requests: 200, cost: 38 },
            { day: 'Sat', requests: 110, cost: 20 },
            { day: 'Sun', requests: 105, cost: 18 },
          ],
          potentialSavings: 110,
        }
        
        onAnalysisComplete?.(analysis)
        navigate('/analyzing')
      },
      error: (err) => {
        setError('Failed to parse CSV file')
        setIsProcessing(false)
      }
    })
  }, [uploadedFile, onAnalysisComplete, navigate])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span className="text-sm text-gray-300">AI-Powered Analysis</span>
        </motion.div>
        
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
          <span className="text-white">AI Usage </span>
          <span className="text-gradient">Optimizer</span>
        </h1>
        
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Upload your API usage data and discover opportunities to reduce costs and optimize performance
        </p>
      </motion.div>

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-lg"
      >
        <TiltCard tiltAmount={12} glowIntensity={0.5}>
          <div
            className={`
              relative p-8 md:p-12 transition-all duration-300
              ${isDragging ? 'bg-accent-500/10' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {!uploadedFile ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  {/* Upload icon */}
                  <motion.div
                    className={`
                      w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
                      ${isDragging 
                        ? 'bg-accent-500/20 border-accent-400' 
                        : 'bg-dark-600/50 border-white/10'
                      }
                      border-2 border-dashed transition-colors duration-300
                    `}
                    animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                  >
                    <Upload 
                      className={`w-8 h-8 transition-colors duration-300 ${
                        isDragging ? 'text-accent-400' : 'text-gray-400'
                      }`}
                    />
                  </motion.div>

                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    {isDragging ? 'Drop your file here' : 'Upload Usage Data'}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-6">
                    Drag & drop your CSV file or click to browse
                  </p>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="
                      px-6 py-3 rounded-xl font-medium text-sm
                      bg-gradient-to-r from-accent-600 to-accent-500
                      hover:from-accent-500 hover:to-accent-400
                      text-white shadow-lg shadow-accent-500/25
                      transition-all duration-300 hover:shadow-accent-500/40
                      hover:scale-105 active:scale-95
                    "
                  >
                    Select CSV File
                  </button>

                  <p className="text-gray-500 text-xs mt-4">
                    Supports OpenAI, Anthropic, and other provider exports
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="uploaded"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center"
                >
                  {/* File icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent-500/20 border border-accent-400/30 flex items-center justify-center"
                  >
                    <FileText className="w-8 h-8 text-accent-400" />
                  </motion.div>

                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    File Ready
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-1">
                    {uploadedFile.name}
                  </p>
                  
                  <p className="text-gray-500 text-xs mb-6">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setUploadedFile(null)
                        onFileUpload?.(null)
                      }}
                      className="
                        px-5 py-2.5 rounded-xl font-medium text-sm
                        bg-dark-600/50 border border-white/10
                        text-gray-300 hover:text-white hover:border-white/20
                        transition-all duration-300
                      "
                    >
                      Change File
                    </button>
                    
                    <button
                      onClick={handleAnalyze}
                      disabled={isProcessing}
                      className="
                        px-6 py-2.5 rounded-xl font-medium text-sm
                        bg-gradient-to-r from-accent-600 to-accent-500
                        hover:from-accent-500 hover:to-accent-400
                        text-white shadow-lg shadow-accent-500/25
                        transition-all duration-300 hover:shadow-accent-500/40
                        hover:scale-105 active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center gap-2
                      "
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          Analyze
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm text-center mt-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </TiltCard>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-500"
      >
        {['Cost Analysis', 'Model Comparison', 'Smart Recommendations'].map((feature, i) => (
          <div key={feature} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            {feature}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
