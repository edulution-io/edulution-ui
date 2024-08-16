import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Sidebar } from '@/components';
import MenuBar from '@/components/shared/MenuBar';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import useIsMobileView from '@/hooks/useIsMobileView';

const MainLayout: React.FC<PropsWithChildren> = () => {
  const { pathname } = useLocation();
  const menuBar = useMenuBarConfig();
  const isMainPage = pathname === '/';
  const isMobile = useIsMobileView();

  return (
    <div className="flex">
      {!menuBar.disabled && !isMainPage && <MenuBar />}
      <div className={`flex h-[100vh] w-full flex-col ${!menuBar.disabled ? 'pl-2 pr-4 lg:px-20' : ''}`}>
        {!menuBar.disabled && isMainPage && <Header />}
        <main className={`flex-1 ${!menuBar.disabled && !isMobile ? 'ml-[-4vh]' : 'ml-4'}`}>
          {' '}
          <Outlet />
        </main>
      </div>
      <Sidebar />
      <Footer />
    </div>
  );
};
export default MainLayout;
