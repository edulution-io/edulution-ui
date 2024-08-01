import { Outlet } from 'react-router-dom';
import React from 'react';

const EmptyLayout = () => (
  <div>
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);
export default EmptyLayout;
