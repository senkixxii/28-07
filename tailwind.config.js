/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        'pastel-pink': '#F8BBD0',
        'soft-pink': '#FCE4EC',
        'baby-blue': '#D6EAF8',
        lavender: '#E8DFF5',
        'soft-peach': '#FFDCC8',
        accent: '#D63A78',
        ink: {
          DEFAULT: '#4A3F45',
          soft: '#81747B',
        },
      },
      fontFamily: {
        sans: ['Anuphan', 'Noto Sans Thai', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(74, 63, 69, 0.12)',
        softer: '0 2px 12px -2px rgba(74, 63, 69, 0.08)',
        lift: '0 12px 32px -8px rgba(74, 63, 69, 0.18)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
