import React, { useEffect, useState } from 'react';
import NativeIframeLayout from '@/components/framing/Native/NativeIframeLayout';
import useUserStore from '@/store/UserStore/UserStore';

interface IframeAppProps {
  appName: string;
  getLoginScript: (username: string, webdavKey: string) => string;
  logoutScript: string;
}

const NativeIframeWithScripts: React.FC<IframeAppProps> = ({ appName, getLoginScript, logoutScript }) => {
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
      appName={appName}
    />
  ) : null;
};

export default NativeIframeWithScripts;
