import React, { useEffect, useState } from 'react';
import useUserStore from '@/store/UserStore/UserStore';
import NativeIframeLayout from '@/components/framing/NativeIframeLayout';
import getLoginScript from '@/pages/LinuxmusterPage/scripts/login';
import logoutScript from '@/pages/LinuxmusterPage/scripts/logout';
import { APPS } from '@libs/appconfig/types';

const LinuxmusterPage: React.FC = () => {
  const { user, getWebdavKey } = useUserStore();
  const [webdavKey, setWebdavKey] = useState<string | null>(null);

  useEffect(() => {
    if (!webdavKey) {
      const fetchWebdavKey = async () => {
        const key = await getWebdavKey();
        setWebdavKey(key);
      };
      void fetchWebdavKey();
    }
  }, [user]);

  return webdavKey ? (
    <NativeIframeLayout
      scriptOnStartUp={getLoginScript(user?.username as string, webdavKey)}
      scriptOnStop={logoutScript}
      appName={APPS.LINUXMUSTER}
    />
  ) : null;
};

export default LinuxmusterPage;
