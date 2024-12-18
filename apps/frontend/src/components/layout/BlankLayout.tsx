import React, { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Sidebar } from '@/components';

const BlankLayout: React.FC<PropsWithChildren> = () => {
  const auth = useAuth();
  const { pathname } = useLocation();
  const isHeaderVisible = pathname !== '/' && pathname !== '/login';

  return (
    <div className="flex">
      <div className="flex h-[100vh] w-full flex-col">
        {isHeaderVisible && <Header hideHeadingText />}

        <main className="flex-1 overflow-hidden p-4 md:w-[calc(100%-var(--sidebar-width))] md:pl-4">
          <Outlet />
        </main>
      </div>
      {auth.isAuthenticated ? <Sidebar /> : null}
      <Footer />
    </div>
  );
};

export default BlankLayout;
