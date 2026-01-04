import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PieChart({ data, size = 200 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  
  const total = data.reduce((sum, item) => sum + item.usage, 0)
  const radius = size / 2 - 10
  const centerX = size / 2
  const centerY = size / 2
  
  let currentAngle = -90

  const createArcPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = centerX + outerRadius * Math.cos(startRad)
    const y1 = centerY + outerRadius * Math.sin(startRad)
    const x2 = centerX + outerRadius * Math.cos(endRad)
    const y2 = centerY + outerRadius * Math.sin(endRad)
    const x3 = centerX + innerRadius * Math.cos(endRad)
    const y3 = centerY + innerRadius * Math.sin(endRad)
    const x4 = centerX + innerRadius * Math.cos(startRad)
    const y4 = centerY + innerRadius * Math.sin(startRad)
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    
    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `
  }

  const segments = data.map((item, index) => {
    const angle = (item.usage / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    
    return {
      ...item,
      startAngle,
      endAngle,
      index,
    }
  })

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-0">
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="30"
        />
        
        {/* Segments */}
        {segments.map((segment) => {
          const isHovered = hoveredIndex === segment.index
          const innerRadius = isHovered ? radius - 38 : radius - 35
          const outerRadius = isHovered ? radius + 5 : radius
          
          return (
            <motion.path
              key={segment.name}
              d={createArcPath(segment.startAngle, segment.endAngle - 0.5, innerRadius, outerRadius)}
              fill={segment.color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
              }}
              transition={{ 
                duration: 0.5, 
                delay: segment.index * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              onMouseEnter={() => setHoveredIndex(segment.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ 
                cursor: 'pointer',
                transformOrigin: `${centerX}px ${centerY}px`,
              }}
            />
          )
        })}
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 40}
          fill="#12121a"
        />
      </svg>
      
      {/* Center content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        {hoveredIndex !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-gray-400 text-xs mb-1">
              {data[hoveredIndex].name}
            </p>
            <p className="font-display text-2xl font-bold text-white">
              {data[hoveredIndex].usage}%
            </p>
            <p className="text-gray-500 text-xs">
              ${data[hoveredIndex].cost.toFixed(2)}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-gray-400 text-xs mb-1">Total</p>
            <p className="font-display text-2xl font-bold text-white">
              ${data.reduce((sum, item) => sum + item.cost, 0).toFixed(0)}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
