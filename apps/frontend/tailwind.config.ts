/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

module.exports = {
  darkMode: ['class'],
  content: ['./apps/frontend/**/*.{js,ts,jsx,tsx,html}', '!./apps/backend/**', '!./libs/**'],
  safelist: [{ pattern: /^ql-indent-[1-8]$/ }],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
      text: 'var(--background)',
    },
    extend: {
      fontSize: {
        h1: '2rem',
        h2: '1.625rem',
        h3: '1.25rem',
        h4: '1rem',
        p: '0.938rem',
        span: '0.875rem',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ciLightBlue: 'var(--ci-dark-blue)',
        ciLightGreen: 'var(--ci-light-green)',
        ciRed: '#dc2626',
        ciLightRed: '#F87171',
        ciYellow: '#FFD700',
        ciLightYellow: '#ffd00c',
        ciGreen: '#37ee05',
        ciLightGrey: '#D1D5DB',
        ciGrey: '#848493',
        ciDarkGrey: '#2D2D30',
        ciDarkGreyDisabled: '#1a1a1b',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'accent-light': 'var(--accent-light)',
        'muted-light': 'var(--muted-light)',
        'muted-dialog': 'var(--muted-dialog)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
          background: 'var(--muted-background)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        overlay: {
          DEFAULT: 'var(--overlay)',
          foreground: 'var(--overlay-foreground)',
          transparent: 'var(--overlay-transparent)',
        },
      },
      backgroundImage: {
        ciGreenToBlue: 'linear-gradient(45deg, var(--ci-light-green), var(--ci-dark-blue))',
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
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fadeInBottom: 'fadeInBottom 0.5s ease-out forwards',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
      flex: {
        '2': '2 1 0%',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    plugin(function ({ addVariant }) {
      addVariant('light', '.light &');
    }),
    plugin(function ({ addBase, theme }) {
      addBase({
        h1: { fontSize: theme('fontSize.h1'), fontWeight: '700' },
        h2: { fontSize: theme('fontSize.h2'), letterSpacing: '0.020em', fontWeight: '700' },
        h3: { fontSize: theme('fontSize.h3'), letterSpacing: '0.040em', fontWeight: '700' },
        h4: { fontSize: theme('fontSize.h4'), letterSpacing: '0.040em', fontWeight: '700' },
        p: { fontSize: theme('fontSize.p'), letterSpacing: '0.020em' },
        span: { fontSize: theme('fontSize.span'), letterSpacing: '0.020em' },
        '*': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'var(--scrollbar-thumb) var(--scrollbar-track)',
        },
      });
    }),
    plugin(function ({ addUtilities }) {
      const utils = {};
      for (let i = 1; i <= 8; i++) {
        utils[`.ql-indent-${i}`] = { 'margin-left': `${i * 2}rem` };
      }
      addUtilities(utils);
    }),
  ],
};
