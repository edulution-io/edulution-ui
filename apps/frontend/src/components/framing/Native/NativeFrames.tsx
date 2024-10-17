import React from 'react';
import MailPage from '@/pages/Mail/MailPage';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useFrameStore from '@/components/framing/FrameStore';
import LinuxmusterPage from '@/pages/LinuxmusterPage/LinuxmusterPage';
import Whiteboard from '@/pages/Whiteboard/Whiteboard';
import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import TApps from '@libs/appconfig/types/appsType';
import APPS from '@libs/appconfig/constants/apps';
import LearningManagementPage from '@/pages/LearningManagement/LearningManagementPage';
import TicketSystemPage from '@/pages/TicketSystem/TicketSystemPage';
import ChatPage from '@/pages/Chat/ChatPage';

const isActiveNativeFrame = (appConfig: AppConfigDto, loadedFrames: string[]) => {
  const { appType } = appConfig;
  if (appType !== APP_INTEGRATION_VARIANT.NATIVE) return false;
  return loadedFrames.includes(appConfig.name);
};

const NativeFrames = () => {
  const { appConfigs } = useAppConfigsStore();
  const { loadedFrames } = useFrameStore();

  return appConfigs
    .filter((appConfig) => isActiveNativeFrame(appConfig, loadedFrames))
    .map((appConfig) => {
      switch (appConfig.name as TApps) {
        case APPS.MAIL:
          return <MailPage key={appConfig.name} />;
        case APPS.LINUXMUSTER:
          return <LinuxmusterPage key={appConfig.name} />;
        case APPS.LEARNING_MANAGEMENT:
          return <LearningManagementPage key={appConfig.name} />;
        case APPS.TICKET_SYSTEM:
          return <TicketSystemPage key={appConfig.name} />;
        case APPS.CHAT:
          return <ChatPage key={appConfig.name} />;
        case APPS.WHITEBOARD:
          return <Whiteboard key={appConfig.name} />;
        default:
          return null;
      }
    });
};

export default NativeFrames;
