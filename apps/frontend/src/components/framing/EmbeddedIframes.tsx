import React from 'react';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';

const EmbeddedIframes = () => {
  const { appConfigs } = useAppConfigsStore();
  const { loadedEmbeddedFrames, activeEmbeddedFrame } = useFrameStore();

  return appConfigs
    .filter((appConfig) => appConfig.appType === APP_INTEGRATION_VARIANT.EMBEDDED)
    .map((appConfig) => {
      const isOpen = activeEmbeddedFrame === appConfig.name;
      const url = loadedEmbeddedFrames.includes(appConfig.name) ? appConfig.options.url : undefined;
      return (
        <iframe
          key={appConfig.name}
          title={appConfig.name}
          className={`absolute inset-y-0 left-0 ml-0 mr-14 w-full md:w-[calc(100%-var(--sidebar-width))] ${isOpen ? 'block' : 'hidden'}`}
          height="100%"
          src={url}
        />
      );
    });
};

export default EmbeddedIframes;
