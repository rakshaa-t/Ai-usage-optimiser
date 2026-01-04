import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Tooltip, { TooltipContent } from './Tooltip'

export default function UsageChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [tooltipAnchor, setTooltipAnchor] = useState(null)
  const containerRef = useRef(null)

  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500">
        No usage data available
      </div>
    )
  }

  const maxRequests = Math.max(...data.map(d => d.requests || 0), 1)
  const chartHeight = 180

  const handleBarHover = useCallback((index, event) => {
    const barElement = event.currentTarget
    const rect = barElement.getBoundingClientRect()

    setHoveredIndex(index)
    setTooltipAnchor({
      x: rect.left + rect.width / 2,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    setTooltipAnchor(null)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-[180px] flex flex-col justify-between text-xs text-gray-500 pr-2">
        <span>{maxRequests}</span>
        <span>{Math.round(maxRequests * 0.5)}</span>
        <span>0</span>
      </div>

      {/* Chart container */}
      <div className="ml-8">
        {/* Grid lines */}
        <div className="absolute left-8 right-0 top-0 h-[180px] flex flex-col justify-between pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="border-t border-white/5 w-full"
            />
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between gap-2 h-[180px]">
          {data.map((item, index) => {
            const barHeight = ((item.requests || 0) / maxRequests) * chartHeight
            const isHovered = hoveredIndex === index

            return (
              <div
                key={item.day}
                className="flex-1 flex flex-col items-center relative"
              >
                {/* Bar container */}
                <div
                  className="w-full flex items-end justify-center"
                  style={{ height: chartHeight }}
                >
                  <motion.div
                    className="w-full max-w-[40px] rounded-t-lg cursor-pointer relative overflow-hidden"
                    initial={{ height: 0 }}
                    animate={{ height: barHeight }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.08,
                      type: 'spring',
                      stiffness: 80,
                      damping: 15,
                    }}
                    style={{
                      background: isHovered
                        ? 'linear-gradient(180deg, #F97CF5 0%, #A855F7 100%)'
                        : 'linear-gradient(180deg, rgba(249, 124, 245, 0.7) 0%, rgba(168, 85, 247, 0.7) 100%)',
                      boxShadow: isHovered
                        ? '0 0 20px rgba(249, 124, 245, 0.5), 0 0 40px rgba(249, 124, 245, 0.2)'
                        : 'none',
                      minHeight: item.requests > 0 ? '4px' : '0px',
                    }}
                    onMouseEnter={(e) => handleBarHover(index, e)}
                    onMouseLeave={handleMouseLeave}
                    whileHover={{ scale: 1.08 }}
                  >
                    {/* Shine effect */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%)',
                        opacity: isHovered ? 1 : 0.6,
                      }}
                    />
                  </motion.div>
                </div>

                {/* Day label */}
                <span className={`text-xs mt-2 transition-colors duration-200 ${
                  isHovered ? 'text-white font-medium' : 'text-gray-500'
                }`}>
                  {item.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Portal Tooltip */}
      <Tooltip
        isVisible={hoveredIndex !== null}
        anchorRect={tooltipAnchor}
        position="top"
      >
        {hoveredIndex !== null && (
          <TooltipContent>
            <div className="text-center">
              <p className="text-white text-sm font-semibold">{data[hoveredIndex].requests.toLocaleString()}</p>
              <p className="text-gray-400 text-xs">requests</p>
              <p className="text-accent-400 text-xs font-medium mt-1">${data[hoveredIndex].cost}</p>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
}
