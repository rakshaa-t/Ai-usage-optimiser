import { useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Sparkles, ArrowRight, Folder, X, Check, AlertCircle, FolderOpen, Shield, Brain, Zap } from 'lucide-react'
import TiltCard from '../components/TiltCard'
import Papa from 'papaparse'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

export default function UploadPage({ onFileUpload, onAnalysisComplete }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [validationWarnings, setValidationWarnings] = useState([])

  // Recursively traverse folder entries to get all files
  const traverseFileTree = async (entry, path = '') => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file) => {
          file.relativePath = path + file.name
          resolve([file])
        })
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader()
        const entries = []

        const readEntries = () => {
          dirReader.readEntries(async (results) => {
            if (results.length) {
              entries.push(...results)
              readEntries()
            } else {
              const files = []
              for (const childEntry of entries) {
                const childFiles = await traverseFileTree(childEntry, path + entry.name + '/')
                files.push(...childFiles)
              }
              resolve(files)
            }
          })
        }
        readEntries()
      }
    })
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false)
    }
  }, [])

  // Validate file before adding
  const validateFile = useCallback((file) => {
    const errors = []
    const warnings = []

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name} exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push(`${file.name} is not a CSV file`)
    }

    return { errors, warnings, isValid: errors.length === 0 }
  }, [])

  const processFiles = useCallback((files) => {
    const csvFiles = Array.from(files).filter(file =>
      file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
    )

    if (csvFiles.length === 0) {
      setError('No CSV files found. Please upload CSV files or a folder containing them.')
      return
    }

    // Validate each file
    const allErrors = []
    const validFiles = []

    csvFiles.forEach(file => {
      const { errors, isValid } = validateFile(file)
      if (isValid) {
        validFiles.push(file)
      } else {
        allErrors.push(...errors)
      }
    })

    if (allErrors.length > 0) {
      setError(allErrors.join('. '))
      if (validFiles.length === 0) return
    } else {
      setError(null)
    }

    // Add new files, avoiding duplicates
    setUploadedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.relativePath || f.name))
      const newFiles = validFiles.filter(f => !existingNames.has(f.relativePath || f.name))
      return [...prev, ...newFiles]
    })

    onFileUpload?.(validFiles)
  }, [onFileUpload, validateFile])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const items = e.dataTransfer.items
    const allFiles = []

    if (items) {
      const entries = []
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.()
        if (entry) {
          entries.push(entry)
        }
      }

      for (const entry of entries) {
        const files = await traverseFileTree(entry)
        allFiles.push(...files)
      }
    } else {
      allFiles.push(...Array.from(e.dataTransfer.files))
    }

    if (allFiles.length > 0) {
      processFiles(allFiles)
    }
  }, [processFiles])

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(Array.from(files))
    }
    e.target.value = ''
  }, [processFiles])

  const handleFolderSelect = useCallback((e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const filesWithPath = Array.from(files).map(file => {
        file.relativePath = file.webkitRelativePath
        return file
      })
      processFiles(filesWithPath)
    }
    e.target.value = ''
  }, [processFiles])

  const removeFile = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([])
    setError(null)
    setValidationWarnings([])
    onFileUpload?.(null)
  }, [onFileUpload])

  // Validate CSV has required columns
  const validateCSVStructure = (headers) => {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
    const hasCost = normalizedHeaders.some(h =>
      ['cost', 'total_cost', 'price', 'amount', 'usd', 'total cost'].includes(h)
    )
    const hasModel = normalizedHeaders.some(h =>
      ['model', 'model_name', 'model_id', 'engine'].includes(h)
    )

    return hasCost || hasModel
  }

  const handleAnalyze = useCallback(async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)
    setError(null)

    try {
      const allData = []
      const allHeaders = new Set()
      let filesProcessed = 0
      const fileErrors = []

      for (const file of uploadedFiles) {
        // Additional size check
        if (file.size > MAX_FILE_SIZE) {
          fileErrors.push(`${file.name} exceeds 50MB limit`)
          continue
        }

        await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              // Check if file has headers
              if (!results.meta.fields || results.meta.fields.length === 0) {
                fileErrors.push(`${file.name} has no valid headers`)
                resolve()
                return
              }

              // Check for required columns
              if (!validateCSVStructure(results.meta.fields)) {
                fileErrors.push(`${file.name} missing required columns (cost or model)`)
                resolve()
                return
              }

              // Add headers to set
              results.meta.fields.forEach(h => allHeaders.add(h))

              const validRows = results.data.filter(row =>
                Object.values(row).some(v => v && v.toString().trim())
              )
              allData.push(...validRows)
              filesProcessed++
              setProcessingProgress(Math.round((filesProcessed / uploadedFiles.length) * 100))
              resolve()
            },
            error: (err) => {
              fileErrors.push(`${file.name}: ${err.message}`)
              resolve()
            }
          })
        })
      }

      // Check if we have any valid data
      if (allData.length === 0) {
        const errorMsg = fileErrors.length > 0
          ? fileErrors.join('. ')
          : 'No valid data found in CSV files. Ensure files have headers and contain cost or model columns.'
        setError(errorMsg)
        setIsProcessing(false)
        return
      }

      // Show warnings but continue
      if (fileErrors.length > 0) {
        setValidationWarnings(fileErrors)
      }

      // Analyze aggregated data
      const analysis = analyzeData(allData, uploadedFiles.length, Array.from(allHeaders))

      onAnalysisComplete?.(analysis)
      navigate('/analyzing')
    } catch (err) {
      setError('Failed to parse CSV files. Please check the file format.')
      setIsProcessing(false)
    }
  }, [uploadedFiles, onAnalysisComplete, navigate])

  // Helper to find column case-insensitively
  const findColumnValue = (row, possibleNames) => {
    const keys = Object.keys(row)
    for (const name of possibleNames) {
      const found = keys.find(k => k.toLowerCase().trim() === name.toLowerCase())
      if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') {
        return row[found]
      }
    }
    return null
  }

  // Comprehensive analysis engine
  const analyzeData = (data, fileCount, headers) => {
    // Column mappings
    const modelColumns = ['model', 'model_name', 'model_id', 'engine']
    const costColumns = ['cost', 'total_cost', 'price', 'amount', 'usd', 'total cost']
    const tokenColumns = ['tokens', 'total_tokens', 'token_count', 'usage', 'total tokens', 'input_tokens', 'output_tokens']
    const inputTokenColumns = ['input_tokens', 'prompt_tokens', 'input tokens']
    const outputTokenColumns = ['output_tokens', 'completion_tokens', 'output tokens']
    const maxModeColumns = ['max mode', 'max_mode', 'maxmode', 'extended_thinking', 'thinking_mode']
    const timestampColumns = ['timestamp', 'date', 'created_at', 'time', 'datetime']
    const durationColumns = ['duration', 'response_time', 'latency', 'time_ms']

    // Initialize metrics
    let totalCost = 0
    let totalTokens = 0
    let totalInputTokens = 0
    let totalOutputTokens = 0
    const modelUsage = {}
    const modelCosts = {}
    const modelTokens = {}

    // Extended thinking / Max Mode tracking
    let extendedThinkingCount = 0
    let extendedThinkingCost = 0

    // Time-based analysis
    const dailyUsage = {}
    const hourlyUsage = {}

    // Token efficiency metrics
    let totalDuration = 0
    let requestsWithDuration = 0

    // Duplicate detection
    const requestHashes = new Map()
    let duplicateCount = 0
    let duplicateCost = 0

    // Prompt length analysis
    const promptLengths = []

    // Cost per model tracking
    const costPerRequest = []

    // Process each row
    data.forEach((row, index) => {
      // Extract cost
      const costValue = findColumnValue(row, costColumns)
      const rowCost = costValue ? parseFloat(costValue) : 0
      if (!isNaN(rowCost) && rowCost > 0) {
        totalCost += rowCost
        costPerRequest.push(rowCost)
      }

      // Extract model
      const modelValue = findColumnValue(row, modelColumns)
      const model = modelValue ? modelValue.toString().trim() : 'Unknown'
      if (model && model !== 'Unknown') {
        modelUsage[model] = (modelUsage[model] || 0) + 1
        modelCosts[model] = (modelCosts[model] || 0) + rowCost
      }

      // Extract tokens
      const tokenValue = findColumnValue(row, tokenColumns)
      if (tokenValue) {
        const tokens = parseInt(tokenValue)
        if (!isNaN(tokens)) {
          totalTokens += tokens
          modelTokens[model] = (modelTokens[model] || 0) + tokens
        }
      }

      // Input/Output tokens breakdown
      const inputTokenValue = findColumnValue(row, inputTokenColumns)
      const outputTokenValue = findColumnValue(row, outputTokenColumns)
      if (inputTokenValue) totalInputTokens += parseInt(inputTokenValue) || 0
      if (outputTokenValue) totalOutputTokens += parseInt(outputTokenValue) || 0

      // Max Mode / Extended Thinking detection
      const maxModeValue = findColumnValue(row, maxModeColumns)
      if (maxModeValue) {
        const mode = maxModeValue.toString().toLowerCase().trim()
        if (mode === 'extended' || mode === 'true' || mode === 'yes' || mode === '1' || mode === 'enabled') {
          extendedThinkingCount++
          extendedThinkingCost += rowCost
        }
      }

      // Time-based analysis
      const timestampValue = findColumnValue(row, timestampColumns)
      if (timestampValue) {
        try {
          const date = new Date(timestampValue)
          if (!isNaN(date.getTime())) {
            const dayKey = date.toISOString().split('T')[0]
            const hour = date.getHours()

            dailyUsage[dayKey] = dailyUsage[dayKey] || { requests: 0, cost: 0 }
            dailyUsage[dayKey].requests++
            dailyUsage[dayKey].cost += rowCost

            hourlyUsage[hour] = hourlyUsage[hour] || { requests: 0, cost: 0 }
            hourlyUsage[hour].requests++
            hourlyUsage[hour].cost += rowCost
          }
        } catch (e) {}
      }

      // Duration tracking
      const durationValue = findColumnValue(row, durationColumns)
      if (durationValue) {
        const duration = parseFloat(durationValue)
        if (!isNaN(duration)) {
          totalDuration += duration
          requestsWithDuration++
        }
      }

      // Simple duplicate detection (based on model + approximate cost)
      const hashKey = `${model}-${Math.round(rowCost * 1000)}`
      if (requestHashes.has(hashKey)) {
        duplicateCount++
        duplicateCost += rowCost
      } else {
        requestHashes.set(hashKey, true)
      }
    })

    // Calculate derived metrics
    const totalRequests = data.length
    const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0
    const avgTokensPerRequest = totalRequests > 0 ? totalTokens / totalRequests : 0
    const avgDuration = requestsWithDuration > 0 ? totalDuration / requestsWithDuration : 0
    const duplicatePercentage = totalRequests > 0 ? (duplicateCount / totalRequests) * 100 : 0

    // Extended thinking metrics
    const extendedThinking = {
      count: extendedThinkingCount,
      cost: Math.round(extendedThinkingCost * 100) / 100,
      percentage: totalRequests > 0 ? Math.round((extendedThinkingCount / totalRequests) * 100) : 0
    }

    // Generate model breakdown
    const colors = ['#F97CF5', '#A855F7', '#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B']
    const modelEntries = Object.entries(modelUsage).sort((a, b) => b[1] - a[1])
    const totalModelRequests = modelEntries.reduce((sum, [_, count]) => sum + count, 0)

    const models = modelEntries.slice(0, 8).map(([name, count], index) => {
      const usage = Math.round((count / totalModelRequests) * 100)
      const cost = modelCosts[name] || 0
      const tokens = modelTokens[name] || 0
      const costPerReq = count > 0 ? cost / count : 0

      return {
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        usage,
        cost: Math.round(cost * 100) / 100,
        color: colors[index % colors.length],
        requests: count,
        tokens,
        avgCostPerRequest: Math.round(costPerReq * 10000) / 10000
      }
    })

    // Generate dynamic recommendations based on actual data patterns
    const recommendations = generateSmartRecommendations({
      models,
      modelUsage,
      modelCosts,
      totalCost,
      totalRequests,
      totalTokens,
      avgCostPerRequest,
      duplicateCount,
      duplicateCost,
      duplicatePercentage,
      extendedThinking,
      avgTokensPerRequest,
      totalInputTokens,
      totalOutputTokens,
      dailyUsage,
      hourlyUsage
    })

    // Generate weekly usage from actual data or create realistic distribution
    const weeklyUsage = generateWeeklyUsage(dailyUsage, totalRequests, totalCost)

    // Calculate potential savings
    const potentialSavings = recommendations.reduce((sum, rec) => sum + rec.savings, 0)

    return {
      totalSpent: Math.round(totalCost * 100) / 100,
      totalRequests,
      totalTokens,
      filesAnalyzed: fileCount,
      models,
      recommendations,
      weeklyUsage,
      potentialSavings: Math.round(potentialSavings),
      extendedThinking,
      metrics: {
        avgCostPerRequest: Math.round(avgCostPerRequest * 10000) / 10000,
        avgTokensPerRequest: Math.round(avgTokensPerRequest),
        avgDuration: Math.round(avgDuration * 100) / 100,
        duplicatePercentage: Math.round(duplicatePercentage * 10) / 10,
        duplicateCost: Math.round(duplicateCost * 100) / 100,
        inputOutputRatio: totalOutputTokens > 0 ? Math.round((totalInputTokens / totalOutputTokens) * 100) / 100 : 0
      }
    }
  }

  // Generate smart recommendations based on actual usage patterns
  const generateSmartRecommendations = (metrics) => {
    const recommendations = []
    const {
      models,
      modelUsage,
      modelCosts,
      totalCost,
      totalRequests,
      totalTokens,
      avgCostPerRequest,
      duplicateCount,
      duplicateCost,
      duplicatePercentage,
      extendedThinking,
      avgTokensPerRequest,
      totalInputTokens,
      totalOutputTokens,
      hourlyUsage
    } = metrics

    // 1. Model downgrade opportunities
    const expensiveModels = models.filter(m =>
      m.fullName?.toLowerCase().includes('gpt-4') ||
      m.fullName?.toLowerCase().includes('claude-3-opus') ||
      m.fullName?.toLowerCase().includes('claude-opus') ||
      m.fullName?.toLowerCase().includes('opus')
    )

    if (expensiveModels.length > 0) {
      const expensiveCost = expensiveModels.reduce((sum, m) => sum + m.cost, 0)
      const expensiveRequests = expensiveModels.reduce((sum, m) => sum + m.requests, 0)
      // Estimate 40% of expensive model usage could use cheaper models
      const potentialSavings = expensiveCost * 0.4 * 0.7 // 70% cost reduction on 40% of requests

      if (potentialSavings > 1) {
        recommendations.push({
          title: 'Use simpler models for basic tasks',
          description: `You're using premium AI models for ${expensiveRequests.toLocaleString()} requests. For straightforward tasks like formatting text, answering simple questions, or summarizing content, lighter models work just as well at a fraction of the cost.`,
          savings: Math.round(potentialSavings),
          impact: potentialSavings > totalCost * 0.15 ? 'high' : 'medium',
          category: 'model-optimization',
          actionable: true,
          details: expensiveModels.map(m => `${m.name}: ${m.requests} requests, $${m.cost.toFixed(2)}`).join(', ')
        })
      }
    }

    // 2. Extended thinking optimization
    if (extendedThinking.count > 0 && extendedThinking.cost > 0) {
      const savingsEstimate = extendedThinking.cost * 0.6 // Extended thinking costs ~2.5x more
      recommendations.push({
        title: 'Be selective with "deep thinking" mode',
        description: `${extendedThinking.count} of your requests (${extendedThinking.percentage}%) used extended thinking, adding $${extendedThinking.cost.toFixed(2)} to your bill. This powerful feature is best saved for complex problems that truly need it.`,
        savings: Math.round(savingsEstimate),
        impact: savingsEstimate > totalCost * 0.1 ? 'high' : 'medium',
        category: 'feature-optimization',
        actionable: true
      })
    }

    // 3. Duplicate/cache opportunities
    if (duplicatePercentage > 5) {
      recommendations.push({
        title: 'Save answers you use repeatedly',
        description: `About ${duplicatePercentage.toFixed(0)}% of your requests look similar to ones you've made before. By saving and reusing these responses, you could skip ${duplicateCount.toLocaleString()} redundant API calls.`,
        savings: Math.round(duplicateCost * 0.8),
        impact: duplicateCost > totalCost * 0.1 ? 'high' : 'medium',
        category: 'caching',
        actionable: true
      })
    }

    // 4. Token efficiency - Input/Output ratio analysis
    if (totalInputTokens > 0 && totalOutputTokens > 0) {
      const ioRatio = totalInputTokens / totalOutputTokens
      if (ioRatio > 3) {
        // High input ratio suggests verbose prompts
        const estimatedPromptSavings = totalCost * 0.15
        recommendations.push({
          title: 'Trim down your prompts',
          description: `Your prompts are ${ioRatio.toFixed(1)}x longer than the responses you get back. Try cutting unnecessary context, being more direct, or summarizing background information to reduce costs.`,
          savings: Math.round(estimatedPromptSavings),
          impact: 'medium',
          category: 'prompt-optimization',
          actionable: true
        })
      }
    }

    // 5. High token usage per request
    if (avgTokensPerRequest > 4000) {
      recommendations.push({
        title: 'Break up large requests',
        description: `Your average request uses ${avgTokensPerRequest.toLocaleString()} tokens — that's a lot! Consider splitting big documents into smaller pieces. You'll often get better results and spend less.`,
        savings: Math.round(totalCost * 0.12),
        impact: 'medium',
        category: 'architecture',
        actionable: true
      })
    }

    // 6. Off-peak scheduling
    if (Object.keys(hourlyUsage).length > 0) {
      const peakHours = Object.entries(hourlyUsage)
        .sort((a, b) => b[1].requests - a[1].requests)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour))

      if (peakHours.length > 0) {
        recommendations.push({
          title: 'Schedule non-urgent tasks',
          description: `Your busiest hours are around ${peakHours.map(h => `${h}:00`).join(', ')}. For tasks that don't need immediate responses, consider queuing them up to run during quieter times.`,
          savings: Math.round(totalCost * 0.05),
          impact: 'low',
          category: 'scheduling',
          actionable: true
        })
      }
    }

    // 7. Model-specific optimizations
    const claudeModels = models.filter(m => m.fullName?.toLowerCase().includes('claude'))
    if (claudeModels.length > 0) {
      const claudeCost = claudeModels.reduce((sum, m) => sum + m.cost, 0)
      if (claudeCost > 0) {
        recommendations.push({
          title: 'Turn on prompt caching for Claude',
          description: `You've spent $${claudeCost.toFixed(2)} on Claude models. If you're sending the same instructions repeatedly, enabling prompt caching can cut those repeated costs by up to 90%.`,
          savings: Math.round(claudeCost * 0.25),
          impact: claudeCost > totalCost * 0.3 ? 'high' : 'medium',
          category: 'provider-features',
          actionable: true
        })
      }
    }

    // 8. Streaming optimization
    if (totalRequests > 100) {
      recommendations.push({
        title: 'Use streaming for faster feedback',
        description: `With ${totalRequests.toLocaleString()} requests, streaming responses lets you see results as they're generated. You can stop early if something's off, saving tokens and getting answers faster.`,
        savings: Math.round(totalCost * 0.03),
        impact: 'low',
        category: 'ux-optimization',
        actionable: true
      })
    }

    // Sort by savings and take top recommendations
    return recommendations
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 6)
      .map((rec, index) => ({
        ...rec,
        priority: index + 1
      }))
  }

  // Generate weekly usage data
  const generateWeeklyUsage = (dailyUsage, totalRequests, totalCost) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // If we have actual daily data, aggregate by day of week
    if (Object.keys(dailyUsage).length > 0) {
      const weekdayAgg = {}
      days.forEach(day => { weekdayAgg[day] = { requests: 0, cost: 0, count: 0 } })

      Object.entries(dailyUsage).forEach(([dateStr, data]) => {
        const date = new Date(dateStr)
        const dayName = days[date.getDay()]
        weekdayAgg[dayName].requests += data.requests
        weekdayAgg[dayName].cost += data.cost
        weekdayAgg[dayName].count++
      })

      return days.slice(1).concat(days[0]).map(day => ({
        day,
        requests: weekdayAgg[day].count > 0
          ? Math.round(weekdayAgg[day].requests / weekdayAgg[day].count)
          : 0,
        cost: weekdayAgg[day].count > 0
          ? Math.round(weekdayAgg[day].cost / weekdayAgg[day].count * 100) / 100
          : 0
      }))
    }

    // Fallback: distribute based on typical patterns
    const distribution = [0.14, 0.17, 0.16, 0.18, 0.16, 0.11, 0.08]
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      day,
      requests: Math.round(totalRequests * distribution[i]),
      cost: Math.round(totalCost * distribution[i] * 100) / 100
    }))
  }

  const totalSize = uploadedFiles.reduce((acc, file) => acc + file.size, 0)

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-sm text-gray-300">AI-Powered Analysis</span>
          </motion.div>
          
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span className="text-xs font-semibold text-yellow-400">BETA</span>
          </motion.div>
        </div>

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
        className="w-full max-w-2xl"
      >
        <TiltCard tiltAmount={8} glowIntensity={0.5}>
          <div
            className={`
              relative p-8 md:p-10 transition-all duration-300
              ${isDragging ? 'bg-accent-500/10' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              onChange={handleFolderSelect}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {uploadedFiles.length === 0 ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  {/* Animated drop zone icon */}
                  <motion.div
                    className={`
                      relative w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center
                      ${isDragging
                        ? 'bg-accent-500/20 border-accent-400'
                        : 'bg-dark-600/50 border-white/10'
                      }
                      border-2 border-dashed transition-all duration-300
                    `}
                    animate={isDragging ? {
                      scale: 1.1,
                      borderColor: 'rgba(217, 70, 239, 0.8)'
                    } : {
                      scale: 1
                    }}
                  >
                    <motion.div
                      animate={isDragging ? {
                        y: [0, -8, 0],
                        transition: { repeat: Infinity, duration: 0.8 }
                      } : {}}
                    >
                      {isDragging ? (
                        <FolderOpen className="w-10 h-10 text-accent-400" />
                      ) : (
                        <Upload className="w-10 h-10 text-gray-400" />
                      )}
                    </motion.div>

                    {isDragging && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-accent-400"
                          initial={{ opacity: 0.6, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.5 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-accent-400"
                          initial={{ opacity: 0.6, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.5 }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                        />
                      </>
                    )}
                  </motion.div>

                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    {isDragging ? 'Drop files or folder here' : 'Upload Usage Data'}
                  </h3>

                  <p className="text-gray-400 text-sm mb-6">
                    Drag & drop CSV files or an entire folder
                  </p>

                  <div className="flex gap-3 justify-center flex-wrap">
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="
                        px-5 py-2.5 rounded-xl font-medium text-sm
                        bg-dark-600/50 border border-white/10
                        text-gray-300 hover:text-white hover:border-accent-500/50
                        transition-all duration-300 flex items-center gap-2
                        hover:bg-dark-500/50
                      "
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FileText className="w-4 h-4" />
                      Select Files
                    </motion.button>

                    <motion.button
                      onClick={() => folderInputRef.current?.click()}
                      className="
                        px-6 py-2.5 rounded-xl font-medium text-sm
                        bg-gradient-to-r from-accent-600 to-accent-500
                        hover:from-accent-500 hover:to-accent-400
                        text-white shadow-lg shadow-accent-500/25
                        transition-all duration-300 hover:shadow-accent-500/40
                        flex items-center gap-2
                      "
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Folder className="w-4 h-4" />
                      Select Folder
                    </motion.button>
                  </div>

                  {/* Validation info */}
                  <div className="flex items-center justify-center gap-4 mt-6 text-gray-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Max 50MB per file
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      CSV with cost/model columns
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="files"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {/* Files header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="w-10 h-10 rounded-xl bg-accent-500/20 border border-accent-400/30 flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-accent-400" />
                      </motion.div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">
                          {uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'} Ready
                        </h3>
                        <p className="text-gray-500 text-xs">
                          {(totalSize / 1024).toFixed(1)} KB total
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearAllFiles}
                      className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* File list */}
                  <div className="max-h-48 overflow-y-auto mb-6 space-y-2 pr-2 scrollbar-thin">
                    <AnimatePresence>
                      {uploadedFiles.map((file, index) => (
                        <motion.div
                          key={file.relativePath || file.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 border border-white/5 group hover:border-accent-500/20 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-accent-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {file.relativePath || file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add more files zone */}
                  <div
                    className={`
                      p-4 rounded-xl border-2 border-dashed mb-6 text-center cursor-pointer
                      transition-all duration-300
                      ${isDragging
                        ? 'border-accent-400 bg-accent-500/10'
                        : 'border-dark-500 hover:border-accent-500/30 hover:bg-dark-700/30'
                      }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <p className="text-gray-400 text-sm">
                      {isDragging ? 'Drop to add more files' : 'Drop or click to add more files'}
                    </p>
                  </div>

                  {/* Validation warnings */}
                  <AnimatePresence>
                    {validationWarnings.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                      >
                        <p className="text-yellow-400 text-xs font-medium mb-1">Warnings:</p>
                        {validationWarnings.map((warning, i) => (
                          <p key={i} className="text-yellow-400/70 text-xs">{warning}</p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Progress bar when processing */}
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6"
                    >
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Processing files...</span>
                        <span className="text-accent-400">{processingProgress}%</span>
                      </div>
                      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${processingProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      onClick={() => folderInputRef.current?.click()}
                      className="
                        px-5 py-2.5 rounded-xl font-medium text-sm
                        bg-dark-600/50 border border-white/10
                        text-gray-300 hover:text-white hover:border-white/20
                        transition-all duration-300 flex items-center gap-2
                      "
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Folder className="w-4 h-4" />
                      Add Folder
                    </motion.button>

                    <motion.button
                      onClick={handleAnalyze}
                      disabled={isProcessing}
                      className="
                        px-8 py-2.5 rounded-xl font-medium text-sm
                        bg-gradient-to-r from-accent-600 to-accent-500
                        hover:from-accent-500 hover:to-accent-400
                        text-white shadow-lg shadow-accent-500/25
                        transition-all duration-300 hover:shadow-accent-500/40
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center gap-2
                      "
                      whileHover={!isProcessing ? { scale: 1.02 } : {}}
                      whileTap={!isProcessing ? { scale: 0.98 } : {}}
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze {uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
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
        {[
          { label: 'Smart Cost Analysis', icon: Brain },
          { label: 'Model Optimization', icon: Zap },
          { label: 'Dynamic Insights', icon: Sparkles },
          { label: 'PDF Reports', icon: FileText }
        ].map((feature, i) => (
          <motion.div
            key={feature.label}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <feature.icon className="w-4 h-4 text-accent-400/60" />
            {feature.label}
          </motion.div>
        ))}
      </motion.div>

      {/* Footer with Privacy Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center"
      >
        <Link
          to="/privacy"
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
        >
          <Shield className="w-3 h-3" />
          <span>Privacy Policy</span>
        </Link>
      </motion.div>
    </div>
  )
}
