import React from 'react';
import { AppIntegrationType } from '@/datatypes/types';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/store/appConfigsStore';
import useIsMobileView from '@/hooks/useIsMobileView';

const EmbeddedIframes = () => {
  const isMobileView = useIsMobileView();
  const { appConfigs } = useAppConfigsStore();
  const { loadedFrames, activeFrame } = useFrameStore();

  const getStyle = (appName: string) =>
    activeFrame === appName
      ? // Fix 56px width calculated value: NIEDUUI-162
        { display: 'block', width: isMobileView ? '100%' : 'calc(100% - 56px)' }
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
