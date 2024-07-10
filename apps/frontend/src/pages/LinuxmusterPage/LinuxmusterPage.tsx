import React from 'react';
import useUserStore from '@/store/UserStore/UserStore';
import NativeIframeLayout from '@/components/framing/NativeIframeLayout';
import getLoginScript from '@/pages/LinuxmusterPage/scripts/login';
import logoutScript from '@/pages/LinuxmusterPage/scripts/logout';
import { APPS } from '@libs/appconfig/types';

const LinuxmusterPage: React.FC = () => {
  const { user, getWebdavKey } = useUserStore();

  return (
    <NativeIframeLayout
      scriptOnStartUp={getLoginScript(user?.username as string, getWebdavKey())}
      scriptOnStop={logoutScript}
      appName={APPS.LINUXMUSTER}
    />
  );
};

export default LinuxmusterPage;
