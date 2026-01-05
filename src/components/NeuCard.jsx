import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function NeuCard({
  children,
  className = '',
  pressed = false,
  hoverable = true,
  rounded = 'neu',
  padding = true,
  variant = 'raised', // 'raised' (inner) | 'flat' (outer container) | 'inset'
  as: Component = 'div',
  ...props
}) {
  const baseClasses = clsx(
    'transition-all duration-200',
    {
      // Rounded variants
      'rounded-2xl': rounded === 'neu' || rounded === '2xl',
      'rounded-3xl': rounded === 'lg' || rounded === '3xl',
      'rounded-[32px]': rounded === 'xl',
      'rounded-full': rounded === 'full',
      // Default padding
      'p-6': padding === true,
    },
    // Variant styles - key for nested hierarchy
    variant === 'flat'
      ? 'bg-[#E2DFDB] shadow-subtle' // Outer container - slightly darker, minimal shadow
      : variant === 'inset'
        ? 'bg-neu-bg shadow-neu-inset'
        : 'bg-neu-bg shadow-neu', // Raised - inner elements pop out
    // Hover effect only if hoverable and raised
    hoverable && variant === 'raised' && 'hover:shadow-neu-sm',
    className
  )

  if (Component === motion.div) {
    return (
      <motion.div className={baseClasses} {...props}>
        {children}
      </motion.div>
    )
  }

  return (
    <Component className={baseClasses} {...props}>
      {children}
    </Component>
  )
}

// Inset card variant for containers that should appear recessed
export function NeuCardInset({
  children,
  className = '',
  rounded = 'neu',
  padding = true,
  ...props
}) {
  return (
    <div
      className={clsx(
        'bg-neu-bg',
        {
          'rounded-2xl': rounded === 'neu' || rounded === '2xl',
          'rounded-3xl': rounded === 'lg' || rounded === '3xl',
          'rounded-full': rounded === 'full',
          'p-6': padding === true,
        },
        'shadow-neu-inset',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Circular variant for charts and icons
export function NeuCircle({
  children,
  className = '',
  size = 'md',
  inset = false,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
    '2xl': 'w-64 h-64',
    'full': 'w-full aspect-square',
  }

  return (
    <div
      className={clsx(
        'bg-neu-bg rounded-full flex items-center justify-center',
        sizeClasses[size] || size,
        inset ? 'shadow-neu-circle-inset' : 'shadow-neu-circle',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Button variant
export function NeuButton({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    default: 'bg-neu-bg text-text-primary shadow-neu hover:shadow-neu-sm active:shadow-neu-inset',
    primary: 'bg-gradient-to-br from-coral-500 to-coral-600 text-white shadow-neu hover:shadow-neu-sm active:shadow-neu-inset',
    secondary: 'bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-neu hover:shadow-neu-sm active:shadow-neu-inset',
    ghost: 'bg-transparent text-text-primary hover:shadow-neu-sm active:shadow-neu-inset',
  }

  return (
    <button
      className={clsx(
        'rounded-neu font-semibold transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neu-bg',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Input variant
export function NeuInput({
  className = '',
  icon = null,
  ...props
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
      )}
      <input
        className={clsx(
          'w-full bg-neu-bg rounded-neu shadow-neu-inset',
          'px-4 py-3 text-text-primary placeholder:text-text-muted',
          'outline-none transition-shadow duration-200',
          'focus:shadow-neu-inset-sm',
          icon && 'pl-12',
          className
        )}
        {...props}
      />
    </div>
  )
}
