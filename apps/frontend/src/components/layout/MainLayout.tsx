import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '@/components/ui/Sidebar';
import MenuBar from '@/components/shared/MenuBar';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';

const MainLayout: React.FC<PropsWithChildren> = () => {
  const { pathname } = useLocation();
  const menuBar = useMenuBarConfig();
  const isMainPage = pathname === '/';

  if (menuBar.disabled) {
    return (
      <div className="flex">
        <div className="flex min-h-[100vh] w-full flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <Sidebar />
      </div>
    );
  }

  return (
    <div className="flex">
      {isMainPage ? null : <MenuBar />}
      <div className="flex min-h-[100vh] w-full flex-col px-5 lg:pr-20">
        <Header isLogoShown={isMainPage} />
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
