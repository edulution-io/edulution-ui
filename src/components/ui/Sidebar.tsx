import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  useDisclosure,
  Button,
  Divider,
  List,
  ListItem,
  ListIcon,
  Text,
  Box,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CalendarIcon,
  LockIcon,
  StarIcon,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { translateKey } from '@/utils/common';

const Sidebar = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleNavigate = (link: string) => {
    navigate(link);
    onClose();
  };

  // TODO: will move to separate file later
  const MENU_ITEMS = [
    {
      title: 'About',
      link: '/about',
      icon: StarIcon,
    },
    {
      title: translateKey('conferences'),
      link: '/conferences',
      icon: HamburgerIcon,
    },
    {
      title: 'Firewall',
      link: '/firewall',
      icon: CalendarIcon,
    },
    {
      title: 'Virtualisierung',
      link: '/firewall',
      icon: CalendarIcon,
    },
    {
      title: 'Lernmanagement',
      link: '/firewall',
      icon: CalendarIcon,
    },
    {
      title: 'Filesharing',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Desktop-Bereitstellung',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Netzwerk',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Mail',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Schulinformation',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Drucker',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Raumbuchung',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Foren',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Chat',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'WLAN',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
    {
      title: 'Wissensdatenbank',
      link: '/fire-sharing',
      icon: CalendarIcon,
    },
  ];
  return (
    <>
      <Button
        variant='outline'
        mr={3}
        onClick={onOpen}
        position='absolute'
        top='4'
        right='4'
        zIndex='overlay'
        border='3px solid'
        borderRadius='16px'
        color='white'
      >
        MENÜ
      </Button>

      {/* Drawer Component */}
      <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
        <DrawerContent backgroundColor='#1B1C1D' color='#FFFFFE'>
          <DrawerHeader textAlign='right' m={'24px 24px 80px'}>
            <Button
              variant='outline'
              mr={3}
              onClick={onClose}
              color='white'
              border='3px solid'
              borderRadius='16px'
            >
              MENÜ
            </Button>
          </DrawerHeader>

          <DrawerBody p='unset'>
            <List>
              {MENU_ITEMS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Box key={index}>
                    {index === 0 && <Divider />}
                    <ListItem
                      cursor={'pointer'}
                      onClick={() => {
                        handleNavigate(item.link);
                      }}
                      mb='2'
                      width='100%'
                      justifyContent='flex-end'
                      borderX='none'
                      display='flex'
                      alignItems='center'
                      gap='4'
                      pr='2'
                      py='1'
                    >
                      <Text fontSize='md' fontWeight='bold'>
                        {item.title}
                      </Text>
                      <ListIcon as={Icon} width='40px' height='40px' />
                    </ListItem>
                    <Divider />
                  </Box>
                );
              })}

              <ListItem
                cursor={'pointer'}
                onClick={() => {
                  alert('Logout');
                }}
                key='logout'
                mb='2'
                width='100%'
                justifyContent='flex-end'
                borderX='none'
                display='flex'
                alignItems='center'
                gap='4'
                pr='2'
                py='1'
              >
                <Text fontSize='md' fontWeight='bold'>
                  Logout
                </Text>
                <ListIcon as={LockIcon} width='40px' height='40px' />
              </ListItem>
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
