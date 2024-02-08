import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Spinner,
  Card,
  CardBody,
  Stack,
  Center,
  Image,
} from '@chakra-ui/react';
import { useRepoData } from '@/hooks/queries';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/ui/Sidebar';
import Drucker from '@/assets/icons/Drucker.png';
import Raumbuchung from '@/assets/icons/Raumbuchung.png';
import Filesharing from '@/assets/icons/Filesharing.png';
import Cloud from '@/assets/icons/Cloud.png';
import MenuBar_sh from "@/pages/MenuBar/MenuBar_sh.tsx";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, error } = useRepoData();

  if (isLoading) return <Spinner color='red.500' size='xl' />;

  if (error) {
    return <p>Error: {error.message}</p>;
  }
  return (

    <Flex direction='column' backgroundColor='#3B3B3B' color='#FFFFFE'>
      <MenuBar_sh></MenuBar_sh>
      {/* Main Navigation */}
      <Sidebar />
      {/* Content Area */}
      {/* Main Content */}
      <Center>
        <Box p='6'>
          <Heading size='lg'>{t('heading')}</Heading>
          <Text mt='4'>{t('content')}</Text>
        </Box>
      </Center>
      <Center>
        <Stack p='6' spacing='8' width={['100%', '50%', '25%']}>
          <Card
            size='md'
            border='4px solid'
            borderColor='green.500'
            backgroundColor='brown.500'
          >
            <CardBody>
              <Text color='white' fontWeight='bold'>
                <p className="text-red-700">MEINE FAVORITEN Styled by tailwind</p>
              </Text>
              <Flex
                mt='4'
                direction='column'
                gap='24px'
                justifyContent='space-between'
              >
                <Button
                  colorScheme='teal'
                  background='green.500'
                  color='#FFFFFE'
                  p='4'
                  borderRadius='8px'
                  width='fit-content'
                  rightIcon={
                    <Image
                      src={Filesharing}
                      alt='Filesharing'
                      width='40px'
                      height='40px'
                    />
                  }
                >
                  Filesharing
                </Button>
                <Button
                  color='#FFFFFE'
                  colorScheme='teal'
                  background='#628AB9'
                  p='4'
                  borderRadius='8px'
                  width='fit-content'
                  rightIcon={
                    <Image
                      src={Raumbuchung}
                      alt='Raumbuchung'
                      width='40px'
                      height='40px'
                    />
                  }
                >
                  Raumbuchung
                </Button>
                <Button
                  background='#8CBB64'
                  color='#FFFFFE'
                  p='4'
                  borderRadius='8px'
                  width='fit-content'
                  rightIcon={
                    <Image
                      src={Drucker}
                      alt='Drucker'
                      width='40px'
                      height='40px'
                    />
                  }
                >
                  Drucker
                </Button>
              </Flex>
            </CardBody>
          </Card>
          <Card
            size='md'
            border='4px solid #8CBB64'
            backgroundColor='brown.500'
          >
            <CardBody>
              <Flex direction='column' gap='6'>
                <Text fontSize='md' fontWeight='bold' color='white'>
                  MOBILDER DATENZUGRIFF
                </Text>
                <Text color='white'>
                  You can access the school server from many mobile devices.
                  Select your ope- rating system to see how it works.
                </Text>
                <Button
                  colorScheme='teal'
                  variant='outline'
                  color='white'
                  background='#8CBB64'
                  p='4'
                  borderRadius='8px'
                  width='fit-content'
                  leftIcon={
                    <Image src={Cloud} alt='Cloud' width='40px' height='40px' />
                  }
                >
                  Anleitung
                </Button>
              </Flex>
            </CardBody>
          </Card>
          <Card
            size='md'
            border='4px solid'
            borderColor='green.500'
            backgroundColor='brown.500'
          >
            <CardBody>
              <Box textColor='white'>
                <Flex direction='column' gap='3'>
                  <Text fontWeight='bold'>KONTO- INFORMATIONEN</Text>
                  <Text>Name: Netzint Testlehrer</Text>
                  <Text>E-Mail: frau.mustermann@netzint.de</Text>
                  <Text>Schule: Testschule</Text>
                  <Text>Rolle: Lehrer</Text>
                </Flex>
                <Button
                  colorScheme='teal'
                  variant='outline'
                  mt='4'
                  background='green.500'
                  textColor='white'
                >
                  Passwort ändern
                </Button>
              </Box>

              <Box mt='8' textColor='white'>
                <Text fontWeight='bold'>MEINE INFORMATIONEN</Text>
                <Text>Mail Alias: teachertest@sgmaulbronn.de</Text>
                <Button
                  colorScheme='teal'
                  variant='outline'
                  mt='4'
                  background='green.500'
                  textColor='white'
                >
                  Meine Daten ändern
                </Button>
              </Box>
            </CardBody>
          </Card>
        </Stack>
      </Center>

    </Flex>

  );
};

export default HomePage;
