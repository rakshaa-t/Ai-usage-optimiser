import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function TiltCard({ 
  children, 
  className = '',
  glowColor = 'rgba(217, 70, 239, 0.3)',
  tiltAmount = 15,
  glowIntensity = 0.4,
}) {
  const cardRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setMousePosition({ x, y })
    setTilt({
      x: (y - 0.5) * -tiltAmount,
      y: (x - 0.5) * tiltAmount,
    })
  }, [tiltAmount])

  const handleMouseEnter = () => setIsHovering(true)
  
  const handleMouseLeave = () => {
    setIsHovering(false)
    setMousePosition({ x: 0.5, y: 0.5 })
    setTilt({ x: 0, y: 0 })
  }

  // Calculate shine position based on mouse
  const shineX = mousePosition.x * 100
  const shineY = mousePosition.y * 100

  return (
    <div className="perspective-1000">
      <motion.div
        ref={cardRef}
        className={clsx(
          'relative preserve-3d cursor-pointer',
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-1 rounded-3xl opacity-0 blur-xl"
          style={{
            background: `radial-gradient(circle at ${shineX}% ${shineY}%, ${glowColor}, transparent 70%)`,
          }}
          animate={{
            opacity: isHovering ? glowIntensity : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Card content wrapper */}
        <div className="relative glass rounded-3xl overflow-hidden">
          {/* Metallic shine overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(
                  circle at ${shineX}% ${shineY}%,
                  rgba(255, 255, 255, 0.15) 0%,
                  rgba(255, 255, 255, 0.05) 20%,
                  transparent 50%
                )
              `,
            }}
            animate={{
              opacity: isHovering ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Border gradient on hover */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `
                linear-gradient(
                  ${Math.atan2(mousePosition.y - 0.5, mousePosition.x - 0.5) * (180 / Math.PI) + 90}deg,
                  rgba(217, 70, 239, 0.5) 0%,
                  transparent 50%,
                  rgba(139, 92, 246, 0.3) 100%
                )
              `,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              padding: '1px',
            }}
            animate={{
              opacity: isHovering ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
