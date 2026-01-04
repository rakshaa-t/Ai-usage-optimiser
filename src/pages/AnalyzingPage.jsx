import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Zap, BarChart3, Lightbulb } from 'lucide-react'

const analysisSteps = [
  { icon: Brain, label: 'Processing data...', color: '#F97CF5' },
  { icon: BarChart3, label: 'Analyzing patterns...', color: '#A855F7' },
  { icon: Zap, label: 'Calculating costs...', color: '#8B5CF6' },
  { icon: Lightbulb, label: 'Generating insights...', color: '#7C3AED' },
]

export default function AnalyzingPage({ file, onAnalysisComplete }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < analysisSteps.length - 1) return prev + 1
        return prev
      })
    }, 800)

    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(stepInterval)
          setTimeout(() => navigate('/dashboard'), 500)
          return 100
        }
        return prev + 2
      })
    }, 60)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [navigate])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
      {/* Main animation container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated orb */}
        <div className="relative w-48 h-48 mx-auto mb-12">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-accent-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Middle ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-accent-400/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Inner glow */}
          <motion.div
            className="absolute inset-8 rounded-full bg-gradient-to-br from-accent-500/20 to-accent-600/20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Center icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            key={currentStep}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            {(() => {
              const Icon = analysisSteps[currentStep].icon
              return (
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${analysisSteps[currentStep].color}20`,
                    boxShadow: `0 0 40px ${analysisSteps[currentStep].color}40`
                  }}
                >
                  <Icon 
                    className="w-8 h-8" 
                    style={{ color: analysisSteps[currentStep].color }}
                  />
                </div>
              )
            })()}
          </motion.div>
          
          {/* Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-accent-400"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos((i * Math.PI) / 4) * 80],
                y: [0, Math.sin((i * Math.PI) / 4) * 80],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Status text */}
        <motion.h2
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-semibold text-white mb-4"
        >
          {analysisSteps[currentStep].label}
        </motion.h2>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-gray-500 text-sm mt-3">{progress}% complete</p>
        </div>

        {/* File info */}
        {file && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 text-sm mt-8"
          >
            Analyzing: {file.name}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
