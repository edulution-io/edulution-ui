import React from 'react';
import { useEncryption } from '@/hooks/mutations';
import useUserStore from '@/store/UserStore/UserStore';
import NativeIframeLayout from '@/components/framing/NativeIframeLayout';
import getLoginScript from '@/pages/LinuxmusterPage/scripts/login';
import logoutScript from '@/pages/LinuxmusterPage/scripts/logout';
import { APPS } from '@libs/appconfig/types';

const LinuxmusterPage: React.FC = () => {
  const { username, webdavKey } = useUserStore();

  const decryptedPassword = useEncryption({
    mode: 'decrypt',
    data: webdavKey,
    key: `${import.meta.env.VITE_WEBDAV_KEY}`,
  });

  return (
    <NativeIframeLayout
      scriptOnStartUp={getLoginScript(username, decryptedPassword)}
      scriptOnStop={logoutScript}
      appName={APPS.LINUXMUSTER}
    />
  );
};

export default LinuxmusterPage;
