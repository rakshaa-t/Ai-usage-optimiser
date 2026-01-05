import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Portal-based tooltip that renders at document body level
 * Prevents clipping from parent overflow:hidden containers
 */
export default function Tooltip({ children, isVisible, anchorRect, position = 'top' }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !isVisible || !anchorRect) return null

  // Calculate position based on anchor rect and desired position
  const getPosition = () => {
    const padding = 12
    const tooltipOffset = 8

    let top, left
    const { x, y, width, height } = anchorRect

    switch (position) {
      case 'top':
        top = y - tooltipOffset
        left = x + width / 2
        break
      case 'bottom':
        top = y + height + tooltipOffset
        left = x + width / 2
        break
      case 'left':
        top = y + height / 2
        left = x - tooltipOffset
        break
      case 'right':
        top = y + height / 2
        left = x + width + tooltipOffset
        break
      case 'radial':
        // For pie chart - position is passed directly
        top = y
        left = x
        break
      default:
        top = y - tooltipOffset
        left = x + width / 2
    }

    // Keep tooltip within viewport
    const viewportPadding = 16

    return {
      top: Math.max(viewportPadding, Math.min(top, window.innerHeight - viewportPadding)),
      left: Math.max(viewportPadding, Math.min(left, window.innerWidth - viewportPadding)),
    }
  }

  const pos = getPosition()
  const transformOrigin = position === 'top' ? 'bottom center' :
                          position === 'bottom' ? 'top center' :
                          position === 'left' ? 'right center' :
                          position === 'right' ? 'left center' : 'center center'

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: pos.top,
            left: pos.left,
            transform: position === 'radial' ? 'translate(-50%, -50%)' :
                       position === 'top' ? 'translate(-50%, -100%)' :
                       position === 'bottom' ? 'translate(-50%, 0)' :
                       position === 'left' ? 'translate(-100%, -50%)' :
                       'translate(0, -50%)',
            transformOrigin,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/**
 * Neumorphic tooltip wrapper
 */
export function TooltipContent({ children, className = '' }) {
  return (
    <div
      className={`
        px-4 py-3 rounded-neu
        bg-neu-bg
        ${className}
      `}
      style={{
        boxShadow: '4px 4px 8px #d1cec9, -4px -4px 8px #ffffff, 0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </div>
  )
}
