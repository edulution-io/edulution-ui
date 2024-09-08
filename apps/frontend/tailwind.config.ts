/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

module.exports = {
  darkMode: ['class'],
  content: ['./**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
      text: 'text-white',
    },
    extend: {
      fontSize: { h1: '37pt', h2: '30pt', h3: '20pt', h4: '17pt', p: '12pt', span: '0.875rem' },
      colors: {
        ciDarkBlue: 'hsla(var(--primary))',
        ciLightBlue: '#66B2DF',
        ciLightGreen: '#88D840',
        ciRed: '#ee0505',
        ciLightRed: '#F87171',
        ciGreen: '#37ee05',
        ciLightGrey: '#D1D5DB',
        ciGrey: '#848493',
        ciDarkGrey: '#2D2D30',
        border: 'hsla(var(--border))',
        input: 'hsla(var(--input))',
        ring: 'hsla(var(--ring))',
        background: 'hsla(var(--background))',
        foreground: 'hsla(var(--foreground))',
        primary: {
          DEFAULT: 'hsla(var(--primary))',
          foreground: 'hsla(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsla(var(--secondary))',
          foreground: 'hsla(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsla(var(--destructive))',
          foreground: 'hsla(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsla(var(--muted))',
          foreground: 'hsla(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsla(var(--accent))',
          foreground: 'hsla(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsla(var(--popover))',
          foreground: 'hsla(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsla(var(--card))',
          foreground: 'hsla(var(--card-foreground))',
        },
      },
      backgroundImage: {
        ciGreenToBlue: 'linear-gradient(45deg, #88D840, #0081C6)',
      },

      borderImage: {
        ciGreenToBlue: 'linear-gradient(45deg, #88D840, #0081C6) 1',
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeInBottom: {
          '0%': {
            opacity: '0',
            transform: 'translateY(4rem)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fadeInBottom: 'fadeInBottom 0.5s ease-out forwards',
      },
      flex: {
        '2': '2 1 0%',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    plugin(function ({ addBase, addUtilities, theme }) {
      addBase({
        ':root': {
          '--radius': '0.25rem',
          '--input': '214.3 31.8% 91.4%',
          '--background': '0 0% 100%',
          '--foreground': '222.2 47.4% 11.2%',
          '--muted': '210 40% 12%',
          '--muted-foreground': '215.4 16.3% 76.9%',
          '--card': 'transparent',
          '--card-foreground': '0, 0%, 100%',
          '--popover': '0 0% 100%',
          '--popover-foreground': '222.2 47.4% 11.2%',
          '--border': '214.3 31.8% 91.4%',
          '--primary': '201, 100%, 39%',
          '--primary-foreground': '210 40% 98%',
          '--secondary': '210 40% 96.1%',
          '--secondary-foreground': '222.2 47.4% 11.2%',
          '--accent': '210 40% 96.1%',
          '--accent-foreground': '222.2 47.4% 11.2%',
          '--destructive': '0 100% 50%',
          '--destructive-foreground': '210 40% 98%',
          '--ring': '215 20.2% 65.1%',
          '--sidebar-width': '56px',
          '--floating-buttons-height': '150px',
        },
        h1: { fontSize: theme('fontSize.h1'), fontWeight: '700' },
        h2: { fontSize: theme('fontSize.h2'), letterSpacing: '0.020em', fontWeight: '700' },
        h3: { fontSize: theme('fontSize.h3'), letterSpacing: '0.040em', fontWeight: '700' },
        h4: { fontSize: theme('fontSize.h4'), letterSpacing: '0.040em', fontWeight: '700' },
        p: { fontSize: theme('fontSize.p'), letterSpacing: '0.020em' },
        span: { fontSize: theme('fontSize.span'), letterSpacing: '0.020em' },
      });
      const newUtilities = {
        '.border-ciGreenToBlue': {
          borderWidth: '4px',
          borderImage: 'linear-gradient(45deg, #88D840, #0081C6) 1',
        },
      };

      addUtilities(newUtilities, {
        respectPrefix: true,
        respectImportant: false,
      });
    }),
  ],
};
