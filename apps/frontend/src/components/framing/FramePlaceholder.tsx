import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/ui/Sidebar/Sidebar';
import { findAppConfigByName } from '@/utils/common';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/store/appConfigsStore';
import useUserStore from '@/store/UserStore/UserStore';
import { getFromPathName } from '@libs/common/utils';

const FramePlaceholder: React.FC = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfigs } = useAppConfigsStore();
  const { isAuthenticated } = useUserStore();
  const { setFrameLoaded, setActiveFrame } = useFrameStore();

  useEffect(() => {
    if (isAuthenticated) {
      const appName = findAppConfigByName(appConfigs, rootPathName)?.name;
      if (appName) {
        setFrameLoaded(appName);
        setActiveFrame(appName);
      }
    }

    return () => {
      setActiveFrame(null);
    };
  }, [isAuthenticated, pathname]);

  return (
    <div className="flex">
      <div className="h-screen w-full" />
      <Sidebar />
    </div>
  );
};

export default FramePlaceholder;
