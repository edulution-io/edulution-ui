/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

module.exports = {
  darkMode: ['class'],
  content: ['./apps/frontend/**/*.{js,ts,jsx,tsx,html}', '!./apps/backend/**', '!./libs/**'],
  safelist: [{ pattern: /^ql-indent-[1-9]$/ }, 'ql-indent-10'],
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
        h1: '37pt',
        h2: '30pt',
        h3: '20pt',
        h4: '17pt',
        p: '12pt',
        span: '0.875rem',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ciDarkBlue: '#1A202C',
        ciLightBlue: '#66B2DF',
        ciLightGreen: '#88D840',
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
        ciGreenToBlue: 'linear-gradient(45deg, #88D840, #0081C6)',
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
    plugin(function ({ addBase, theme }) {
      addBase({
        h1: { fontSize: theme('fontSize.h1'), fontWeight: '700' },
        h2: { fontSize: theme('fontSize.h2'), letterSpacing: '0.020em', fontWeight: '700' },
        h3: { fontSize: theme('fontSize.h3'), letterSpacing: '0.040em', fontWeight: '700' },
        h4: { fontSize: theme('fontSize.h4'), letterSpacing: '0.040em', fontWeight: '700' },
        p: { fontSize: theme('fontSize.p'), letterSpacing: '0.020em' },
        span: { fontSize: theme('fontSize.span'), letterSpacing: '0.020em' },
      });
    }),
    plugin(function ({ addUtilities }) {
      const utils = {};
      for (let i = 1; i <= 10; i++) {
        utils[`.ql-indent-${i}`] = { 'margin-left': `${i}rem` };
      }
      addUtilities(utils);
    }),
  ],
};
