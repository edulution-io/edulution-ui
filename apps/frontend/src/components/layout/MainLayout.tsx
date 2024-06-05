import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
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
        <Footer />
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
      </div>
      <Sidebar />
      <Footer />
    </div>
  );
};
export default MainLayout;
