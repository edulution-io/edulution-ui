import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/ui/Sidebar/Sidebar';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useUserStore from '@/store/UserStore/UserStore';
import { getFromPathName } from '@libs/common/utils';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';

const FramePlaceholder: React.FC = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfigs } = useAppConfigsStore();
  const { isAuthenticated } = useUserStore();
  const { setEmbeddedFrameLoaded, setActiveEmbeddedFrame } = useFrameStore();

  useEffect(() => {
    if (isAuthenticated) {
      const appName = findAppConfigByName(appConfigs, rootPathName)?.name;
      if (appName) {
        setEmbeddedFrameLoaded(appName);
        setActiveEmbeddedFrame(appName);
      }
    }

    return () => {
      setActiveEmbeddedFrame(null);
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
