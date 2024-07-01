import React from 'react';
import useFrameStore from '@/components/framing/FrameStore';
import { useMediaQuery } from 'usehooks-ts';
import useAppConfigsStore from '@/store/appConfigsStore';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';

const EmbeddedIframes = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { appConfigs } = useAppConfigsStore();
  const { loadedFrames, activeFrame } = useFrameStore();

  const getStyle = (appName: string) =>
    activeFrame === appName
      ? // Fix 56px width calculated value: NIEDUUI-162
        { display: 'block', width: isMobile ? '100%' : 'calc(100% - 56px)' }
      : { display: 'none' };

  return appConfigs
    .filter((appConfig) => appConfig.appType === AppIntegrationType.EMBEDDED)
    .map((appConfig) => (
      <iframe
        key={appConfig.name}
        title={appConfig.name}
        className="absolute inset-y-0 left-0 ml-0 mr-14"
        height="100%"
        src={loadedFrames.includes(appConfig.name) ? appConfig.options.url : undefined}
        style={getStyle(appConfig.name)}
      />
    ));
};

export default EmbeddedIframes;
