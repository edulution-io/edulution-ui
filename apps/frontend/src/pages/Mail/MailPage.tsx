import React from 'react';
import { useEncryption } from '@/hooks/mutations';
import NativeIframeLayout from '@/components/framing/NativeIframeLayout';
import { APPS } from '@/datatypes/types';
import useUserStore from '@/store/UserStore/UserStore';
import getLoginScript from '@/pages/Mail/scripts/login';
import logoutScript from '@/pages/Mail/scripts/logout';

const MailPage: React.FC = () => {
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
      appName={APPS.MAIL}
    />
  );
};

export default MailPage;
