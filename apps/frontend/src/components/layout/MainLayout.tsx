import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import backgroundImage from '@/assets/background.jpg';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import useFileManagerStore from '@/store/fileManagerStore';
import Sidebar from '../ui/Sidebar';
import MenuBar from '../shared/MenuBar';

const MainLayout: React.FC<PropsWithChildren> = () => {
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const isMenuBarVisible = !isMainPage;
  const { isSidebarFixed } = useFileManagerStore();
  return (
    <div
      className="flex bg-cover bg-center opacity-90"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {isMenuBarVisible ? <MenuBar /> : null}
      <div
        className={`flex min-h-[100vh] w-full flex-col px-5 ${isSidebarFixed ? 'pr-20 lg:pl-80' : 'pr-20 lg:pl-36'}`}
      >
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Sidebar />
    </div>
  );
};
export default MainLayout;
