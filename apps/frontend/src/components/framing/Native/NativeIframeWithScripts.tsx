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
  const [loginScript, setLoginScript] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoginScript = async () => {
      if (user) {
        const webdavKey = await getWebdavKey();
        setLoginScript(getLoginScript(user.username, webdavKey));
      }
    };

    void fetchLoginScript();
  }, [user]);

  return loginScript ? (
    <NativeIframeLayout
      scriptOnStartUp={loginScript}
      scriptOnStop={logoutScript}
      appName={appName}
    />
  ) : null;
};

export default NativeIframeWithScripts;
