import React from 'react';
import getLoginScript from '@/pages/TicketSystem/scripts/login';
import logoutScript from '@/pages/TicketSystem/scripts/logout';
import APPS from '@libs/appconfig/constants/apps';
import NativeIframeWithScripts from '@/components/framing/Native/NativeIframeWithScripts';

const TicketSystemPage: React.FC = () => (
  <NativeIframeWithScripts
    appName={APPS.TICKET_SYSTEM}
    getLoginScript={getLoginScript}
    logoutScript={logoutScript}
  />
);

export default TicketSystemPage;
