import React from 'react';
import { AppConfig, AppIntegrationType, APPS } from '@/datatypes/types';
import MailPage from '@/pages/Mail/MailPage';
import useAppConfigsStore from '@/store/appConfigsStore';
import useFrameStore from '@/components/framing/FrameStore';
import LinuxmusterPage from '@/pages/LinuxmusterPage/LinuxmusterPage';

const isActiveNativeFrame = (appConfig: AppConfig, loadedFrames: string[]) => {
  const { appType } = appConfig;
  if (appType !== AppIntegrationType.NATIVE) return false;
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
        default:
          return null;
      }
    });
};

export default NativeFrames;