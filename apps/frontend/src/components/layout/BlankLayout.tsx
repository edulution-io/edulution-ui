import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import useUserStore from '@/store/userStore';
import backgroundImage from '@/assets/background.jpg';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '../ui/Sidebar';

const BlankLayout: React.FC<PropsWithChildren> = () => {
  const { pathname } = useLocation();
  const isMainPage = pathname === '/';
  const { isAuthenticated } = useUserStore();

  return (
    <div
      className="flex bg-cover bg-center opacity-90"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex min-h-[100vh] w-full flex-col px-5 lg:px-20">
        <Header isLogoShown={!isMainPage} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      {isAuthenticated ? <Sidebar /> : null}
    </div>
  );
};

export default BlankLayout;
