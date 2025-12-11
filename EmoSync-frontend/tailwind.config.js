/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      },
      fontFamily: {
        // 默认字体 - Inter (用于正文)
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // 标题字体 - Nunito
        heading: ['Nunito', 'sans-serif'],
        // 正文字体 - Inter (别名，便于使用)
        body: ['Inter', 'system-ui', 'sans-serif'],
        // 组合字体 (用于特殊场景)
        display: ['Nunito', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
         'gradient-flow': 'gradientFlow 3s ease infinite',
        'icon-bounce': 'iconBounce 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        gradientFlow: {
          '0%, 100%': {
            'background-position': '0% 0%',
          },
          '50%': {
            'background-position': '0% 100%',
          },
        },
        iconBounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px)',
          },
        },
        shimmer: {
          '0%': {
            'background-position': '-200px 0',
          },
          '100%': {
            'background-position': 'calc(200px + 100%) 0',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
          },
          '50%': {
            opacity: 0.8,
            boxShadow: '0 0 20px 10px rgba(59, 130, 246, 0)',
          },
        }
      },
      backgroundImage: {
        'gradient-flow': 'linear-gradient(to bottom, #a5b4fc, #6366f1, #4f46e5)',
      },
    },
  },
  plugins: [],
}