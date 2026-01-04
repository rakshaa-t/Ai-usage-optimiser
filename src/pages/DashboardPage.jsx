import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingDown, 
  Zap, 
  ArrowUpRight,
  ArrowLeft,
  Lightbulb,
  ChevronRight,
  BarChart3
} from 'lucide-react'
import TiltCard from '../components/TiltCard'
import PieChart from '../components/PieChart'
import UsageChart from '../components/UsageChart'

const defaultData = {
  totalSpent: 229,
  totalRequests: 1250,
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

const impactColors = {
  high: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
}

export default function DashboardPage({ data }) {
  const navigate = useNavigate()
  const analysisData = data || defaultData
  const [hoveredRec, setHoveredRec] = useState(null)

  const stats = [
    {
      label: 'Total Spent',
      value: `$${analysisData.totalSpent}`,
      icon: DollarSign,
      color: '#F97CF5',
      subtext: 'This month'
    },
    {
      label: 'Potential Savings',
      value: `$${analysisData.potentialSavings}`,
      icon: TrendingDown,
      color: '#22C55E',
      subtext: `${Math.round((analysisData.potentialSavings / analysisData.totalSpent) * 100)}% reduction`
    },
    {
      label: 'Total Requests',
      value: analysisData.totalRequests.toLocaleString(),
      icon: Zap,
      color: '#A855F7',
      subtext: 'API calls'
    },
  ]

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
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
            Usage <span className="text-gradient">Dashboard</span>
          </h1>
        </div>
        
        <motion.div
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-300">Analysis Complete</span>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <TiltCard tiltAmount={8} glowIntensity={0.3}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="font-display text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-xs">{stat.subtext}</p>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

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
                <PieChart data={analysisData.models} />
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
          {analysisData.recommendations.map((rec, index) => (
            <motion.div
              key={rec.title}
              variants={itemVariants}
              onMouseEnter={() => setHoveredRec(index)}
              onMouseLeave={() => setHoveredRec(null)}
            >
              <motion.div
                className={`
                  relative p-5 rounded-2xl glass cursor-pointer
                  border transition-colors duration-300
                  ${hoveredRec === index ? 'border-accent-500/30' : 'border-white/5'}
                `}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="flex items-start justify-between mb-3">
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
                  <span className="text-green-400 font-semibold text-sm">
                    +${rec.savings}/mo
                  </span>
                </div>
                
                <h4 className="font-display font-semibold text-white mb-2">
                  {rec.title}
                </h4>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {rec.description}
                </p>
                
                <motion.div
                  className="flex items-center gap-1 mt-4 text-accent-400 text-sm font-medium"
                  animate={{ x: hoveredRec === index ? 4 : 0 }}
                >
                  Learn more
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
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
              Export this analysis or set up automated monitoring for your API usage
            </p>
            <div className="flex gap-3 justify-center">
              <button className="
                px-5 py-2.5 rounded-xl font-medium text-sm
                bg-dark-600/50 border border-white/10
                text-gray-300 hover:text-white hover:border-white/20
                transition-all duration-300
              ">
                Export Report
              </button>
              <button className="
                px-6 py-2.5 rounded-xl font-medium text-sm
                bg-gradient-to-r from-accent-600 to-accent-500
                hover:from-accent-500 hover:to-accent-400
                text-white shadow-lg shadow-accent-500/25
                transition-all duration-300 hover:shadow-accent-500/40
                hover:scale-105 active:scale-95
              ">
                Set Up Monitoring
              </button>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  )
}
