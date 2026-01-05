/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neumorphic base (Dieter Rams inspired)
        neu: {
          bg: '#E8E5E1',
          card: '#F5F3F0',  // Slightly lighter for cards
          shadow: '#d1cec9',
          light: '#ffffff',
          border: '#D8D5D0', // Subtle border for visibility
        },
        // Text hierarchy (improved legibility)
        text: {
          primary: '#3A3A3A',
          secondary: '#5A5A5A',
          muted: '#7A7A7A',
        },
        // Accent colors (muted, harmonious)
        coral: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FFA3A3',
          400: '#FF8585',
          500: '#FF6B6B',
          600: '#E85555',
          700: '#CC4444',
          800: '#A33636',
          900: '#802A2A',
        },
        teal: {
          50: '#F0FDFC',
          100: '#CCFBF6',
          200: '#99F6EC',
          300: '#5EEAD4',
          400: '#4ECDC4',
          500: '#2DD4BF',
          600: '#14B8A6',
          700: '#0D9488',
          800: '#0F766E',
          900: '#134E4A',
        },
        blue: {
          400: '#45B7D1',
          500: '#3AA5BD',
        },
        sage: {
          400: '#96CEB4',
          500: '#7FC09F',
        },
        amber: {
          300: '#FFEAA7',
          400: '#FFE066',
        },
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
        body: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'lg': ['16px', { lineHeight: '24px' }],
        'xl': ['18px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '38px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
        '6xl': ['60px', { lineHeight: '68px' }],
        '7xl': ['72px', { lineHeight: '80px' }],
        '8xl': ['96px', { lineHeight: '104px' }],
        '9xl': ['128px', { lineHeight: '136px' }],
      },
      boxShadow: {
        // Neumorphic raised shadows - softer, more subtle
        'neu-sm': '2px 2px 5px rgba(0, 0, 0, 0.08), -2px -2px 5px rgba(255, 255, 255, 0.6)',
        'neu': '3px 3px 8px rgba(0, 0, 0, 0.1), -3px -3px 8px rgba(255, 255, 255, 0.5)',
        'neu-lg': '6px 6px 14px rgba(0, 0, 0, 0.1), -6px -6px 14px rgba(255, 255, 255, 0.5)',
        // Neumorphic inset shadows (pressed state)
        'neu-inset-sm': 'inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
        'neu-inset': 'inset 3px 3px 8px rgba(0, 0, 0, 0.1), inset -3px -3px 8px rgba(255, 255, 255, 0.4)',
        'neu-inset-lg': 'inset 6px 6px 14px rgba(0, 0, 0, 0.1), inset -6px -6px 14px rgba(255, 255, 255, 0.4)',
        // Circular neumorphic
        'neu-circle': '4px 4px 10px rgba(0, 0, 0, 0.1), -4px -4px 10px rgba(255, 255, 255, 0.5)',
        'neu-circle-inset': 'inset 4px 4px 10px rgba(0, 0, 0, 0.1), inset -4px -4px 10px rgba(255, 255, 255, 0.4)',
        // Subtle elevation
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'neu': '16px',
        'neu-lg': '24px',
        'neu-xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'count': 'count 1.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
