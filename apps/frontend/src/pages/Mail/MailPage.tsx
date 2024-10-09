import React, { useEffect, useState } from 'react';
import NativeIframeLayout from '@/components/framing/NativeIframeLayout';
import useUserStore from '@/store/UserStore/UserStore';
import getLoginScript from '@/pages/Mail/scripts/login';
import logoutScript from '@/pages/Mail/scripts/logout';
import { APPS } from '@libs/appconfig/types';

const MailPage: React.FC = () => {
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
      appName={APPS.MAIL}
    />
  ) : null;
};

export default MailPage;
