import { useState, useCallback } from 'react'
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

// Muted, harmonious color palette (Dieter Rams inspired)
const COLORS = [
  '#FF6B6B', // Coral - primary
  '#4ECDC4', // Teal - secondary
  '#45B7D1', // Blue
  '#96CEB4', // Sage
  '#DDA0DD', // Plum
  '#F7DC6F', // Muted gold
  '#85C1E9', // Sky
  '#D7BDE2', // Lavender
]

// Custom active shape for smooth hover effect
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: `drop-shadow(0 4px 8px ${fill}40)`,
          transition: 'all 0.2s ease-out',
        }}
      />
    </g>
  )
}

export default function PieChart({ data, size = 280, totalCost }) {
  const [activeIndex, setActiveIndex] = useState(null)

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActiveIndex(null)
  }, [])

  // Format data for Recharts
  const chartData = data.map((item, index) => ({
    ...item,
    value: item.usage,
    fill: COLORS[index % COLORS.length],
  }))

  const displayTotal = totalCost || data.reduce((sum, item) => sum + item.cost, 0)
  const activeItem = activeIndex !== null ? data[activeIndex] : null

  return (
    <div className="relative flex items-center justify-center">
      {/* Neumorphic container */}
      <div
        className="relative rounded-full bg-neu-bg p-4"
        style={{
          width: size + 32,
          height: size + 32,
          boxShadow: 'inset 6px 6px 12px #d1cec9, inset -6px -6px 12px #ffffff',
        }}
      >
        {/* Inner raised ring */}
        <div
          className="absolute rounded-full bg-neu-bg"
          style={{
            top: 16,
            left: 16,
            right: 16,
            bottom: 16,
            boxShadow: '4px 4px 8px #d1cec9, -4px -4px 8px #ffffff',
          }}
        />

        {/* Chart */}
        <ResponsiveContainer width={size} height={size}>
          <RechartsPie>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.28}
              outerRadius={size * 0.42}
              paddingAngle={3}
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke="transparent"
                  style={{
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease-out',
                    opacity: activeIndex !== null && activeIndex !== index ? 0.4 : 1,
                  }}
                />
              ))}
            </Pie>
          </RechartsPie>
        </ResponsiveContainer>

        {/* Center content */}
        <div
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.5,
            height: size * 0.5,
          }}
        >
          <AnimatePresence mode="wait">
            {activeItem ? (
              <motion.div
                key={`active-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="text-center"
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{
                    backgroundColor: COLORS[activeIndex % COLORS.length],
                    boxShadow: `0 2px 8px ${COLORS[activeIndex % COLORS.length]}60`,
                  }}
                />
                <p className="text-text-muted text-xs mb-1 truncate max-w-[90px]">
                  {activeItem.name}
                </p>
                <p className="font-display text-2xl font-bold text-text-primary">
                  {activeItem.usage}%
                </p>
                <p className="text-coral-500 text-sm font-semibold">
                  ${activeItem.cost.toFixed(2)}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="text-center"
              >
                <p className="text-text-muted text-xs mb-1 uppercase tracking-wide">
                  Total Spent
                </p>
                <p className="font-display text-3xl font-bold text-text-primary">
                  ${displayTotal.toFixed(0)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Legend component for use alongside the pie chart
export function PieChartLegend({ data }) {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: COLORS[index % COLORS.length],
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              }}
            />
            <span className="text-text-secondary text-sm truncate">
              {item.fullName || item.name}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-text-primary font-semibold text-sm">
              {item.usage}%
            </span>
            <span className="text-coral-500 font-semibold text-sm w-16 text-right">
              ${item.cost.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
