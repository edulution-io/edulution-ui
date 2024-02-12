import { Box, Heading, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Box textAlign='center' mt={20}>
      <Heading as='h1' size='2xl' mb={4}>
        404 - Page Not Found
      </Heading>
      <Text fontSize='xl' mb={4}>
        Oops! The page you are looking for does not exist.
      </Text>
      <Link to='/'>Go back to home</Link>
    </Box>
  );
};

export default NotFoundPage;
