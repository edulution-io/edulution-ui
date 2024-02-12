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
      {/* Content Area */}
      {/* Main Content */}
      <Box>
        <Heading size='lg'>{t('heading')}</Heading>
        <Text mt='4'>{t('content')}</Text>
      </Box>
      <Center>
        <Stack p='6' spacing='8'>
          <Card variant='primary'>
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
                  variant='buttonPrimary'
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
                  variant='buttonSecondary'
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
                  variant='buttonInfo'
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
          <Card variant='info'>
            <CardBody>
              <Flex direction='column' gap='6'>
                <Text fontSize='md' fontWeight='bold' color='white'>
                  MOBILER DATENZUGRIFF
                </Text>
                <Text color='white'>
                  You can access the school server from many mobile devices.
                  Select your ope- rating system to see how it works.
                </Text>
                <Button
                  variant='buttonInfo'
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
          <Card variant='primary'>
            <CardBody>
              <Box textColor='white'>
                <Flex direction='column' gap='3'>
                  <Text fontWeight='bold'>KONTO-INFORMATIONEN</Text>
                  <Text>Name: Netzint Testlehrer</Text>
                  <Text>E-Mail: frau.mustermann@netzint.de</Text>
                  <Text>Schule: Testschule</Text>
                  <Text>Rolle: Lehrer</Text>
                </Flex>
                <Button variant='buttonPrimary' mt='4'>
                  Passwort ändern
                </Button>
              </Box>

              <Box mt='8' textColor='white'>
                <Text fontWeight='bold'>MEINE INFORMATIONEN</Text>
                <Text>Mail Alias: teachertest@sgmaulbronn.de</Text>
                <Button variant='buttonPrimary' mt='4'>
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
