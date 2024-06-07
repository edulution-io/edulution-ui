import React from 'react';
import useAppConfigsStore from '@/store/appConfigsStore';
import { AppConfig, AppIntegrationType, APPS } from '@/datatypes/types';
import MailPage from '@/pages/Mail/MailPage';
import Whiteboard from '@/pages/Whiteboard/Whiteboard';
import SurveysPage from '@/pages/Surveys/SurveysPage';
import DesktopDeploymentPage from '@/pages/DesktopDeployment/DesktopDeploymentPage';
import useFrameStore from '@/routes/IframeStore';
import LinuxmusterPage from '@/pages/Linuxmuster/LinuxmusterPage';

const isActiveNativeFrame = (appConfig: AppConfig, loadedFrames: string[]) => {
  const { appType } = appConfig;
  if (appType !== AppIntegrationType.NATIVE) return false;
  if (loadedFrames.includes(appConfig.name)) return true;
};

const NativeFrames = () => {
  const { appConfig: appConfigs } = useAppConfigsStore();
  const { loadedFrames } = useFrameStore();

  return appConfigs
    .filter((appConfig) => isActiveNativeFrame(appConfig, loadedFrames))
    .map((appConfig) => {
      switch (appConfig.name as APPS) {
        case APPS.MAIL:
          return <MailPage key={appConfig.name} />;
        case APPS.WHITEBOARD:
          return <Whiteboard key={appConfig.name} />;
        case APPS.SURVEYS:
          return <SurveysPage key={appConfig.name} />;
        case APPS.DESKTOP_DEPLOYMENT:
          return <DesktopDeploymentPage key={appConfig.name} />;
        case APPS.LINUXMUSTER:
          return <LinuxmusterPage key={appConfig.name} />;
        default:
          return null;
      }
    });
};

export default NativeFrames;
