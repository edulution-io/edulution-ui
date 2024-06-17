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
      fontSize: { h1: '37pt', h2: '30pt', h3: '20pt', h4: '17pt', p: '12pt' },
      colors: {
        ciDarkBlue: 'hsl(var(--primary))',
        ciLightBlue: '#66B2DF',
        ciLightGreen: '#88D840',
        ciRed: '#ee0505',
        ciGreen: '#37ee05',
        ciLightGrey: '#848493',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
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
    require('tailwind-scrollbar'),
    plugin(function ({ addBase, theme }) {
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
        },
        h1: { fontSize: theme('fontSize.h1'), fontWeight: '700' },
        h2: { fontSize: theme('fontSize.h2'), letterSpacing: '0.020em', fontWeight: '700' },
        h3: { fontSize: theme('fontSize.h3'), letterSpacing: '0.040em', fontWeight: '700' },
        h4: { fontSize: theme('fontSize.h4'), letterSpacing: '0.040em', fontWeight: '700' },
        p: { fontSize: theme('fontSize.p'), letterSpacing: '0.020em' },
      });
    }),
  ],
};
