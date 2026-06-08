import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#171717',
          soft: '#525252',
          muted: '#a3a3a3',
        },
        surface: {
          DEFAULT: '#fafafa',
          2: '#f0f0f0',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          2: '#141414',
          border: '#262626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        'xs': ['12px', '16px'],
        'sm': ['13px', '20px'],
        'base': ['15px', '24px'],
        'lg': ['17px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
      },
      borderRadius: {
        '4xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideOut: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(8px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
