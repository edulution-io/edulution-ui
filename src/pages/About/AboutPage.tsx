import { Box, Heading, Text } from '@chakra-ui/react';

const AboutPage: React.FC = () => {
  return (
    <Box color='white'>
      <Heading as='h1' size='xl' mb={4}>
        About Us
      </Heading>
      <Text fontSize='lg'>
        Welcome to our website! We are a team of passionate individuals
        dedicated to providing high-quality software solutions.
      </Text>
      <Text fontSize='lg' mt={4}>
        Our mission is to empower businesses and individuals with innovative
        technology that enhances productivity and simplifies processes.
      </Text>
    </Box>
  );
};

export default AboutPage;
