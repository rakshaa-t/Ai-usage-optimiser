import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tooltip, { TooltipContent } from './Tooltip'

export default function PieChart({ data, size = 220, totalCost }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [tooltipAnchor, setTooltipAnchor] = useState(null)
  const containerRef = useRef(null)

  const total = data.reduce((sum, item) => sum + item.usage, 0)
  const radius = size / 2 - 15
  const innerRadius = radius - 35
  const centerX = size / 2
  const centerY = size / 2

  let currentAngle = -90

  const createArcPath = (startAngle, endAngle, inner, outer) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = centerX + outer * Math.cos(startRad)
    const y1 = centerY + outer * Math.sin(startRad)
    const x2 = centerX + outer * Math.cos(endRad)
    const y2 = centerY + outer * Math.sin(endRad)
    const x3 = centerX + inner * Math.cos(endRad)
    const y3 = centerY + inner * Math.sin(endRad)
    const x4 = centerX + inner * Math.cos(startRad)
    const y4 = centerY + inner * Math.sin(startRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `
      M ${x1} ${y1}
      A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `
  }

  const segments = data.map((item, index) => {
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
    }
  })

  const handleSegmentHover = useCallback((segment, index) => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const midRad = (segment.midAngle * Math.PI) / 180

    // Position tooltip outside the chart based on segment angle
    const tooltipRadius = radius + 50
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
      {/* SVG Chart */}
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Background ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 17}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="35"
        />

        {/* Segments */}
        {segments.map((segment) => {
          const isHovered = hoveredIndex === segment.index
          const hoverInner = innerRadius - 3
          const hoverOuter = radius + 8

          return (
            <g key={segment.name}>
              {/* Glow effect on hover */}
              {isHovered && (
                <motion.path
                  d={createArcPath(
                    segment.startAngle,
                    segment.endAngle - 0.8,
                    hoverInner - 5,
                    hoverOuter + 5
                  )}
                  fill={segment.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  style={{ filter: 'blur(15px)' }}
                />
              )}

              {/* Main segment */}
              <motion.path
                d={createArcPath(
                  segment.startAngle,
                  segment.endAngle - 0.8,
                  isHovered ? hoverInner : innerRadius,
                  isHovered ? hoverOuter : radius
                )}
                fill={segment.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: hoveredIndex === null || isHovered ? 1 : 0.5,
                  scale: 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: segment.index * 0.08,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
                onMouseEnter={() => handleSegmentHover(segment, segment.index)}
                onMouseLeave={handleMouseLeave}
                style={{
                  cursor: 'pointer',
                  transformOrigin: `${centerX}px ${centerY}px`,
                }}
              />
            </g>
          )
        })}

        {/* Inner circle (donut hole) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 5}
          fill="#0a0a0f"
        />

        {/* Subtle inner ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 5}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      </svg>

      {/* Center content */}
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{
          width: (innerRadius - 10) * 2,
          height: (innerRadius - 10) * 2,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={hoveredIndex !== null ? 'hovered' : 'default'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="text-center"
          >
            <p className="text-gray-500 text-xs mb-0.5">
              {hoveredIndex !== null ? 'Usage' : 'Total Cost'}
            </p>
            <p className="font-display text-xl font-bold text-white">
              {hoveredIndex !== null
                ? `${data[hoveredIndex].usage}%`
                : `$${displayTotal.toFixed(0)}`}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Portal Tooltip - renders at document.body level to avoid clipping */}
      <Tooltip
        isVisible={hoveredIndex !== null}
        anchorRect={tooltipAnchor}
        position="radial"
      >
        {hoveredIndex !== null && (
          <TooltipContent className="min-w-[150px]">
            {/* Color indicator and name */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: data[hoveredIndex].color }}
              />
              <p className="text-white font-medium text-sm">
                {data[hoveredIndex].fullName || data[hoveredIndex].name}
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 text-xs">Usage</span>
                <span className="text-white font-semibold text-sm">
                  {data[hoveredIndex].usage}%
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 text-xs">Cost</span>
                <span className="text-accent-400 font-semibold text-sm">
                  ${data[hoveredIndex].cost.toFixed(2)}
                </span>
              </div>
              {data[hoveredIndex].requests && (
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-500 text-xs">Requests</span>
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
