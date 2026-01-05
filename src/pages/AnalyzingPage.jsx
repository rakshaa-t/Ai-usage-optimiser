import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Zap, BarChart3, Lightbulb } from 'lucide-react'

const analysisSteps = [
  { icon: Brain, label: 'Processing data...', color: '#FF6B6B' },
  { icon: BarChart3, label: 'Analyzing patterns...', color: '#4ECDC4' },
  { icon: Zap, label: 'Calculating costs...', color: '#45B7D1' },
  { icon: Lightbulb, label: 'Generating insights...', color: '#96CEB4' },
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
          setTimeout(() => navigate('/story'), 500)
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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-neu-bg">
      {/* Main animation container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Neumorphic animated container */}
        <div className="relative w-48 h-48 mx-auto mb-12">
          {/* Outer neumorphic ring */}
          <div
            className="absolute inset-0 rounded-full bg-neu-bg"
            style={{
              boxShadow: '8px 8px 16px #d1cec9, -8px -8px 16px #ffffff',
            }}
          />

          {/* Inner inset ring */}
          <div
            className="absolute inset-6 rounded-full bg-neu-bg"
            style={{
              boxShadow: 'inset 4px 4px 8px #d1cec9, inset -4px -4px 8px #ffffff',
            }}
          />

          {/* Rotating accent ring */}
          <motion.div
            className="absolute inset-3 rounded-full"
            style={{
              border: '2px dashed #d1cec9',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center icon container */}
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
                  className="w-16 h-16 rounded-2xl flex items-center justify-center bg-neu-bg"
                  style={{
                    boxShadow: `4px 4px 8px #d1cec9, -4px -4px 8px #ffffff, 0 0 20px ${analysisSteps[currentStep].color}30`,
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

          {/* Subtle dots around the circle */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                backgroundColor: analysisSteps[currentStep].color,
                opacity: 0.4,
              }}
              animate={{
                x: Math.cos((i * Math.PI) / 4) * 72 - 4,
                y: Math.sin((i * Math.PI) / 4) * 72 - 4,
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                opacity: {
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                },
              }}
            />
          ))}
        </div>

        {/* Status text */}
        <motion.h2
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-semibold text-text-primary mb-4"
        >
          {analysisSteps[currentStep].label}
        </motion.h2>

        {/* Neumorphic progress bar */}
        <div className="w-64 mx-auto">
          <div
            className="h-3 rounded-full overflow-hidden bg-neu-bg"
            style={{
              boxShadow: 'inset 3px 3px 6px #d1cec9, inset -3px -3px 6px #ffffff',
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${analysisSteps[currentStep].color}, ${analysisSteps[Math.min(currentStep + 1, analysisSteps.length - 1)].color})`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-text-muted text-sm mt-3">{progress}% complete</p>
        </div>

        {/* File info */}
        {file && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-text-muted text-sm mt-8"
          >
            Analyzing: {file.name}
          </motion.p>
        )}

        {/* Step indicators */}
        <div className="flex justify-center gap-3 mt-8">
          {analysisSteps.map((step, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'scale-100' : 'scale-75 opacity-40'
              }`}
              style={{
                backgroundColor: index <= currentStep ? step.color : '#d1cec9',
                boxShadow: index <= currentStep
                  ? `0 0 8px ${step.color}60`
                  : 'none',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
