import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '../ui/Sidebar';

const BlankLayout: React.FC<PropsWithChildren> = () => {
  const auth = useAuth();
  const { pathname } = useLocation();
  const isMainPage = pathname === '/';

  return (
    <div className="flex">
      <div className="flex min-h-[100vh] w-full flex-col px-5 lg:pr-20">
        {!isMainPage ? <Header hideHeadingText /> : null}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      {auth.isAuthenticated ? <Sidebar /> : null}
      <Footer />
    </div>
  );
};

export default BlankLayout;
