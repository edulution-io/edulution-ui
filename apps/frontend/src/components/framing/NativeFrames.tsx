import React from 'react';
import MailPage from '@/pages/Mail/MailPage';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useFrameStore from '@/components/framing/FrameStore';
import LinuxmusterPage from '@/pages/LinuxmusterPage/LinuxmusterPage';
import Whiteboard from '@/pages/Whiteboard/Whiteboard';
import { AppConfigDto, APPS } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';

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
      switch (appConfig.name as APPS) {
        case APPS.MAIL:
          return <MailPage key={appConfig.name} />;
        case APPS.LINUXMUSTER:
          return <LinuxmusterPage key={appConfig.name} />;
        case APPS.WHITEBOARD:
          return <Whiteboard key={appConfig.name} />;
        default:
          return null;
      }
    });
};

export default NativeFrames;
