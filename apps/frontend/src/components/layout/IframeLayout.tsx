import React from 'react';
import { useLocation } from 'react-router-dom';

import useAppConfigsStore from '@/store/appConfigsStore';
import Sidebar from '@/components/ui/Sidebar';
import backgroundImage from '@/assets/background.jpg';
import { findAppConfigByName, getFromPathName } from '@/utils/common';

const IframeLayout: React.FC = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfig } = useAppConfigsStore();

  return (
    <div
      className="flex bg-cover bg-center opacity-90"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="h-screen w-full">
        <iframe
          className="h-screen w-full pr-[58px]"
          title={pathname}
          src={findAppConfigByName(appConfig, rootPathName)?.options.url}
        />
      </div>
      <Sidebar />
    </div>
  );
};

export default IframeLayout;
