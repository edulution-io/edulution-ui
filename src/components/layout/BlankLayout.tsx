import React, { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

const BlankLayout: React.FC<PropsWithChildren> = () => {
  return (
    <Box>
      <main>{<Outlet />}</main>
    </Box>
  );
};

export default BlankLayout;
