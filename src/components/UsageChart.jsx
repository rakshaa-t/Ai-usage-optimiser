import { useState, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'

// Custom tooltip for neumorphic style
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div
      className="bg-neu-bg rounded-neu px-4 py-3"
      style={{
        boxShadow: '4px 4px 8px #d1cec9, -4px -4px 8px #ffffff',
      }}
    >
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="text-text-primary font-display font-bold text-lg">
        {data.requests?.toLocaleString() || 0}
      </p>
      <p className="text-text-muted text-xs">requests</p>
      {data.cost !== undefined && (
        <p className="text-coral-500 font-semibold text-sm mt-1">
          ${typeof data.cost === 'number' ? data.cost.toFixed(2) : data.cost}
        </p>
      )}
    </div>
  )
}

// Custom bar shape with rounded top corners
const RoundedBar = (props) => {
  const { x, y, width, height, fill, isHovered } = props
  const radius = 6

  if (height <= 0) return null

  // Only round top corners
  const path = `
    M ${x},${y + height}
    L ${x},${y + radius}
    Q ${x},${y} ${x + radius},${y}
    L ${x + width - radius},${y}
    Q ${x + width},${y} ${x + width},${y + radius}
    L ${x + width},${y + height}
    Z
  `

  return (
    <path
      d={path}
      fill={fill}
      style={{
        filter: isHovered ? `drop-shadow(0 4px 8px ${fill}50)` : 'none',
        transition: 'filter 0.2s ease-out',
      }}
    />
  )
}

export default function UsageChart({ data, height = 220 }) {
  const [activeIndex, setActiveIndex] = useState(null)

  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-text-muted bg-neu-bg rounded-neu"
        style={{
          height,
          boxShadow: 'inset 4px 4px 8px #d1cec9, inset -4px -4px 8px #ffffff',
        }}
      >
        No usage data available
      </div>
    )
  }

  const onBarEnter = useCallback((_, index) => {
    setActiveIndex(index)
  }, [])

  const onBarLeave = useCallback(() => {
    setActiveIndex(null)
  }, [])

  return (
    <div
      className="bg-neu-bg rounded-neu p-4"
      style={{
        boxShadow: 'inset 4px 4px 8px #d1cec9, inset -4px -4px 8px #ffffff',
      }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#d1cec9"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9B9B9B', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9B9B9B', fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
              return value
            }}
            dx={-5}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(209, 206, 201, 0.3)' }}
          />
          <Bar
            dataKey="requests"
            radius={[6, 6, 0, 0]}
            shape={(props) => (
              <RoundedBar {...props} isHovered={activeIndex === props.index} />
            )}
            onMouseEnter={onBarEnter}
            onMouseLeave={onBarLeave}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={activeIndex === index ? '#FF6B6B' : '#4ECDC4'}
                style={{
                  cursor: 'pointer',
                  transition: 'fill 0.2s ease-out',
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Compact variant for smaller spaces
export function UsageChartCompact({ data, height = 120 }) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-text-muted text-sm"
        style={{ height }}
      >
        No data
      </div>
    )
  }

  const maxRequests = Math.max(...data.map(d => d.requests || 0), 1)

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = ((item.requests || 0) / maxRequests) * (height - 24)
        return (
          <div key={item.day} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t transition-all duration-200 hover:bg-coral-500"
              style={{
                height: Math.max(barHeight, item.requests > 0 ? 4 : 0),
                backgroundColor: '#4ECDC4',
              }}
            />
            <span className="text-text-muted text-xs mt-1">{item.day}</span>
          </div>
        )
      })}
    </div>
  )
}
