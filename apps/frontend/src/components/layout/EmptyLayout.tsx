import React, { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

const EmptyLayout: React.FC<PropsWithChildren> = () => (
  <div className="flex">
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

export default EmptyLayout;
