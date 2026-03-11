import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import tailwindcssAnimate from 'tailwindcss-animate';
import tailwindScrollbar from 'tailwind-scrollbar';
import baseConfig from '../../libs/ui-kit/tailwind.config';

const TAILWIND_CONFIG: Config = {
  presets: [baseConfig as Config],
  content: ['./apps/frontend/**/*.{js,ts,jsx,tsx,html}', './libs/**/*.{js,ts,jsx,tsx}', '!./apps/backend/**'],
  safelist: [{ pattern: /^ql-indent-[1-8]$/ }],
  theme: {
    extend: {
      fontSize: {
        h1: '2rem',
        h2: '1.625rem',
        h3: '1.25rem',
        h4: '1rem',
        span: '0.875rem',
      },
      colors: {
        ciLightBlue: 'var(--ci-dark-blue)',
        ciLightRed: '#F87171',
        ciYellow: '#FFD700',
        ciLightYellow: '#ffd00c',
        ciGreen: '#37ee05',
        ciLightGrey: '#D1D5DB',
        'muted-dialog': 'var(--muted-dialog)',
        muted: {
          background: 'var(--muted-background)',
        },
        overlay: {
          DEFAULT: 'var(--overlay)',
          foreground: 'var(--overlay-foreground)',
          transparent: 'var(--overlay-transparent)',
        },
      },
      keyframes: {
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
        fadeInBottom: 'fadeInBottom 0.5s ease-out forwards',
      },
      flex: {
        '2': '2 1 0%',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    tailwindScrollbar({ nocompatible: true }),
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
    plugin(function ({ addUtilities, addVariant }) {
      addVariant('light', 'html:not(.dark) &');

      const utils: Record<string, Record<string, string>> = {};
      for (let i = 1; i <= 8; i++) {
        utils[`.ql-indent-${i}`] = { 'margin-left': `${i * 2}rem` };
      }
      utils['.icon-light-mode'] = { filter: 'brightness(0) saturate(100%) invert(15%)' };
      addUtilities(utils);
    }),
  ],
};

export default TAILWIND_CONFIG;
