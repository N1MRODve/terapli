/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores cálida y empática
        'base-bg': '#F9F7F3', // Color base unificado
        terracota: '#D8AFA0',
        rosa: '#EAD5D3',
        fondo: '#F9F7F3',
        cafe: '#5D4A44',
        'terracota-light': '#EFA08B', // Para gradientes
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Lato', 'sans-serif'],
      },
      fontSize: {
        // Tamaños optimizados para mejor legibilidad
        'base': ['1.0625rem', { lineHeight: '1.7' }],      // 17px
        'lg': ['1.1875rem', { lineHeight: '1.7' }],        // 19px
        'xl': ['1.3125rem', { lineHeight: '1.6' }],        // 21px
        '2xl': ['1.5rem', { lineHeight: '1.5' }],          // 24px
        '3xl': ['1.875rem', { lineHeight: '1.4' }],        // 30px
        '4xl': ['2.25rem', { lineHeight: '1.3' }],         // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],            // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1' }],         // 60px
        '7xl': ['4.5rem', { lineHeight: '1.1' }],          // 72px
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
      },
      keyframes: {
        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
