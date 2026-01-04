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
  Layers
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import TiltCard from '../components/TiltCard'
import PieChart from '../components/PieChart'
import UsageChart from '../components/UsageChart'

const defaultData = {
  totalSpent: 229,
  totalRequests: 1250,
  filesAnalyzed: 1,
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
  extendedThinking: { count: 0, cost: 0, percentage: 0 },
  metrics: {
    avgCostPerRequest: 0.18,
    avgTokensPerRequest: 2500,
    duplicatePercentage: 12,
    duplicateCost: 27
  }
}

const impactColors = {
  high: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
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

// Helper function to get implementation steps based on recommendation
const getImplementationSteps = (title) => {
  const steps = {
    'Switch to GPT-3.5 for simple tasks': [
      'Identify queries with short responses or simple Q&A patterns',
      'Create a routing layer that classifies query complexity',
      'Route simple queries to GPT-3.5, complex ones to GPT-4',
      'Monitor response quality and adjust thresholds'
    ],
    'Batch similar requests': [
      'Group sequential API calls made within 5-second windows',
      'Combine related queries into single batch requests',
      'Use async processing for non-urgent requests',
      'Implement a queue system for request batching'
    ],
    'Cache repeated queries': [
      'Implement a hash-based cache for identical prompts',
      'Set appropriate TTL based on query type',
      'Use Redis or similar for distributed caching',
      'Add cache hit/miss monitoring'
    ],
    'Optimize prompt length': [
      'Audit prompts for redundant context or instructions',
      'Use system prompts instead of repeating in user prompts',
      'Implement prompt templates with variables',
      'Remove unnecessary examples from few-shot prompts'
    ],
    'Disable Extended Thinking': [
      'Go to Cursor Settings → Features',
      'Find "Extended Thinking" or "Max Mode" toggle',
      'Disable for routine coding tasks',
      'Enable only for complex architectural decisions'
    ]
  }
  return steps[title] || [
    'Review current usage patterns',
    'Implement the suggested optimization',
    'Monitor results for 1 week',
    'Adjust based on performance metrics'
  ]
}

const getEstimatedTime = (impact) => {
  switch (impact) {
    case 'high': return '30 mins'
    case 'medium': return '1-2 hours'
    case 'low': return '2-4 hours'
    default: return '1 hour'
  }
}

export default function DashboardPage({ data }) {
  const navigate = useNavigate()
  const [hoveredRec, setHoveredRec] = useState(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedStat, setSelectedStat] = useState(null)
  const [expandedRec, setExpandedRec] = useState(null)
  
  // Try to load from localStorage if no data prop
  const [analysisData, setAnalysisData] = useState(() => {
    if (data) return data
    
    try {
      const saved = localStorage.getItem('ai-usage-optimizer-data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.analysisData) {
          return parsed.analysisData
        }
      }
    } catch (e) {
      console.error('Failed to load saved data:', e)
    }
    
    return defaultData
  })

  // Generate PDF Report
  const handleExportPDF = async () => {
    setIsExporting(true)

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let yPos = 20

      // Title
      doc.setFontSize(24)
      doc.setTextColor(217, 70, 239) // Accent color
      doc.text('AI Usage Optimization Report', pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // Date
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, pageWidth / 2, yPos, { align: 'center' })
      yPos += 20

      // Summary Section
      doc.setFontSize(16)
      doc.setTextColor(40, 40, 40)
      doc.text('Executive Summary', 20, yPos)
      yPos += 10

      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)

      const summaryData = [
        ['Total Spent', `$${analysisData.totalSpent.toLocaleString()}`],
        ['Potential Savings', `$${analysisData.potentialSavings}/month (${Math.round((analysisData.potentialSavings / analysisData.totalSpent) * 100)}% reduction)`],
        ['Total API Requests', analysisData.totalRequests.toLocaleString()],
        ['Files Analyzed', (analysisData.filesAnalyzed || 1).toString()],
      ]

      if (analysisData.extendedThinking?.count > 0) {
        summaryData.push(['Extended Thinking Usage', `${analysisData.extendedThinking.count} requests ($${analysisData.extendedThinking.cost})`])
      }

      if (analysisData.metrics?.avgCostPerRequest) {
        summaryData.push(['Avg Cost/Request', `$${analysisData.metrics.avgCostPerRequest.toFixed(4)}`])
      }

      summaryData.forEach(([label, value]) => {
        doc.setTextColor(100, 100, 100)
        doc.text(`${label}:`, 25, yPos)
        doc.setTextColor(40, 40, 40)
        doc.text(value, 90, yPos)
        yPos += 7
      })

      yPos += 10

      // Model Breakdown Section
      doc.setFontSize(16)
      doc.setTextColor(40, 40, 40)
      doc.text('Usage by Model', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      analysisData.models.forEach((model, index) => {
        doc.setTextColor(60, 60, 60)
        const modelText = `${index + 1}. ${model.name} - ${model.usage}% (${model.requests} requests, $${model.cost.toFixed(2)})`
        doc.text(modelText, 25, yPos)
        yPos += 6
      })

      yPos += 10

      // Recommendations Section
      doc.setFontSize(16)
      doc.setTextColor(40, 40, 40)
      doc.text('Optimization Recommendations', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      analysisData.recommendations.forEach((rec, index) => {
        // Check if we need a new page
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }

        // Impact badge
        const impactColor = rec.impact === 'high' ? [34, 197, 94] : rec.impact === 'medium' ? [234, 179, 8] : [59, 130, 246]
        doc.setTextColor(...impactColor)
        doc.text(`[${rec.impact.toUpperCase()}]`, 25, yPos)

        // Savings
        doc.setTextColor(34, 197, 94)
        doc.text(`+$${rec.savings}/mo`, 55, yPos)

        yPos += 6

        // Title
        doc.setTextColor(40, 40, 40)
        doc.setFontSize(11)
        doc.text(`${index + 1}. ${rec.title}`, 25, yPos)
        yPos += 5

        // Description (wrapped)
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        const lines = doc.splitTextToSize(rec.description, pageWidth - 50)
        lines.forEach(line => {
          doc.text(line, 30, yPos)
          yPos += 4
        })
        yPos += 5
      })

      // Footer
      yPos = doc.internal.pageSize.getHeight() - 15
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Generated by AI Usage Optimizer', pageWidth / 2, yPos, { align: 'center' })

      // Save the PDF
      doc.save(`ai-usage-report-${new Date().toISOString().split('T')[0]}.pdf`)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    const shareText = `AI Usage Optimization Report

Total Spent: $${analysisData.totalSpent}
Potential Savings: $${analysisData.potentialSavings}/month (${Math.round((analysisData.potentialSavings / analysisData.totalSpent) * 100)}% reduction)
Total Requests: ${analysisData.totalRequests.toLocaleString()}
${analysisData.extendedThinking?.count > 0 ? `Extended Thinking: ${analysisData.extendedThinking.count} requests ($${analysisData.extendedThinking.cost})` : ''}

Top Recommendations:
${analysisData.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r.title} (+$${r.savings}/mo)`).join('\n')}

