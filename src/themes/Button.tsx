import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const baseStyle = defineStyle({
  color: 'white',
  p: '4',
  borderRadius: '8px',
  colorScheme: 'teal',
});

const buttonPrimary = defineStyle({
  background: 'green.500',
  _hover: {
    bg: 'orange.500',
  },
});

const buttonSecondary = defineStyle({
  background: 'blue.500',
  _hover: {
    bg: 'orange.500',
  },
});

const buttonInfo = defineStyle({
  background: 'green.100',
  _hover: {
    bg: 'orange.500',
  },
});

export const buttonTheme = defineStyleConfig({
  baseStyle,
  variants: { buttonPrimary, buttonSecondary, buttonInfo },
});
