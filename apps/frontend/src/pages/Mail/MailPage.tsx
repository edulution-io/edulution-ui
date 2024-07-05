import React from 'react';
import NativeIframeLayout from '@/components/framing/NativeIframeLayout';
import useUserStore from '@/store/UserStore/UserStore';
import getLoginScript from '@/pages/Mail/scripts/login';
import logoutScript from '@/pages/Mail/scripts/logout';
import { APPS } from '@libs/appconfig/types';

const MailPage: React.FC = () => {
  const { user, getWebdavKey } = useUserStore();

  return (
    <NativeIframeLayout
      scriptOnStartUp={getLoginScript(user?.username as string, getWebdavKey())}
      scriptOnStop={logoutScript}
      appName={APPS.MAIL}
    />
  );
};

export default MailPage;
