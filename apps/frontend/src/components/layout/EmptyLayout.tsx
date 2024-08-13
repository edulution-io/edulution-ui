import { Outlet } from 'react-router-dom';
import React from 'react';

const EmptyLayout = () => (
  <main className="flex-1">
    <Outlet />
  </main>
);
export default EmptyLayout;
