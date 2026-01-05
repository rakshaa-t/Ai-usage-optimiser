import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingDown,
  Zap,
  ArrowUpRight,
  ArrowLeft,
  Lightbulb,
  ChevronRight,
  BarChart3,
  FileText,
  Download,
  Check,
  Copy,
  Brain,
  Target,
  Clock,
  Layers,
  AlertTriangle
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import NeuCard from '../components/NeuCard'
import PieChart, { PieChartLegend } from '../components/PieChart'
import UsageChart from '../components/UsageChart'

const defaultData = {
  totalSpent: 229,
  totalRequests: 1250,
  filesAnalyzed: 1,
  models: [
    { name: 'GPT-4', usage: 45, cost: 103.05, color: '#FF6B6B', requests: 562 },
    { name: 'GPT-3.5', usage: 30, cost: 68.70, color: '#4ECDC4', requests: 375 },
    { name: 'Claude', usage: 25, cost: 57.25, color: '#45B7D1', requests: 313 },
  ],
  recommendations: [
    { title: 'Switch to GPT-3.5 for simple tasks', description: 'Analysis shows 40% of your GPT-4 queries are simple enough for GPT-3.5', savings: 45, impact: 'high' },
    { title: 'Batch similar requests', description: 'Combine sequential similar queries to reduce API overhead', savings: 28, impact: 'medium' },
    { title: 'Cache repeated queries', description: '15% of your queries are identical and could be cached', savings: 22, impact: 'medium' },
    { title: 'Optimize prompt length', description: 'Reduce average prompt length by removing redundant context', savings: 15, impact: 'low' },
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
  extendedThinking: { count: 0, cost: 0, percentage: 0 },
  metrics: { avgCostPerRequest: 0.18, avgTokensPerRequest: 2500, duplicatePercentage: 12, duplicateCost: 27 }
}

const impactColors = {
  high: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
}

const categoryIcons = {
  'model-optimization': Target,
  'feature-optimization': Brain,
  'caching': Layers,
  'prompt-optimization': FileText,
  'architecture': Layers,
  'scheduling': Clock,
  'provider-features': Zap,
  'ux-optimization': Lightbulb,
}

const getImplementationSteps = (title) => {
  const steps = {
    'Switch to GPT-3.5 for simple tasks': ['Identify queries with short responses or simple Q&A patterns', 'Create a routing layer that classifies query complexity', 'Route simple queries to GPT-3.5, complex ones to GPT-4', 'Monitor response quality and adjust thresholds'],
    'Batch similar requests': ['Group sequential API calls made within 5-second windows', 'Combine related queries into single batch requests', 'Use async processing for non-urgent requests', 'Implement a queue system for request batching'],
    'Cache repeated queries': ['Implement a hash-based cache for identical prompts', 'Set appropriate TTL based on query type', 'Use Redis or similar for distributed caching', 'Add cache hit/miss monitoring'],
    'Optimize prompt length': ['Audit prompts for redundant context or instructions', 'Use system prompts instead of repeating in user prompts', 'Implement prompt templates with variables', 'Remove unnecessary examples from few-shot prompts'],
  }
  return steps[title] || ['Review current usage patterns', 'Implement the suggested optimization', 'Monitor results for 1 week', 'Adjust based on performance metrics']
}

export default function DashboardPage({ data }) {
  const navigate = useNavigate()
  const [hoveredRec, setHoveredRec] = useState(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedStat, setSelectedStat] = useState(null)
  const [expandedRec, setExpandedRec] = useState(null)

  const [analysisData] = useState(() => {
    if (data) return data
    try {
      const saved = localStorage.getItem('ai-usage-optimizer-data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.analysisData) return parsed.analysisData
      }
    } catch (e) { console.error('Failed to load saved data:', e) }
    return defaultData
  })

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let yPos = 20

      doc.setFontSize(24)
      doc.setTextColor(255, 107, 107)
      doc.text('AI Usage Optimization Report', pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' })
      yPos += 20

      doc.setFontSize(16)
      doc.setTextColor(74, 74, 74)
      doc.text('Executive Summary', 20, yPos)
      yPos += 10

      doc.setFontSize(11)
      const summaryData = [
        ['Total Spent', `$${analysisData.totalSpent.toLocaleString()}`],
        ['Potential Savings', `$${analysisData.potentialSavings}/month`],
        ['Total API Requests', analysisData.totalRequests.toLocaleString()],
      ]

      summaryData.forEach(([label, value]) => {
        doc.setTextColor(107, 107, 107)
        doc.text(`${label}:`, 25, yPos)
        doc.setTextColor(74, 74, 74)
        doc.text(value, 90, yPos)
        yPos += 7
      })
      yPos += 10

      doc.setFontSize(16)
      doc.text('Usage by Model', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      analysisData.models.forEach((model, index) => {
        doc.setTextColor(107, 107, 107)
        doc.text(`${index + 1}. ${model.name} - ${model.usage}% ($${model.cost.toFixed(2)})`, 25, yPos)
        yPos += 6
      })
      yPos += 10

      doc.setFontSize(16)
      doc.text('Recommendations', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      analysisData.recommendations.forEach((rec, index) => {
        if (yPos > 260) { doc.addPage(); yPos = 20 }
        doc.setTextColor(74, 74, 74)
        doc.text(`${index + 1}. ${rec.title} (+$${rec.savings}/mo)`, 25, yPos)
        yPos += 5
        doc.setTextColor(155, 155, 155)
        const lines = doc.splitTextToSize(rec.description, pageWidth - 50)
        lines.forEach(line => { doc.text(line, 30, yPos); yPos += 4 })
        yPos += 5
      })

      doc.save(`ai-usage-report-${new Date().toISOString().split('T')[0]}.pdf`)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
    } catch (err) { console.error('PDF export error:', err) }
    finally { setIsExporting(false) }
  }

  const handleShare = async () => {
    const shareText = `AI Usage Report\nTotal Spent: $${analysisData.totalSpent}\nPotential Savings: $${analysisData.potentialSavings}/month\n\nTop Recommendations:\n${analysisData.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r.title} (+$${r.savings}/mo)`).join('\n')}`
    try {
      await navigator.clipboard.writeText(shareText)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch (err) { console.error('Failed to copy:', err) }
  }

  const stats = [
    { label: 'Total Spent', value: `$${analysisData.totalSpent}`, icon: DollarSign, color: '#FF6B6B', subtext: 'This period' },
    { label: 'Potential Savings', value: `$${analysisData.potentialSavings}`, icon: TrendingDown, color: '#4ECDC4', subtext: `${Math.round((analysisData.potentialSavings / analysisData.totalSpent) * 100)}% reduction` },
    { label: 'Total Requests', value: analysisData.totalRequests.toLocaleString(), icon: Zap, color: '#45B7D1', subtext: 'API calls' },
  ]

  if (analysisData.extendedThinking?.count > 0) {
    stats.push({ label: 'Extended Thinking', value: analysisData.extendedThinking.count.toLocaleString(), icon: Brain, color: '#96CEB4', subtext: `$${analysisData.extendedThinking.cost}` })
  } else {
    stats.push({ label: 'Files Analyzed', value: analysisData.filesAnalyzed || 1, icon: FileText, color: '#96CEB4', subtext: 'CSV files' })
  }

  return (
    <div className="relative min-h-screen px-6 py-8 md:px-12 bg-neu-bg">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
        <div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Upload</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary">
              Usage Dashboard
            </h1>
            <span className="px-2.5 py-1 rounded-full shadow-neu bg-neu-bg text-text-secondary text-xs font-semibold">BETA</span>
          </div>
          <p className="text-text-secondary mt-2 text-base">Your AI spending at a glance</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl shadow-neu bg-neu-bg">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-sm text-text-secondary">Analysis Complete</span>
        </div>
      </motion.div>

      {/* ==================== SECTION 1: KEY METRICS ==================== */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl shadow-neu flex items-center justify-center bg-neu-bg">
            <DollarSign className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">Key Metrics</h2>
            <p className="text-text-secondary text-sm font-medium">Summary of your API usage and costs</p>
          </div>
        </div>

        {/* Flat outer container with raised inner cards */}
        <NeuCard variant="flat" className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <NeuCard key={stat.label} variant="raised" className="p-5" hoverable>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-neu bg-neu-bg">
                    <stat.icon className="w-5 h-5 text-text-secondary" />
                  </div>
                </div>
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">{stat.label}</p>
                <p className="font-display text-3xl font-bold text-text-primary mb-1">{stat.value}</p>
                <p className="text-text-secondary text-sm">{stat.subtext}</p>
              </NeuCard>
            ))}
          </div>
        </NeuCard>
      </motion.section>

      {/* ==================== SECTION 2: DETAILED METRICS ==================== */}
      {analysisData.metrics && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl shadow-neu flex items-center justify-center bg-neu-bg">
              <BarChart3 className="w-4 h-4 text-text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-text-primary">Detailed Metrics</h2>
              <p className="text-text-secondary text-sm font-medium">Per-request analysis and efficiency indicators</p>
            </div>
          </div>

          <NeuCard variant="flat" className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg Cost/Request', value: `$${analysisData.metrics.avgCostPerRequest?.toFixed(4) || '0.00'}`, icon: DollarSign },
                { label: 'Avg Tokens/Request', value: (analysisData.metrics.avgTokensPerRequest || 0).toLocaleString(), icon: Zap },
                { label: 'Duplicate Queries', value: `${analysisData.metrics.duplicatePercentage?.toFixed(1) || 0}%`, icon: Copy },
                { label: 'Duplicate Cost', value: `$${analysisData.metrics.duplicateCost?.toFixed(2) || '0.00'}`, icon: DollarSign },
              ].map((metric) => (
                <NeuCard key={metric.label} variant="raised" className="p-5" hoverable>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl shadow-neu flex items-center justify-center bg-neu-bg">
                      <metric.icon className="w-4 h-4 text-text-secondary" />
                    </div>
                  </div>
                  <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">{metric.label}</p>
                  <p className="text-text-primary text-2xl font-bold">{metric.value}</p>
                </NeuCard>
              ))}
            </div>
          </NeuCard>
        </motion.section>
      )}

      {/* ==================== SECTION 3: CHARTS & VISUALIZATIONS ==================== */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl shadow-neu flex items-center justify-center bg-neu-bg">
            <BarChart3 className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">Usage Breakdown</h2>
            <p className="text-text-secondary text-sm font-medium">Visual analysis of your spending patterns</p>
          </div>
        </div>

        <NeuCard variant="flat" className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Usage by Model */}
            <NeuCard variant="raised" className="p-6" hoverable={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-text-primary">Cost by Model</h3>
                <span className="text-text-secondary text-sm">{analysisData.models.length} models</span>
              </div>
              <div className="flex items-center justify-center mb-6">
                <PieChart data={analysisData.models} totalCost={analysisData.totalSpent} />
              </div>
              <div className="border-t border-neu-shadow/30 pt-4">
                <PieChartLegend data={analysisData.models} />
              </div>
            </NeuCard>

            {/* Weekly Usage */}
            <NeuCard variant="raised" className="p-6" hoverable={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-text-primary">Weekly Pattern</h3>
                <span className="text-text-secondary text-sm">Last 7 days avg</span>
              </div>
              <UsageChart data={analysisData.weeklyUsage} />
              <div className="border-t border-neu-shadow/30 pt-4 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Peak day</span>
                  <span className="text-text-primary font-semibold">
                    {analysisData.weeklyUsage?.reduce((max, day) => day.requests > max.requests ? day : max, analysisData.weeklyUsage[0])?.day || 'N/A'}
                  </span>
                </div>
              </div>
            </NeuCard>
          </div>
        </NeuCard>
      </motion.section>

      {/* ==================== SECTION 4: RECOMMENDATIONS ==================== */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl shadow-neu flex items-center justify-center bg-neu-bg">
            <Lightbulb className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">Optimization Opportunities</h2>
            <p className="text-text-secondary text-sm font-medium">Actionable ways to reduce your AI costs</p>
          </div>
        </div>

        <NeuCard variant="flat" className="p-5">
          {/* Savings summary */}
          <div className="flex items-center justify-between mb-5 p-4 rounded-xl shadow-neu bg-neu-bg">
            <div>
              <p className="text-text-secondary text-sm font-medium">Potential Monthly Savings</p>
              <p className="text-text-primary text-3xl font-bold">+${analysisData.potentialSavings}</p>
            </div>
            <div className="w-12 h-12 rounded-xl shadow-neu flex items-center justify-center bg-neu-bg">
              <TrendingDown className="w-6 h-6 text-text-secondary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.recommendations.map((rec, index) => {
              const CategoryIcon = categoryIcons[rec.category] || Lightbulb
              const isExpanded = expandedRec === index
              return (
                <NeuCard
                  key={rec.title}
                  variant="raised"
                  className="p-5 cursor-pointer"
                  hoverable
                  onMouseEnter={() => setHoveredRec(index)}
                  onMouseLeave={() => setHoveredRec(null)}
                  onClick={() => setExpandedRec(expandedRec === index ? null : index)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${impactColors[rec.impact].bg} ${impactColors[rec.impact].text}`}>
                        {rec.impact}
                      </span>
                      {rec.priority && <span className="text-text-secondary text-xs font-medium">#{rec.priority}</span>}
                    </div>
                    <span className="text-text-primary font-bold text-lg">+${rec.savings}/mo</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl shadow-neu bg-neu-bg flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display text-lg font-bold text-text-primary mb-1">{rec.title}</h4>
                      <p className="text-text-secondary text-sm leading-relaxed">{rec.description}</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-neu-shadow/30"
                      >
                        <p className="text-sm text-text-primary font-semibold mb-3">Implementation Steps:</p>
                        <div className="space-y-2">
                          {getImplementationSteps(rec.title).map((step, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <span className="w-5 h-5 rounded-full shadow-neu bg-neu-bg text-text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</span>
                              <span className="text-text-secondary">{step}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-1 mt-4 text-text-secondary text-sm font-semibold">
                    {isExpanded ? 'Show less' : 'View steps'}
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </NeuCard>
              )
            })}
          </div>
        </NeuCard>
      </motion.section>

      {/* ==================== SECTION 5: EXPORT & ACTIONS ==================== */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <NeuCard variant="raised" className="p-8 text-center" hoverable={false}>
          <div className="max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl shadow-neu flex items-center justify-center mx-auto mb-5 bg-neu-bg">
              <Download className="w-7 h-7 text-text-secondary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-text-primary mb-2">Export Your Report</h3>
            <p className="text-text-secondary text-base mb-6">Download a detailed PDF or share insights with your team</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="neu-btn-primary disabled:opacity-50"
                whileHover={!isExporting ? { scale: 1.02 } : {}}
                whileTap={!isExporting ? { scale: 0.98 } : {}}
              >
                <AnimatePresence mode="wait">
                  {exportSuccess ? (
                    <Check className="w-4 h-4" />
                  ) : isExporting ? (
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </AnimatePresence>
                {exportSuccess ? 'Downloaded!' : isExporting ? 'Generating...' : 'Download PDF Report'}
              </motion.button>

              <motion.button
                onClick={handleShare}
                className="neu-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {shareSuccess ? <Check className="w-4 h-4 text-text-primary" /> : <Copy className="w-4 h-4" />}
                </AnimatePresence>
                {shareSuccess ? 'Copied!' : 'Copy Summary'}
              </motion.button>
            </div>
          </div>
        </NeuCard>
      </motion.section>
    </div>
  )
}
