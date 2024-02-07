import React, { PropsWithChildren } from 'react';

const MainLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <header>{/* Add your header content here */}</header>
      <main>{children}</main>
      <footer>{/* Add your footer content here */}</footer>
    </div>
  );
};

export default MainLayout;
