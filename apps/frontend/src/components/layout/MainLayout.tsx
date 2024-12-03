import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Sidebar } from '@/components';
import MenuBar from '@/components/shared/MenuBar';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';

const MainLayout: React.FC<PropsWithChildren> = () => {
  const { pathname } = useLocation();
  const menuBar = useMenuBarConfig();
  const isMainPage = pathname === '/';

  return (
    <div className="flex">
      {!menuBar.disabled && !isMainPage && <MenuBar />}
      <div
        className={`flex h-[100vh] flex-col overflow-hidden md:w-[calc(100%-var(--sidebar-width))] ${!menuBar.disabled ? 'pl-2' : ''}`}
      >
        {!menuBar.disabled && isMainPage && <Header />}
        <main className="ml-4 mt-4 flex-1">
          <Outlet />
        </main>
      </div>
      <Sidebar />
      <Footer />
    </div>
  );
};
export default MainLayout;
