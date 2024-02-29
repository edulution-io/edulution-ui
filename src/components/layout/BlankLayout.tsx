import React, { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

import backgroundImage from '@/assets/background.jpg';

const BlankLayout: React.FC<PropsWithChildren> = () => (
  <div
    className="flex bg-cover bg-center opacity-90"
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
    <main className="h-screen w-screen">
      <Outlet />
    </main>
  </div>
);

export default BlankLayout;
