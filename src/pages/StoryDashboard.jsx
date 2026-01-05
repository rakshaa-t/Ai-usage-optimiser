import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Zap,
  Brain,
  TrendingDown,
  Sparkles,
  Download,
  RotateCcw,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import PieChart from '../components/PieChart'
import UsageChart from '../components/UsageChart'

// Animated number that counts up
function CountUp({ value, prefix = '', suffix = '', duration = 2000, decimals = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const end = parseFloat(value)
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, value, duration])

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}{suffix}
    </span>
  )
}

// Single slide wrapper with scroll-snap
function Slide({ children, className = '', bgGlow }) {
  return (
    <section className={`
      min-h-screen w-full snap-start snap-always
      flex flex-col items-center justify-center
      px-6 py-12 relative overflow-hidden
      ${className}
    `}>
      {/* Optional background glow */}
      {bgGlow && (
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: bgGlow }}
        />
      )}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {children}
      </div>
    </section>
  )
}

// Staggered text reveal
function RevealText({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function StoryDashboard({ data }) {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [collectedSavings, setCollectedSavings] = useState(0)
  const [showSavingsPopup, setShowSavingsPopup] = useState(false)

  // Default data fallback
  const analysis = data || {
    totalSpent: 229,
    totalRequests: 1250,
    potentialSavings: 110,
    models: [
      { name: 'GPT-4', usage: 45, cost: 103, color: '#F97CF5', requests: 562 },
      { name: 'GPT-3.5', usage: 30, cost: 69, color: '#A855F7', requests: 375 },
      { name: 'Claude', usage: 25, cost: 57, color: '#8B5CF6', requests: 313 },
    ],
    recommendations: [
      { title: 'Switch to lighter models', description: 'Use GPT-3.5 for simple tasks', savings: 45, impact: 'high' },
      { title: 'Cache repeated queries', description: '15% of queries are duplicates', savings: 28, impact: 'medium' },
      { title: 'Optimize prompts', description: 'Reduce token usage by 20%', savings: 22, impact: 'medium' },
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
    extendedThinking: { count: 0, cost: 0, percentage: 0 },
    timePeriod: null,
    filesAnalyzed: 1
  }

  // Calculate derived values
  const topModel = analysis.models[0]
  const busiestDay = analysis.weeklyUsage.reduce((max, day) =>
    day.requests > max.requests ? day : max
  , analysis.weeklyUsage[0])

  // Calculate days in period for accurate daily averages
  const daysInPeriod = analysis.timePeriod?.value
    ? (analysis.timePeriod.unit === 'day' || analysis.timePeriod.unit === 'days'
        ? analysis.timePeriod.value
        : analysis.timePeriod.unit === 'week' || analysis.timePeriod.unit === 'weeks'
          ? analysis.timePeriod.value * 7
          : analysis.timePeriod.value * 30)
    : 7

  const avgPerDay = Math.round(analysis.totalSpent / daysInPeriod)
  const requestsPerDay = Math.round(analysis.totalRequests / daysInPeriod)

  // Format the time period for display
  const periodLabel = analysis.timePeriod?.label || 'this period'
  const periodDateRange = analysis.timePeriod?.startDate && analysis.timePeriod?.endDate
    ? `${new Date(analysis.timePeriod.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(analysis.timePeriod.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : null

  // Build slides array
  const slides = [
    { id: 'intro', type: 'intro' },
    { id: 'spend', type: 'spend' },
    { id: 'requests', type: 'requests' },
    { id: 'models', type: 'models' },
    { id: 'patterns', type: 'patterns' },
  ]

  if (analysis.extendedThinking?.count > 0) {
    slides.push({ id: 'thinking', type: 'thinking' })
  }

  analysis.recommendations.slice(0, 3).forEach((rec, i) => {
    slides.push({ id: `rec-${i}`, type: 'recommendation', data: rec, index: i })
  })

  slides.push({ id: 'summary', type: 'summary' })

  const totalSlides = slides.length

  // Track scroll position
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollPos = container.scrollTop
      const slideHeight = window.innerHeight
      const newSlide = Math.round(scrollPos / slideHeight)
      setCurrentSlide(Math.min(newSlide, totalSlides - 1))
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [totalSlides])

  // Scroll to slide
  const scrollToSlide = useCallback((index) => {
    containerRef.current?.scrollTo({
      top: index * window.innerHeight,
      behavior: 'smooth'
    })
  }, [])

  // Collect savings (wow factor)
  const collectSavings = useCallback((amount) => {
    setCollectedSavings(prev => {
      const newTotal = prev + amount
      setShowSavingsPopup(true)
      setTimeout(() => setShowSavingsPopup(false), 1500)
      return newTotal
    })
  }, [])

  // Export PDF
  const handleExport = async () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('AI Usage Report', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`Total Spent: $${analysis.totalSpent}`, 20, 40)
    doc.text(`Potential Savings: $${analysis.potentialSavings}`, 20, 50)
    doc.text(`Total Requests: ${analysis.totalRequests}`, 20, 60)
    doc.save('ai-usage-report.pdf')
  }

  return (
    <div className="relative h-screen bg-dark-900">
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {slides.map((slide, index) => {
          switch (slide.type) {
            case 'intro':
              return (
                <Slide key={slide.id} bgGlow="radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)">
                  <div className="text-center">
                    <RevealText>
                      <Sparkles className="w-12 h-12 text-accent-400 mx-auto mb-6" />
                    </RevealText>
                    <RevealText delay={0.2}>
                      <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        Your AI Usage
                        <span className="text-gradient block">Story</span>
                      </h1>
                    </RevealText>
                    <RevealText delay={0.4}>
                      <p className="text-gray-400 text-lg mb-8">
                        Let's explore how you've been using AI
                      </p>
                    </RevealText>
                    <RevealText delay={0.6}>
                      <motion.button
                        onClick={() => scrollToSlide(1)}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-medium shadow-lg shadow-accent-500/25"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Begin Journey
                      </motion.button>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'spend':
              return (
                <Slide key={slide.id} bgGlow="radial-gradient(circle, rgba(249,124,245,0.2) 0%, transparent 70%)">
                  <div className="text-center">
                    <RevealText>
                      <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-6">
                        <DollarSign className="w-8 h-8 text-accent-400" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.2}>
                      <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                        {periodDateRange ? `Over ${periodLabel}` : 'You invested'}
                      </p>
                    </RevealText>
                    <RevealText delay={0.3}>
                      <h2 className="font-display text-6xl md:text-7xl font-bold text-white mb-2">
                        <CountUp value={analysis.totalSpent} prefix="$" duration={1500} />
                      </h2>
                    </RevealText>
                    {periodDateRange && (
                      <RevealText delay={0.4}>
                        <p className="text-gray-500 text-sm mb-4">{periodDateRange}</p>
                      </RevealText>
                    )}
                    <RevealText delay={0.5}>
                      <p className="text-gray-400">
                        That's about <span className="text-white font-semibold">${avgPerDay}/day</span> on AI
                      </p>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'requests':
              return (
                <Slide key={slide.id} bgGlow="radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)">
                  <div className="text-center">
                    <RevealText>
                      <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-8 h-8 text-purple-400" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.2}>
                      <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">You made</p>
                    </RevealText>
                    <RevealText delay={0.3}>
                      <h2 className="font-display text-6xl md:text-7xl font-bold text-white mb-4">
                        <CountUp value={analysis.totalRequests} duration={1500} />
                      </h2>
                    </RevealText>
                    <RevealText delay={0.4}>
                      <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">API calls</p>
                    </RevealText>
                    <RevealText delay={0.6}>
                      <p className="text-gray-400 mt-4">
                        That's roughly <span className="text-purple-400 font-semibold">{requestsPerDay} requests</span> every single day
                      </p>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'models':
              return (
                <Slide key={slide.id}>
                  <div className="text-center">
                    <RevealText>
                      <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Your go-to model</p>
                    </RevealText>
                    <RevealText delay={0.2}>
                      <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
                        {topModel.name}
                      </h2>
                    </RevealText>
                    <RevealText delay={0.3}>
                      <p className="text-gray-400 mb-8">
                        Used for <span className="text-accent-400 font-semibold">{topModel.usage}%</span> of your requests
                      </p>
                    </RevealText>
                    <RevealText delay={0.5}>
                      <div className="flex justify-center">
                        <PieChart data={analysis.models} size={280} totalCost={analysis.totalSpent} />
                      </div>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'patterns':
              return (
                <Slide key={slide.id}>
                  <div className="text-center">
                    <RevealText>
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-8 h-8 text-blue-400" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.2}>
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                        <span className="text-blue-400">{busiestDay.day}</span> was your power day
                      </h2>
                    </RevealText>
                    <RevealText delay={0.3}>
                      <p className="text-gray-400 mb-8">
                        {busiestDay.requests} requests • ${busiestDay.cost} spent
                      </p>
                    </RevealText>
                    <RevealText delay={0.5}>
                      <div className="bg-dark-800/50 rounded-2xl p-6 border border-white/5">
                        <UsageChart data={analysis.weeklyUsage} />
                      </div>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'thinking':
              return (
                <Slide key={slide.id} bgGlow="radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)">
                  <div className="text-center">
                    <RevealText>
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-8 h-8 text-amber-400" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.2}>
                      <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Deep thinking mode</p>
                    </RevealText>
                    <RevealText delay={0.3}>
                      <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
                        <CountUp value={analysis.extendedThinking.count} duration={1200} />
                      </h2>
                    </RevealText>
                    <RevealText delay={0.4}>
                      <p className="text-gray-500 text-sm uppercase tracking-wider mb-4">times used</p>
                    </RevealText>
                    <RevealText delay={0.6}>
                      <p className="text-gray-400">
                        Costing <span className="text-amber-400 font-semibold">${analysis.extendedThinking.cost}</span> ({analysis.extendedThinking.percentage}% of total)
                      </p>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'recommendation':
              const rec = slide.data
              const isCollected = collectedSavings >= (slide.index + 1) * rec.savings
              return (
                <Slide
                  key={slide.id}
                  bgGlow={`radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)`}
                >
                  <div className="text-center">
                    <RevealText>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-6">
                        <Target className="w-4 h-4" />
                        Optimization #{slide.index + 1}
                      </div>
                    </RevealText>
                    <RevealText delay={0.2}>
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                        {rec.title}
                      </h2>
                    </RevealText>
                    <RevealText delay={0.3}>
                      <p className="text-gray-400 mb-8">{rec.description}</p>
                    </RevealText>
                    <RevealText delay={0.5}>
                      <div className="inline-block">
                        <motion.button
                          onClick={() => !isCollected && collectSavings(rec.savings)}
                          disabled={isCollected}
                          className={`
                            px-8 py-4 rounded-2xl font-semibold text-lg
                            transition-all duration-300
                            ${isCollected
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                            }
                          `}
                          whileHover={!isCollected ? { scale: 1.05 } : {}}
                          whileTap={!isCollected ? { scale: 0.95 } : {}}
                        >
                          {isCollected ? (
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5" />
                              Collected +${rec.savings}/mo
                            </span>
                          ) : (
                            <span>Collect +${rec.savings}/mo</span>
                          )}
                        </motion.button>
                      </div>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'summary':
              return (
                <Slide key={slide.id} bgGlow="radial-gradient(circle, rgba(217,70,239,0.2) 0%, transparent 70%)">
                  <div className="text-center">
                    <RevealText>
                      <Sparkles className="w-12 h-12 text-accent-400 mx-auto mb-6" />
                    </RevealText>
                    <RevealText delay={0.2}>
                      <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Your potential savings</p>
                    </RevealText>
                    <RevealText delay={0.3}>
                      <h2 className="font-display text-6xl md:text-7xl font-bold text-gradient mb-2">
                        ${collectedSavings > 0 ? collectedSavings : analysis.potentialSavings}
                      </h2>
                    </RevealText>
                    <RevealText delay={0.4}>
                      <p className="text-gray-500 text-sm uppercase tracking-wider mb-8">per month</p>
                    </RevealText>
                    <RevealText delay={0.6}>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <motion.button
                          onClick={handleExport}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-medium shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className="w-4 h-4" />
                          Export Report
                        </motion.button>
                        <motion.button
                          onClick={() => navigate('/dashboard')}
                          className="px-6 py-3 rounded-xl bg-dark-700 border border-white/10 text-gray-300 font-medium flex items-center justify-center gap-2 hover:border-white/20"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Full Dashboard
                        </motion.button>
                      </div>
                    </RevealText>
                    <RevealText delay={0.8}>
                      <button
                        onClick={() => scrollToSlide(0)}
                        className="mt-8 text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 mx-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Start over
                      </button>
                    </RevealText>
                  </div>
                </Slide>
              )

            default:
              return null
          }
        })}
      </div>

      {/* Floating savings counter (wow factor) */}
      <AnimatePresence>
        {collectedSavings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className="px-4 py-2 rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-500/30 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold">
                ${collectedSavings}/mo saved
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Savings popup animation */}
      <AnimatePresence>
        {showSavingsPopup && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <span className="text-green-400 font-bold text-2xl">+${analysis.recommendations[0]?.savings || 0}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === i
                ? 'bg-accent-400 scale-125'
                : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <AnimatePresence>
        {currentSlide < totalSlides - 1 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scrollToSlide(currentSlide + 1)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors"
          >
            <span className="text-xs">Scroll</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Back to top indicator (when scrolled) */}
      <AnimatePresence>
        {currentSlide > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scrollToSlide(currentSlide - 1)}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-40 text-gray-500 hover:text-white transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Skip to dashboard - hide on final slide */}
      <AnimatePresence>
        {currentSlide < totalSlides - 1 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
            onClick={() => navigate('/dashboard')}
            className="fixed bottom-8 right-6 z-40 px-4 py-2 rounded-lg bg-dark-800/80 backdrop-blur-sm border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
          >
            Skip to Dashboard
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
