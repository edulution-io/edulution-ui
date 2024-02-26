import React, { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

const BlankLayout: React.FC<PropsWithChildren> = () => (
  <div>
    <main>
      <Outlet />
    </main>
  </div>
);

export default BlankLayout;
