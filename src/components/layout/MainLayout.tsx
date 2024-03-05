import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import backgroundImage from '@/assets/background.jpg';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '../ui/Sidebar';
import MenuBar from '../shared/MenuBar';

const MainLayout: React.FC<PropsWithChildren> = () => {
  const location = useLocation();

  return (
    <>
      <div
        className="flex bg-cover bg-center opacity-90"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {location.pathname !== '/' ? <MenuBar /> : null}
        <div className="flex min-h-[100vh] w-full flex-col px-5 lg:px-20">
          <Header />
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
      <Sidebar />
    </>
  );
};
export default MainLayout;
