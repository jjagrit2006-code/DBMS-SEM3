/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Solid Commercial Dark Palette (No AI-dash glassmorphism)
        bg: {
          primary: '#0D0F12',
          secondary: '#121519',
          surface: '#16191E',
          card: '#1A1E24',
          elevated: '#20252D',
          hover: '#262C36'
        },
        border: {
          subtle: '#1F242C',
          default: '#272D37',
          strong: '#363E4D',
        },
        // Restrained Functional Accents
        brand: {
          blue: '#2563EB',
          blueHover: '#1D4ED8',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E'
        },
        // Confident Editorial Typography
        content: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
          subtle: '#475569'
        },
        // Legacy namespace compatibility
        vortex: {
          bg: '#0D0F12',
          secondary: '#121519',
          card: '#16191E',
          cardHover: '#1E232B',
          border: '#232832',
          borderHover: '#323946',
          accent: '#06B6D4',
          blue: '#2563EB',
          amber: '#F59E0B',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B'
        }
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'modal': '0 20px 40px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
