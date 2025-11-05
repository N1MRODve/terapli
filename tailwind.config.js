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
      /* ================================================================
         🌈 COLORES - Integrados desde design tokens
         ================================================================ */
      colors: {
        // Fondos - Teraplí
        'base-bg': '#F2F2F2',
        'base-bg-secondary': '#FAFAFA',
        'base-bg-tertiary': '#FFFFFF',
        
        // Violeta (marca principal Teraplí)
        violeta: {
          DEFAULT: '#5550F2',
          light: '#7B72F7',
          lighter: '#B8B2FB',
          dark: '#3D38C7',
        },
        
        // Verde esmeralda (confianza)
        esmeralda: {
          DEFAULT: '#027368',
          light: '#04BF9D',
          lighter: '#B3F5EC',
          dark: '#015B52',
        },
        
        // Verde menta (crecimiento)
        menta: {
          DEFAULT: '#04BF9D',
          light: '#66D4B8',
          lighter: '#B3F5EC',
          dark: '#038A72',
        },
        
        // Dorado (energía y calidez)
        dorado: {
          DEFAULT: '#F2B33D',
          light: '#F5CC6B',
          lighter: '#FDF4E3',
          dark: '#E09E1A',
        },
        
        // Neutrales modernos
        neutral: {
          DEFAULT: '#2D3748',
          light: '#4A5568',
          lighter: '#718096',
          lightest: '#A0AEC0',
        },
        
        // Alias para retrocompatibilidad
        fondo: '#F2F2F2',
        terracota: '#5550F2',   // Mapear a violeta
        cafe: '#2D3748',        // Mapear a neutral
        
        // Estados semánticos - Teraplí
        success: {
          DEFAULT: '#04BF9D',
          light: '#B3F5EC',
        },
        warning: {
          DEFAULT: '#F2B33D',
          light: '#FDF4E3',
        },
        error: {
          DEFAULT: '#E53E3E',
          light: '#FED7D7',
        },
        info: {
          DEFAULT: '#5550F2',
          light: '#B8B2FB',
        },
        
        // Estados de citas - Teraplí
        status: {
          pending: '#F2B33D',    // Dorado
          confirmed: '#04BF9D',  // Verde menta
          completed: '#5550F2',  // Violeta
          cancelled: '#A0AEC0',  // Gris neutral
        },
      },
      
      /* ================================================================
         🔤 TIPOGRAFÍA
         ================================================================ */
      fontFamily: {
        serif: ['Elms Sans', 'Georgia', 'serif'],
        sans: ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }],       // 14px
        'base': ['0.9375rem', { lineHeight: '1.6' }],    // 15px
        'md': ['1rem', { lineHeight: '1.6' }],           // 16px
        'lg': ['1.125rem', { lineHeight: '1.6' }],       // 18px
        'xl': ['1.25rem', { lineHeight: '1.5' }],        // 20px
        '2xl': ['1.5rem', { lineHeight: '1.4' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '1.3' }],      // 30px
        '4xl': ['2.25rem', { lineHeight: '1.2' }],       // 36px
        '5xl': ['3rem', { lineHeight: '1.1' }],          // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1' }],       // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],          // 72px
      },
      
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.025em',
      },
      
      /* ================================================================
         📐 RADIOS Y BORDES
         ================================================================ */
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'DEFAULT': '0.5rem',     // 8px
        'md': '0.75rem',    // 12px
        'lg': '1rem',       // 16px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.75rem',   // 28px
        'full': '9999px',
      },
      
      /* ================================================================
         🌑 SOMBRAS
         ================================================================ */
      boxShadow: {
        'xs': '0 1px 2px rgba(45, 55, 72, 0.04)',
        'sm': '0 2px 4px rgba(45, 55, 72, 0.04), 0 1px 2px rgba(45, 55, 72, 0.02)',
        'DEFAULT': '0 4px 8px rgba(45, 55, 72, 0.06), 0 2px 4px rgba(45, 55, 72, 0.03)',
        'md': '0 6px 12px rgba(45, 55, 72, 0.08), 0 3px 6px rgba(45, 55, 72, 0.04)',
        'lg': '0 10px 20px rgba(45, 55, 72, 0.10), 0 4px 8px rgba(45, 55, 72, 0.05)',
        'xl': '0 16px 32px rgba(45, 55, 72, 0.12), 0 6px 12px rgba(45, 55, 72, 0.06)',
        '2xl': '0 24px 48px rgba(45, 55, 72, 0.14), 0 8px 16px rgba(45, 55, 72, 0.07)',
        'inner': 'inset 0 2px 4px rgba(45, 55, 72, 0.06)',
        'glow': '0 0 20px rgba(85, 80, 242, 0.15)',
        'focus': '0 0 0 3px rgba(85, 80, 242, 0.20)',
        'none': 'none',
      },
      
      /* ================================================================
         ⏱️ TRANSICIONES
         ================================================================ */
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      
      /* ================================================================
         🎭 ANIMACIONES
         ================================================================ */
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
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
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        bounceSubtle: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px)',
          },
        },
        pulseSubtle: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.8',
          },
        },
      },
      
      /* ================================================================
         🌫️ BACKDROP
         ================================================================ */
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
      },
      
      /* ================================================================
         📏 ESPACIADO PERSONALIZADO
         ================================================================ */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      /* ================================================================
         📱 Z-INDEX
         ================================================================ */
      zIndex: {
        '1': '1',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
      
      /* ================================================================
         📦 CONTENEDORES
         ================================================================ */
      maxWidth: {
        'container-xs': '28rem',
        'container-sm': '36rem',
        'container-md': '48rem',
        'container-lg': '64rem',
        'container-xl': '80rem',
        'container-2xl': '96rem',
      },
    },
  },
  plugins: [],
}
