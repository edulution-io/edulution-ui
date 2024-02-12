import { cardAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    borderWidth: '4px',
    borderStyle: 'solid',
  },
});

const variants = {
  primary: definePartsStyle({
    container: {
      borderColor: 'green.500',
      backgroundColor: 'brown.500',
    },
  }),

  info: definePartsStyle({
    container: {
      borderColor: 'green.100',
      backgroundColor: 'brown.500',
    },
  }),
};

export const cardTheme = defineMultiStyleConfig({ baseStyle, variants });
