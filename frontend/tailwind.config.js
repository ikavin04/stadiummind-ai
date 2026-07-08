/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens from MDD §10
        bg: {
          base: '#0B0D12',
          surface: '#13161F',
          card: '#1A1E2A',
          border: '#252A3A',
        },
        accent: {
          green: '#00E28A',
          amber: '#F2A623',
          red: '#E24B4A',
          blue: '#4A8EE2',
        },
        text: {
          primary: '#F0F2F8',
          secondary: '#8B92A8',
          muted: '#525870',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'grid-pattern': 'radial-gradient(circle, #252A3A 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(0,226,138,0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'green-glow': '0 0 20px rgba(0,226,138,0.25)',
        'amber-glow': '0 0 20px rgba(242,166,35,0.25)',
        'red-glow': '0 0 20px rgba(226,75,74,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'count-up': 'countUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(0,226,138,0.2)' },
          '100%': { boxShadow: '0 0 24px rgba(0,226,138,0.5)' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}
