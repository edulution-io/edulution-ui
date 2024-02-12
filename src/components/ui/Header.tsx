import { Box, Flex, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <Box py={4} mb='20'>
      <Flex maxW='container.xl' align='center' justify='space-between'>
        <Heading as='h1' size='lg' color='white'>
          <Link to='/'> edulution.io</Link>
        </Heading>
        {/* Add your navigation links or other content here */}
      </Flex>
    </Box>
  );
};

export default Header;
