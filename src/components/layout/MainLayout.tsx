import React, { PropsWithChildren } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '../ui/Sidebar';

const MainLayout: React.FC<PropsWithChildren> = () => {
  return (
    <Box bg='background.main'>
      <Flex px='20' direction='column' minHeight='100vh'>
        <Header />
        <Sidebar />
        <Box flex='1'>{<Outlet />}</Box>
        <Footer />
      </Flex>
    </Box>
  );
};

export default MainLayout;
