import { Box, Text } from '@chakra-ui/react';

type FlagProps = {
  country: string;
  code: string;
};

const Flag: React.FC<FlagProps> = ({ country, code }) => {
  return (
    <Box display='flex' alignItems='center'>
      <Box width='24px' height='16px' borderRadius='md' bg='gray.200' mr='2' />
      <Text>{`${country} (${code})`}</Text>
    </Box>
  );
};

export default Flag;
