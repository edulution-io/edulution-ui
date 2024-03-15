import React, { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

import backgroundImage from '@/assets/background.jpg';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '../ui/Sidebar';

const BlankLayout: React.FC<PropsWithChildren> = () => {
  const auth = useAuth();

  return (
    <div
      className="flex bg-cover bg-center opacity-90"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex min-h-[100vh] w-full flex-col px-5 lg:px-20">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      {auth.isAuthenticated ? <Sidebar /> : null}
    </div>
  );
};

export default BlankLayout;
