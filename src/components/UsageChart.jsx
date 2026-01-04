import { useState } from 'react'
import { motion } from 'framer-motion'

export default function UsageChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  
  const maxRequests = Math.max(...data.map(d => d.requests))
  const maxCost = Math.max(...data.map(d => d.cost))

  return (
    <div className="relative">
      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-48 px-2">
        {data.map((item, index) => {
          const height = (item.requests / maxRequests) * 100
          const isHovered = hoveredIndex === index
          
          return (
            <div
              key={item.day}
              className="flex-1 flex flex-col items-center gap-2"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 10,
                }}
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg bg-dark-600 border border-white/10 text-center whitespace-nowrap z-10"
                style={{
                  left: `${(index / (data.length - 1)) * 100}%`,
                }}
              >
                <p className="text-white text-sm font-semibold">{item.requests}</p>
                <p className="text-gray-400 text-xs">requests</p>
                <p className="text-accent-400 text-xs">${item.cost}</p>
              </motion.div>
              
              {/* Bar */}
              <div className="relative w-full flex-1 flex items-end">
                <motion.div
                  className="w-full rounded-t-lg cursor-pointer relative overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ 
                    height: `${height}%`,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                  }}
                  style={{
                    background: isHovered 
                      ? 'linear-gradient(180deg, #F97CF5 0%, #A855F7 100%)'
                      : 'linear-gradient(180deg, rgba(249, 124, 245, 0.6) 0%, rgba(168, 85, 247, 0.6) 100%)',
                    boxShadow: isHovered 
                      ? '0 0 20px rgba(249, 124, 245, 0.4)'
                      : 'none',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                    }}
                    animate={{
                      opacity: isHovered ? 1 : 0.5,
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Label */}
              <span className={`text-xs transition-colors duration-200 ${
                isHovered ? 'text-white' : 'text-gray-500'
              }`}>
                {item.day}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="border-b border-white/5 w-full"
            style={{ height: '25%' }}
          />
        ))}
      </div>
    </div>
  )
}
