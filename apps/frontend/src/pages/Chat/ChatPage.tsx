import React from 'react';
import getLoginScript from '@/pages/Chat/scripts/login';
import APPS from '@libs/appconfig/constants/apps';
import NativeIframeWithScripts from '@/components/framing/Native/NativeIframeWithScripts';
import logoutScript from '@/pages/Chat/scripts/logout';

const ChatPage: React.FC = () => (
  <NativeIframeWithScripts
    appName={APPS.CHAT}
    getLoginScript={getLoginScript}
    logoutScript={logoutScript}
  />
);

export default ChatPage;
