import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tooltip, { TooltipContent } from './Tooltip'

// Clean color palette with primary and accent
const chartColors = [
  '#F97CF5', // Primary pink
  '#06B6D4', // Accent cyan
  '#A855F7', // Purple
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#14B8A6', // Teal
]

export default function PieChart({ data, size = 280, totalCost }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [tooltipAnchor, setTooltipAnchor] = useState(null)
  const containerRef = useRef(null)

  const total = data.reduce((sum, item) => sum + item.usage, 0)
  const radius = size / 2 - 30
  const strokeWidth = 24 // Thinner, sleeker segments
  const innerRadius = radius - strokeWidth

  const centerX = size / 2
  const centerY = size / 2

  // Calculate segments
  const segments = useMemo(() => {
    let currentAngle = -90
    return data.map((item, index) => {
      const angle = (item.usage / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      const midAngle = startAngle + angle / 2
      currentAngle = endAngle

      return {
        ...item,
        startAngle,
        endAngle,
        midAngle,
        index,
        color: chartColors[index % chartColors.length],
      }
    })
  }, [data, total])

  // Create arc path for donut segment
  const createArcPath = (startAngle, endAngle, r) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = centerX + r * Math.cos(startRad)
    const y1 = centerY + r * Math.sin(startRad)
    const x2 = centerX + r * Math.cos(endRad)
    const y2 = centerY + r * Math.sin(endRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  const handleSegmentHover = useCallback((segment, index) => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const midRad = (segment.midAngle * Math.PI) / 180
    const tooltipRadius = radius + 40
    const offsetX = tooltipRadius * Math.cos(midRad)
    const offsetY = tooltipRadius * Math.sin(midRad)

    setHoveredIndex(index)
    setTooltipAnchor({
      x: containerRect.left + centerX + offsetX,
      y: containerRect.top + centerY + offsetY,
      width: 0,
      height: 0,
    })
  }, [centerX, centerY, radius])

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    setTooltipAnchor(null)
  }, [])

  const displayTotal = totalCost || data.reduce((sum, item) => sum + item.cost, 0)

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Background track */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {segments.map((segment) => {
          const isHovered = hoveredIndex === segment.index
          const isOtherHovered = hoveredIndex !== null && !isHovered
          const gap = 2 // Gap between segments in degrees

          return (
            <motion.path
              key={segment.name}
              d={createArcPath(
                segment.startAngle + gap / 2,
                segment.endAngle - gap / 2,
                radius - strokeWidth / 2
              )}
              fill="none"
              stroke={segment.color}
              strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: isOtherHovered ? 0.4 : 1,
                strokeWidth: isHovered ? strokeWidth + 6 : strokeWidth,
              }}
              transition={{
                pathLength: { duration: 0.8, delay: segment.index * 0.1, ease: 'easeOut' },
                opacity: { duration: 0.2 },
                strokeWidth: { duration: 0.2 },
              }}
              onMouseEnter={() => handleSegmentHover(segment, segment.index)}
              onMouseLeave={handleMouseLeave}
              style={{
                cursor: 'pointer',
                filter: isHovered ? `drop-shadow(0 0 8px ${segment.color}40)` : 'none',
              }}
            />
          )
        })}
      </svg>

      {/* Center content */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          width: innerRadius * 1.6,
          height: innerRadius * 1.6,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={hoveredIndex !== null ? `hovered-${hoveredIndex}` : 'default'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="text-center"
          >
            {hoveredIndex !== null ? (
              <>
                <div
                  className="w-2.5 h-2.5 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: segments[hoveredIndex].color }}
                />
                <p className="text-gray-400 text-xs mb-1 truncate max-w-[100px]">
                  {data[hoveredIndex].name}
                </p>
                <p className="font-display text-2xl font-bold text-white">
                  {data[hoveredIndex].usage}%
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-xs mb-1">Total Spent</p>
                <p className="font-display text-2xl font-bold text-white">
                  ${displayTotal.toFixed(0)}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tooltip */}
      <Tooltip
        isVisible={hoveredIndex !== null}
        anchorRect={tooltipAnchor}
        position="radial"
      >
        {hoveredIndex !== null && (
          <TooltipContent className="min-w-[140px]">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: segments[hoveredIndex].color }}
              />
              <p className="text-white font-medium text-sm truncate">
                {data[hoveredIndex].fullName || data[hoveredIndex].name}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Usage</span>
                <span className="text-white font-semibold text-sm">
                  {data[hoveredIndex].usage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Cost</span>
                <span className="text-accent-400 font-semibold text-sm">
                  ${data[hoveredIndex].cost.toFixed(2)}
                </span>
              </div>
              {data[hoveredIndex].requests && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Requests</span>
                  <span className="text-gray-300 text-sm">
                    {data[hoveredIndex].requests.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
}