Generated by AI Usage Optimizer`

    try {
      await navigator.clipboard.writeText(shareText)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Build stats array dynamically with detail data
  const stats = [
    {
      label: 'Total Spent',
      value: `$${analysisData.totalSpent}`,
      icon: DollarSign,
      color: '#F97CF5',
      subtext: 'This period',
      details: {
        title: 'Spending Breakdown',
        items: analysisData.models.map(m => ({
          label: m.name,
          value: `$${m.cost.toFixed(2)}`,
          percentage: `${m.usage}%`
        }))
      }
    },
    {
      label: 'Potential Savings',
      value: `$${analysisData.potentialSavings}`,
      icon: TrendingDown,
      color: '#22C55E',
      subtext: `${Math.round((analysisData.potentialSavings / analysisData.totalSpent) * 100)}% reduction`,
      details: {
        title: 'Savings Opportunities',
        items: analysisData.recommendations.slice(0, 3).map(r => ({
          label: r.title,
          value: `+$${r.savings}/mo`,
          percentage: r.impact
        }))
      }
    },
    {
      label: 'Total Requests',
      value: analysisData.totalRequests.toLocaleString(),
      icon: Zap,
      color: '#A855F7',
      subtext: 'API calls',
      details: {
        title: 'Request Distribution',
        items: analysisData.models.map(m => ({
          label: m.name,
          value: `${m.requests.toLocaleString()} requests`,
          percentage: `${m.usage}%`
        }))
      }
    },
  ]

  // Add extended thinking stat if present
  if (analysisData.extendedThinking?.count > 0) {
    stats.push({
      label: 'Extended Thinking',
      value: analysisData.extendedThinking.count.toLocaleString(),
      icon: Brain,
      color: '#F59E0B',
      subtext: `$${analysisData.extendedThinking.cost} (${analysisData.extendedThinking.percentage}%)`,
      details: {
        title: 'Extended Thinking Details',
        items: [
          { label: 'Total Requests', value: `${analysisData.extendedThinking.count}`, percentage: '' },
          { label: 'Extra Cost', value: `$${analysisData.extendedThinking.cost}`, percentage: '' },
          { label: 'Of Total Spend', value: `${analysisData.extendedThinking.percentage}%`, percentage: '' }
        ]
      }
    })
  } else {
    stats.push({
      label: 'Files Analyzed',
      value: analysisData.filesAnalyzed || 1,
      icon: FileText,
      color: '#3B82F6',
      subtext: 'CSV files processed',
      details: {
        title: 'Analysis Summary',
        items: [
          { label: 'Files Processed', value: `${analysisData.filesAnalyzed || 1}`, percentage: '' },
          { label: 'Total Rows', value: `${analysisData.totalRequests.toLocaleString()}`, percentage: '' },
          { label: 'Models Found', value: `${analysisData.models.length}`, percentage: '' }
        ]
      }
    })
  }

  // Handle recommendation click
  const handleRecClick = (index) => {
    setExpandedRec(expandedRec === index ? null : index)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="relative min-h-screen px-6 py-8 md:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
              Usage <span className="text-gradient">Dashboard</span>
            </h1>
            <motion.div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="text-xs font-semibold text-yellow-400">BETA</span>
            </motion.div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-300">Analysis Complete</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <TiltCard tiltAmount={8} glowIntensity={0.3}>
              <div 
                className="p-5 md:p-6 cursor-pointer"
                onClick={() => setSelectedStat(selectedStat === index ? null : index)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: stat.color }} />
                  </div>
                  <motion.div
                    animate={{ rotate: selectedStat === index ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-gray-500 hover:text-accent-400 transition-colors" />
                  </motion.div>
                </div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">{stat.label}</p>
                <p className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-xs">{stat.subtext}</p>

                {/* Expandable Details */}
                <AnimatePresence>
                  {selectedStat === index && stat.details && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      <p className="text-xs text-gray-400 mb-2">{stat.details.title}</p>
                      <div className="space-y-2">
                        {stat.details.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{item.value}</span>
                              {item.percentage && (
                                <span className="text-gray-500">{item.percentage}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Metrics Bar */}
      {analysisData.metrics && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: 'Avg Cost/Request', value: `$${analysisData.metrics.avgCostPerRequest?.toFixed(4) || '0.00'}` },
            { label: 'Avg Tokens/Request', value: (analysisData.metrics.avgTokensPerRequest || 0).toLocaleString() },
            { label: 'Duplicate Queries', value: `${analysisData.metrics.duplicatePercentage?.toFixed(1) || 0}%` },
            { label: 'Duplicate Cost', value: `$${analysisData.metrics.duplicateCost?.toFixed(2) || '0.00'}` },
          ].map((metric, i) => (
            <div key={metric.label} className="p-3 rounded-xl glass border border-white/5">
              <p className="text-gray-500 text-xs mb-1">{metric.label}</p>
              <p className="text-white font-semibold">{metric.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Usage by Model */}
        <motion.div variants={itemVariants}>
          <TiltCard tiltAmount={6} glowIntensity={0.25}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-accent-400" />
                <h3 className="font-display text-lg font-semibold text-white">
                  Usage by Model
                </h3>
              </div>

              <div className="flex items-center justify-center">
                <PieChart data={analysisData.models} totalCost={analysisData.totalSpent} />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {analysisData.models.map((model) => (
                  <div key={model.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: model.color }}
                    />
                    <span className="text-sm text-gray-400">
                      {model.name} ({model.usage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Weekly Usage */}
        <motion.div variants={itemVariants}>
          <TiltCard tiltAmount={6} glowIntensity={0.25}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingDown className="w-5 h-5 text-accent-400" />
                <h3 className="font-display text-lg font-semibold text-white">
                  Weekly Usage
                </h3>
              </div>

              <UsageChart data={analysisData.weeklyUsage} />
            </div>
          </TiltCard>
        </motion.div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-400" />
            <h3 className="font-display text-xl font-semibold text-white">
              Optimization Recommendations
            </h3>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Implement these changes to save up to ${analysisData.potentialSavings}/month
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisData.recommendations.map((rec, index) => {
            const CategoryIcon = categoryIcons[rec.category] || Lightbulb
            const isExpanded = expandedRec === index
            return (
              <motion.div
                key={rec.title}
                variants={itemVariants}
                onMouseEnter={() => setHoveredRec(index)}
                onMouseLeave={() => setHoveredRec(null)}
              >
                <motion.div
                  className={`
                    relative p-5 rounded-2xl glass cursor-pointer h-full
                    border transition-colors duration-300
                    ${hoveredRec === index || isExpanded ? 'border-accent-500/30' : 'border-white/5'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => handleRecClick(index)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          px-2.5 py-1 rounded-lg text-xs font-medium
                          ${impactColors[rec.impact].bg}
                          ${impactColors[rec.impact].text}
                          border ${impactColors[rec.impact].border}
                        `}
                      >
                        {rec.impact} impact
                      </div>
                      {rec.priority && (
                        <span className="text-gray-500 text-xs">#{rec.priority}</span>
                      )}
                    </div>
                    <span className="text-green-400 font-semibold text-sm">
                      +${rec.savings}/mo
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CategoryIcon className="w-4 h-4 text-accent-400" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-white mb-2">
                        {rec.title}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Implementation Steps */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        <p className="text-xs text-accent-400 font-medium mb-3">How to implement:</p>
                        <div className="space-y-2">
                          {getImplementationSteps(rec.title).map((step, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span className="text-accent-400 mt-0.5">{i + 1}.</span>
                              <span className="text-gray-400">{step}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <p className="text-xs text-gray-500">
                            Estimated time: {getEstimatedTime(rec.impact)} • 
                            Difficulty: {rec.impact === 'high' ? 'Easy' : rec.impact === 'medium' ? 'Medium' : 'Advanced'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="flex items-center gap-1 mt-4 text-accent-400 text-sm font-medium"
                    animate={{ x: hoveredRec === index ? 4 : 0 }}
                  >
                    {isExpanded ? 'Show less' : 'Learn more'}
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <TiltCard className="inline-block" tiltAmount={8} glowIntensity={0.4}>
          <div className="p-8">
            <h3 className="font-display text-xl font-semibold text-white mb-2">
              Ready to optimize?
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              Export your analysis report or share insights with your team
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="
                  px-5 py-2.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-accent-600 to-accent-500
                  hover:from-accent-500 hover:to-accent-400
                  text-white shadow-lg shadow-accent-500/25
                  transition-all duration-300 hover:shadow-accent-500/40
                  flex items-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                whileHover={!isExporting ? { scale: 1.02 } : {}}
                whileTap={!isExporting ? { scale: 0.98 } : {}}
              >
                <AnimatePresence mode="wait">
                  {exportSuccess ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : isExporting ? (
                    <motion.div
                      key="loading"
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <motion.div
                      key="download"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Download className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {exportSuccess ? 'Downloaded!' : isExporting ? 'Generating...' : 'Export PDF Report'}
              </motion.button>

              <motion.button
                onClick={handleShare}
                className="
                  px-5 py-2.5 rounded-xl font-medium text-sm
                  bg-dark-600/50 border border-white/10
                  text-gray-300 hover:text-white hover:border-white/20
                  transition-all duration-300 flex items-center gap-2
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {shareSuccess ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {shareSuccess ? 'Copied!' : 'Copy Summary'}
              </motion.button>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  )
}
