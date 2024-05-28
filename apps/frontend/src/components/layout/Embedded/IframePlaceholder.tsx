import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useAppConfigsStore from '@/store/appConfigsStore';
import Sidebar from '@/components/ui/Sidebar';
import { findAppConfigByName, getFromPathName } from '@/utils/common';
import useUserStore from '@/store/userStore';
import useIframeStore from '@/routes/IframeStore';

const IframePlaceholder: React.FC = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfig } = useAppConfigsStore();
  const { isAuthenticated } = useUserStore();
  const { setFrameLoaded, setActiveIframe } = useIframeStore();

  useEffect(() => {
    if (isAuthenticated) {
      const appName = findAppConfigByName(appConfig, rootPathName)?.name;
      if (appName) {
        setFrameLoaded(appName);
        setActiveIframe(appName);
      }
    }

    return () => {
      setActiveIframe(null);
    };
  }, [isAuthenticated, pathname]);

  return (
    <div className="flex">
      <div className="h-screen w-full" />
      <Sidebar />
    </div>
  );
};

export default IframePlaceholder;
