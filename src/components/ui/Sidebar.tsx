import {
  useDisclosure,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Button,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        icon={<HamburgerIcon />}
        onClick={onOpen}
        position='fixed'
        bottom='4'
        right='4'
        aria-label='Open Menu'
      />

      <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>MENÜ</DrawerHeader>

          <DrawerBody>
            <VStack spacing={4}>
              <Button variant='ghost'>Konferenzen</Button>
              <Button variant='ghost'>Firewall</Button>
              <Button variant='ghost'>Virtualisierung</Button>
              <Button variant='ghost'>Lernmanagement</Button>
              <Button variant='ghost'>Filesharing</Button>
              <Button variant='ghost'>Desktop-Bereitstellung</Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
