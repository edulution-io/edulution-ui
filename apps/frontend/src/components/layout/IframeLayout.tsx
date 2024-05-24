import React from 'react';
import { useLocation } from 'react-router-dom';

import useAppConfigsStore from '@/store/appConfigsStore';
import Sidebar from '@/components/ui/Sidebar';
import { getFromPathName } from '@/utils/common';

const IframeLayout: React.FC = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfig } = useAppConfigsStore();

  return (
    <div className="flex">
      <div className="h-screen w-full">
        <iframe
          className="h-screen w-full pr-[58px]"
          title={pathname}
          src={appConfig.find((app) => app.name === rootPathName)?.options.url}
        />
      </div>
      <Sidebar />
    </div>
  );
};

export default IframeLayout;
