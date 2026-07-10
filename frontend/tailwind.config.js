/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens from MDD §10 mapped to CSS variables for Light/Dark mode
        bg: {
          base:    'rgba(var(--bg-base-rgb), <alpha-value>)',
          surface: 'rgba(var(--bg-surface-rgb), <alpha-value>)',
          card:    'rgba(var(--bg-card-rgb), <alpha-value>)',
          border:  'rgba(var(--bg-border-rgb), <alpha-value>)',
        },
        accent: {
          green: 'rgba(var(--accent-green-rgb), <alpha-value>)',
          amber: 'rgba(var(--accent-amber-rgb), <alpha-value>)',
          red:   'rgba(var(--accent-red-rgb), <alpha-value>)',
          blue:  'rgba(var(--accent-blue-rgb), <alpha-value>)',
        },
        text: {
          primary:   'rgba(var(--text-primary-rgb), <alpha-value>)',
          secondary: 'rgba(var(--text-secondary-rgb), <alpha-value>)',
          muted:     'rgba(var(--text-muted-rgb), <alpha-value>)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Barlow Condensed', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'glass':        'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'grid-pattern': 'radial-gradient(circle, #252A3A 1px, transparent 1px)',
        'hero-gradient':'radial-gradient(ellipse at 50% 0%, rgba(0,226,138,0.15) 0%, transparent 60%)',
        // Fan Hub hero — deeper, richer radial treatment
        'hero-fan':     'radial-gradient(ellipse at 40% 30%, rgba(0,226,138,0.18) 0%, rgba(74,142,226,0.08) 45%, transparent 70%), radial-gradient(ellipse at 80% 80%, rgba(242,166,35,0.07) 0%, transparent 50%)',
        // Subtle depth layer for dark panels
        'panel-depth':  'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(0,0,0,0.15) 100%)',
      },
      boxShadow: {
        'glass':       '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg':    '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'green-glow':  '0 0 20px rgba(0,226,138,0.25)',
        'green-glow-lg':'0 0 40px rgba(0,226,138,0.35)',
        'amber-glow':  '0 0 20px rgba(242,166,35,0.25)',
        'red-glow':    '0 0 20px rgba(226,75,74,0.25)',
        'card-hover':  '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right':'slideInRight 0.35s ease-out',
        'slide-in-up':   'slideInUp 0.3s ease-out',
        'count-up':      'countUp 0.5s ease-out',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'spin-slow':     'spin 3s linear infinite',
        'hero-float':    'heroFloat 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-up':    'fadeInUp 0.5s ease-out both',
        'fab-pulse':     'fabPulse 3s ease-in-out infinite',
      },
      keyframes: {
        slideInRight: {
          '0%':   { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        slideInUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 8px rgba(0,226,138,0.2)' },
          '100%': { boxShadow: '0 0 24px rgba(0,226,138,0.5)' },
        },
        heroFloat: {
          '0%':   { opacity: '0', transform: 'translateY(28px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fabPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,226,138,0.4)' },
          '50%':      { boxShadow: '0 0 0 10px rgba(0,226,138,0)' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}

