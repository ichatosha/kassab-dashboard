/** @type {import('tailwindcss').Config} */
// Light and dark share one set of class names. The neutral scale and the
// soft tint / accent-text shades of each palette resolve through CSS
// variables (see index.css), so `bg-ink-50` or `text-emerald-700` mean the
// right thing in both themes. Shades used as SOLID fills (500/600/800)
// stay fixed, and `night`/`brandfx` are deliberately fixed scales for
// surfaces that are dark in both themes.
const themed = (name) => `rgb(var(${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Page background and raised panels
        canvas: themed('--canvas'),
        surface: themed('--surface'),
        brand: {
          50: themed('--brand-50'),
          100: themed('--brand-100'),
          200: '#fccccd',
          300: '#f9a8ab',
          400: '#f4757a',
          500: '#ea4850',
          600: '#d6242e',
          700: themed('--brand-700'),
          800: '#951921',
          900: '#7c1b21',
          950: '#43090d',
        },
        // Fixed brand shades for surfaces that stay red in both themes
        brandfx: {
          100: '#fde3e4',
          700: '#b41a24',
        },
        ink: {
          50: themed('--ink-50'),
          100: themed('--ink-100'),
          200: themed('--ink-200'),
          300: themed('--ink-300'),
          400: themed('--ink-400'),
          500: themed('--ink-500'),
          600: themed('--ink-600'),
          700: themed('--ink-700'),
          800: themed('--ink-800'),
          900: themed('--ink-900'),
          950: themed('--ink-950'),
        },
        // The original neutral scale, never inverted — for overlays and the
        // panels that are dark by design in both themes.
        night: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#b0bac9',
          400: '#8593ab',
          500: '#667691',
          600: '#515e78',
          700: '#424d62',
          800: '#394253',
          900: '#333a47',
          950: '#22262f',
        },
        // Soft tints + accent text of the status palettes
        emerald: { 50: themed('--emerald-50'), 100: themed('--emerald-100'), 700: themed('--emerald-700') },
        sky: { 50: themed('--sky-50'), 100: themed('--sky-100'), 700: themed('--sky-700') },
        amber: { 50: themed('--amber-50'), 100: themed('--amber-100'), 700: themed('--amber-700') },
        red: { 50: themed('--red-50'), 100: themed('--red-100'), 700: themed('--red-700') },
        violet: { 50: themed('--violet-50'), 100: themed('--violet-100'), 700: themed('--violet-700') },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(var(--shadow) / 0.05)',
        pop: '0 4px 6px -2px rgb(var(--shadow) / 0.05), 0 12px 16px -4px rgb(var(--shadow) / 0.10)',
        drawer: '-8px 0 24px -8px rgb(var(--shadow) / 0.18)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'drawer-in': {
          from: { transform: 'translateX(var(--drawer-from, 100%))' },
          to: { transform: 'translateX(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'slide-up': 'slide-up 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        'drawer-in': 'drawer-in 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
