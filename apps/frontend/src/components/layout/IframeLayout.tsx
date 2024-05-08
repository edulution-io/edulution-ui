import React from 'react';
import { useLocation } from 'react-router-dom';

import useAppDataStore from '@/store/appDataStore';
import Sidebar from '@/components/ui/Sidebar';
import backgroundImage from '@/assets/new_background.png';
import { getFromPathName } from '@/utils/common';

const IframeLayout: React.FC = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { config } = useAppDataStore();

  return (
    <div
      className="flex bg-cover bg-center opacity-90"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="h-screen w-full">
        <iframe
          className="h-screen w-full pr-[58px]"
          title={pathname}
          src={config.find((app) => app.name === rootPathName)?.linkPath}
        />
      </div>
      <Sidebar />
    </div>
  );
};

export default IframeLayout;
