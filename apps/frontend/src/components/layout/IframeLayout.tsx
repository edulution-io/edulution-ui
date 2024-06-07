import React from 'react';
import { useLocation } from 'react-router-dom';

import useAppConfigsStoreOLD from '@/store/appConfigsStoreOLD';
import Sidebar from '@/components/ui/Sidebar';
import backgroundImage from '@/assets/background.jpg';
import { getFromPathName } from '@/utils/common';

const IframeLayout: React.FC = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfig } = useAppConfigsStoreOLD();

  return (
    <div
      className="flex bg-cover bg-center opacity-90"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="h-screen w-full">
        <iframe
          className="h-screen w-full pr-[58px]"
          title={pathname}
          src={appConfig.find((app) => app.name === rootPathName)?.linkPath}
        />
      </div>
      <Sidebar />
    </div>
  );
};

export default IframeLayout;
