import { Box, Flex, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box py={4}>
      <Flex justify='center'>
        <Text fontSize='sm' color='white'>
          © 2024 Netzint GmbH. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
