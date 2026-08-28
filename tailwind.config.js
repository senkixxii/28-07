/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        'warm-white': '#FFFDFC',
        'pastel-pink': '#F8BBD0',
        'soft-pink': '#FCE4EC',
        'baby-blue': '#DCEEFF',
        lavender: '#E8DFF5',
        'soft-peach': '#FFDCC8',
        'soft-brown': '#8A7373',
        accent: '#D63A78',
        ink: {
          DEFAULT: '#4A3F45',
          soft: '#81747B',
          muted: '#A89CA2',
        },
      },
      fontFamily: {
        sans: ['Prompt', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
        xl4: '2.25rem',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(74, 63, 69, 0.12)',
        softer: '0 2px 12px -2px rgba(74, 63, 69, 0.08)',
        lift: '0 12px 32px -8px rgba(74, 63, 69, 0.18)',
        page: '0 2px 8px rgba(74,63,69,0.06), 0 20px 40px -20px rgba(74,63,69,0.25)',
        glow: '0 8px 24px -6px rgba(214, 58, 120, 0.35)',
        'glow-sm': '0 4px 14px -4px rgba(214, 58, 120, 0.3)',
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
        drift: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: 0 },
          '10%': { opacity: 1 },
          '100%': { transform: 'translateY(-120px) translateX(10px)', opacity: 0 },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'bg-drift': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(2%, -2%)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
        drift: 'drift 5s ease-in infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'bg-drift': 'bg-drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
