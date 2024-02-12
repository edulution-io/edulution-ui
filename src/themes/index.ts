import { extendTheme } from '@chakra-ui/react';
import { buttonTheme } from '@/themes/Button';
import { cardTheme } from '@/themes/Card';

export const theme = extendTheme({
  colors: {
    white: {
      500: '#FFFFFE',
    },
    green: {
      100: '#8CBB64',
      500: '#3E76AC',
    },
    blue: {
      500: '#628AB9',
    },
    brown: {
      500: '#393939',
    },
    background: {
      main: '#3B3B3B',
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  components: { Button: buttonTheme, Card: cardTheme },
});
