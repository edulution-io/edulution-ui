import React from 'react';
import useAppConfigsStore from '@/store/appConfigsStoreOLD';
import { AppConfig, AppIntegrationType, APPS } from '@/datatypes/types';
import nativeIframeAppsList from '@/components/layout/Native/nativeIframeAppsList';
import MailPage from '@/pages/Mail/MailPage';

const isNativeIframe = (appConfig: AppConfig) => {
  const { appType, name } = appConfig;
  if (appType !== AppIntegrationType.NATIVE) return false;
  return nativeIframeAppsList.includes(name as APPS);
};

const NativeFrames = () => {
  const { appConfig: appConfigs } = useAppConfigsStore();

  return appConfigs
    .filter((appConfig) => isNativeIframe(appConfig))
    .map((appConfig) => {
      switch (appConfig.name as APPS) {
        case APPS.MAIL:
          return <MailPage key={appConfig.name} />;
        default:
          return null;
      }
    });
};

export default NativeFrames;
