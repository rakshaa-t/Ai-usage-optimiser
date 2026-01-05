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
function Slide({ children, className = '' }) {
  return (
    <section className={`
      min-h-screen w-full snap-start snap-always
      flex flex-col items-center justify-center
      px-6 py-12 relative overflow-hidden bg-neu-bg
      ${className}
    `}>
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

  const analysis = data || {
    totalSpent: 229,
    totalRequests: 1250,
    potentialSavings: 110,
    models: [
      { name: 'GPT-4', usage: 45, cost: 103, color: '#FF6B6B', requests: 562 },
      { name: 'GPT-3.5', usage: 30, cost: 69, color: '#4ECDC4', requests: 375 },
      { name: 'Claude', usage: 25, cost: 57, color: '#45B7D1', requests: 313 },
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

  const topModel = analysis.models[0]
  const busiestDay = analysis.weeklyUsage.reduce((max, day) => day.requests > max.requests ? day : max, analysis.weeklyUsage[0])

  const daysInPeriod = analysis.timePeriod?.value
    ? (analysis.timePeriod.unit === 'day' || analysis.timePeriod.unit === 'days'
        ? analysis.timePeriod.value
        : analysis.timePeriod.unit === 'week' || analysis.timePeriod.unit === 'weeks'
          ? analysis.timePeriod.value * 7
          : analysis.timePeriod.value * 30)
    : 7

  const avgPerDay = Math.round(analysis.totalSpent / daysInPeriod)
  const requestsPerDay = Math.round(analysis.totalRequests / daysInPeriod)
  const periodLabel = analysis.timePeriod?.label || 'this period'
  const periodDateRange = analysis.timePeriod?.startDate && analysis.timePeriod?.endDate
    ? `${new Date(analysis.timePeriod.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(analysis.timePeriod.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : null

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

  const scrollToSlide = useCallback((index) => {
    containerRef.current?.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' })
  }, [])

  const collectSavings = useCallback((amount) => {
    setCollectedSavings(prev => {
      const newTotal = prev + amount
      setShowSavingsPopup(true)
      setTimeout(() => setShowSavingsPopup(false), 1500)
      return newTotal
    })
  }, [])

  const handleExport = async () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(255, 107, 107)
    doc.text('AI Usage Report', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.setTextColor(74, 74, 74)
    doc.text(`Total Spent: $${analysis.totalSpent}`, 20, 40)
    doc.text(`Potential Savings: $${analysis.potentialSavings}`, 20, 50)
    doc.text(`Total Requests: ${analysis.totalRequests}`, 20, 60)
    doc.save('ai-usage-report.pdf')
  }

  return (
    <div className="relative h-screen bg-neu-bg">
      <div ref={containerRef} className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
        {slides.map((slide, index) => {
          switch (slide.type) {
            case 'intro':
              return (
                <Slide key={slide.id}>
                  <div className="text-center">
                    <RevealText>
                      <div className="w-14 h-14 rounded-xl shadow-neu-sm flex items-center justify-center mx-auto mb-10 bg-neu-bg">
                        <Sparkles className="w-6 h-6 text-text-muted" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.15}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-4">Your AI Usage</p>
                    </RevealText>
                    <RevealText delay={0.25}>
                      <h1 
                        className="font-display font-extrabold text-text-primary mb-6"
                        style={{ fontSize: 'clamp(72px, 15vw, 140px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
                      >
                        Story
                      </h1>
                    </RevealText>
                    <RevealText delay={0.4}>
                      <p className="text-lg text-text-secondary mb-12">Let's explore how you've been using AI</p>
                    </RevealText>
                    <RevealText delay={0.55}>
                      <motion.button
                        onClick={() => scrollToSlide(1)}
                        className="neu-btn-primary px-10 py-4 text-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Begin Journey
                      </motion.button>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'spend':
              return (
                <Slide key={slide.id}>
                  <div className="text-center">
                    <RevealText>
                      <div className="w-12 h-12 rounded-xl shadow-neu-sm flex items-center justify-center mx-auto mb-8 bg-neu-bg">
                        <DollarSign className="w-5 h-5 text-text-muted" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.15}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-6">
                        {periodDateRange ? `Over ${periodLabel}` : 'You invested'}
                      </p>
                    </RevealText>
                    <RevealText delay={0.25}>
                      <h2 
                        className="font-display font-extrabold text-text-primary mb-6"
                        style={{ fontSize: 'clamp(72px, 15vw, 140px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
                      >
                        <CountUp value={analysis.totalSpent} prefix="$" duration={1500} />
                      </h2>
                    </RevealText>
                    {periodDateRange && (
                      <RevealText delay={0.35}>
                        <p className="text-base text-text-secondary font-medium mb-6">{periodDateRange}</p>
                      </RevealText>
                    )}
                    <RevealText delay={0.45}>
                      <p className="text-base text-text-secondary">
                        That's about <span className="text-xl font-bold text-text-primary">${avgPerDay}/day</span> on AI
                      </p>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'requests':
              return (
                <Slide key={slide.id}>
                  <div className="text-center">
                    <RevealText>
                      <div className="w-12 h-12 rounded-xl shadow-neu-sm flex items-center justify-center mx-auto mb-8 bg-neu-bg">
                        <Zap className="w-5 h-5 text-text-muted" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.15}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-6">You made</p>
                    </RevealText>
                    <RevealText delay={0.25}>
                      <h2 
                        className="font-display font-extrabold text-text-primary mb-2"
                        style={{ fontSize: 'clamp(72px, 15vw, 140px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
                      >
                        <CountUp value={analysis.totalRequests} duration={1500} />
                      </h2>
                    </RevealText>
                    <RevealText delay={0.35}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-8">API calls</p>
                    </RevealText>
                    <RevealText delay={0.5}>
                      <p className="text-base text-text-secondary">
                        That's roughly <span className="text-xl font-bold text-text-primary">{requestsPerDay} requests</span> every day
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
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-4">Your go-to model</p>
                    </RevealText>
                    <RevealText delay={0.15}>
                      <h2 
                        className="font-display font-extrabold text-text-primary mb-4"
                        style={{ fontSize: 'clamp(48px, 12vw, 96px)', lineHeight: 1, letterSpacing: '-0.02em' }}
                      >
                        {topModel.name}
                      </h2>
                    </RevealText>
                    <RevealText delay={0.25}>
                      <p className="text-base text-text-secondary mb-10">
                        Used for <span className="text-3xl font-bold text-coral-500">{topModel.usage}%</span> of your requests
                      </p>
                    </RevealText>
                    <RevealText delay={0.4}>
                      <div className="flex justify-center p-6 rounded-2xl shadow-neu bg-neu-bg">
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
                      <div className="w-12 h-12 rounded-xl shadow-neu-sm flex items-center justify-center mx-auto mb-8 bg-neu-bg">
                        <Clock className="w-5 h-5 text-text-muted" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.15}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-4">Your power day</p>
                    </RevealText>
                    <RevealText delay={0.25}>
                      <h2 
                        className="font-display font-extrabold text-text-primary mb-4"
                        style={{ fontSize: 'clamp(64px, 14vw, 120px)', lineHeight: 1, letterSpacing: '-0.02em' }}
                      >
                        {busiestDay.day}
                      </h2>
                    </RevealText>
                    <RevealText delay={0.35}>
                      <p className="text-base text-text-secondary mb-10">
                        <span className="text-xl font-bold text-text-primary">{busiestDay.requests}</span> requests
                        <span className="mx-3 text-text-muted">•</span>
                        <span className="text-xl font-bold text-text-primary">${busiestDay.cost}</span> spent
                      </p>
                    </RevealText>
                    <RevealText delay={0.5}>
                      <div className="shadow-neu rounded-2xl p-6 bg-neu-bg">
                        <UsageChart data={analysis.weeklyUsage} />
                      </div>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'thinking':
              return (
                <Slide key={slide.id}>
                  <div className="text-center">
                    <RevealText>
                      <div className="w-12 h-12 rounded-xl shadow-neu-sm flex items-center justify-center mx-auto mb-8 bg-neu-bg">
                        <Brain className="w-5 h-5 text-text-muted" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.15}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-6">Deep thinking mode</p>
                    </RevealText>
                    <RevealText delay={0.25}>
                      <h2 
                        className="font-display font-extrabold text-text-primary mb-2"
                        style={{ fontSize: 'clamp(72px, 15vw, 140px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
                      >
                        <CountUp value={analysis.extendedThinking.count} duration={1200} />
                      </h2>
                    </RevealText>
                    <RevealText delay={0.35}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-8">times used</p>
                    </RevealText>
                    <RevealText delay={0.5}>
                      <p className="text-base text-text-secondary">
                        Costing <span className="text-xl font-bold text-coral-500">${analysis.extendedThinking.cost}</span>
                        <span className="text-text-muted ml-2">({analysis.extendedThinking.percentage}% of total)</span>
                      </p>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'recommendation':
              const rec = slide.data
              const isCollected = collectedSavings >= (slide.index + 1) * rec.savings
              return (
                <Slide key={slide.id}>
                  <div className="text-center">
                    <RevealText>
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-neu text-text-secondary text-base font-semibold mb-8 bg-neu-bg">
                        <Target className="w-5 h-5" />
                        Optimization #{slide.index + 1}
                      </div>
                    </RevealText>
                    <RevealText delay={0.2}>
                      <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">{rec.title}</h2>
                    </RevealText>
                    <RevealText delay={0.3}>
                      <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">{rec.description}</p>
                    </RevealText>
                    <RevealText delay={0.5}>
                      <motion.button
                        onClick={() => !isCollected && collectSavings(rec.savings)}
                        disabled={isCollected}
                        className={`
                          px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300
                          ${isCollected
                            ? 'shadow-neu-inset bg-neu-bg text-text-primary'
                            : 'shadow-neu bg-gradient-to-br from-coral-400 to-coral-500 text-white'
                          }
                        `}
                        whileHover={!isCollected ? { scale: 1.02 } : {}}
                        whileTap={!isCollected ? { scale: 0.98 } : {}}
                      >
                        {isCollected ? (
                          <span className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6" />
                            Collected +${rec.savings}/mo
                          </span>
                        ) : (
                          <span className="text-2xl">Collect +${rec.savings}/mo</span>
                        )}
                      </motion.button>
                    </RevealText>
                  </div>
                </Slide>
              )

            case 'summary':
              return (
                <Slide key={slide.id}>
                  <div className="text-center">
                    <RevealText>
                      <div className="w-12 h-12 rounded-xl shadow-neu-sm flex items-center justify-center mx-auto mb-8 bg-neu-bg">
                        <Sparkles className="w-5 h-5 text-text-muted" />
                      </div>
                    </RevealText>
                    <RevealText delay={0.15}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-6">Your potential savings</p>
                    </RevealText>
                    <RevealText delay={0.25}>
                      <h2 
                        className="font-display font-extrabold mb-2"
                        style={{ fontSize: 'clamp(72px, 15vw, 140px)', lineHeight: 0.95, letterSpacing: '-0.03em', color: '#E85555' }}
                      >
                        ${collectedSavings > 0 ? collectedSavings : analysis.potentialSavings}
                      </h2>
                    </RevealText>
                    <RevealText delay={0.35}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-12">per month</p>
                    </RevealText>
                    <RevealText delay={0.6}>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                          onClick={handleExport}
                          className="neu-btn-primary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Download className="w-5 h-5" />
                          Export Report
                        </motion.button>
                        <motion.button
                          onClick={() => navigate('/dashboard')}
                          className="neu-btn"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Full Dashboard
                        </motion.button>
                      </div>
                    </RevealText>
                    <RevealText delay={0.8}>
                      <button
                        onClick={() => scrollToSlide(0)}
                        className="mt-10 text-text-secondary hover:text-text-primary text-base flex items-center gap-2 mx-auto transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
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

      {/* Floating savings counter */}
      <AnimatePresence>
        {collectedSavings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className="px-4 py-2 rounded-xl shadow-neu flex items-center gap-2 bg-neu-bg">
              <TrendingDown className="w-4 h-4 text-text-secondary" />
              <span className="text-text-primary font-semibold">${collectedSavings}/mo saved</span>
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
            <span className="text-text-primary font-bold text-2xl">+${analysis.recommendations[0]?.savings || 0}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === i
                ? 'bg-text-primary shadow-sm'
                : 'bg-neu-shadow hover:bg-text-muted'
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="text-xs">Scroll</span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Back to top */}
      <AnimatePresence>
        {currentSlide > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scrollToSlide(currentSlide - 1)}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-40 text-text-muted hover:text-text-primary transition-colors"
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
            className="fixed bottom-8 right-6 z-40 px-4 py-2 rounded-xl shadow-neu text-text-muted text-sm hover:text-text-primary transition-colors flex items-center gap-2 bg-neu-bg"
          >
            Skip to Dashboard
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
