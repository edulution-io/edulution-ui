import React, { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

import backgroundImage from '@/assets/background.jpg';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '../ui/Sidebar';

const BlankLayout: React.FC<PropsWithChildren> = () => (
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
    <Sidebar />
  </div>
);

export default BlankLayout;
