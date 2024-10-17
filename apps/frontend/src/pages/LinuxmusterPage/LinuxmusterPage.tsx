import React from 'react';
import getLoginScript from '@/pages/LinuxmusterPage/scripts/login';
import logoutScript from '@/pages/LinuxmusterPage/scripts/logout';
import APPS from '@libs/appconfig/constants/apps';
import NativeIframeWithScripts from '@/components/framing/Native/NativeIframeWithScripts';

const LinuxmusterPage: React.FC = () => (
  <NativeIframeWithScripts
    appName={APPS.LINUXMUSTER}
    getLoginScript={getLoginScript}
    logoutScript={logoutScript}
  />
);

export default LinuxmusterPage;
