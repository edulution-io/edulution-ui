import React from 'react';
import getLoginScript from '@/pages/Mail/scripts/login';
import APPS from '@libs/appconfig/constants/apps';
import NativeIframeWithScripts from '@/components/framing/Native/NativeIframeWithScripts';
import logoutScript from '@/pages/Mail/scripts/logout';

const MailPage: React.FC = () => (
  <NativeIframeWithScripts
    appName={APPS.MAIL}
    getLoginScript={getLoginScript}
    logoutScript={logoutScript}
  />
);

export default MailPage;
