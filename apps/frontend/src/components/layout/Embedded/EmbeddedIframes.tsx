import React from 'react';
import { AppIntegrationType } from '@/datatypes/types';
import useAppConfigsStore from '@/store/appConfigsStoreOLD';
import useIframeStore from '@/routes/IframeStore';
import { useMediaQuery } from 'usehooks-ts';

const EmbeddedIframes = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { appConfig: appConfigs } = useAppConfigsStore();
  const { loadedIframes, activeIframe } = useIframeStore();

  const getStyle = (appName: string) =>
    activeIframe === appName
      ? // Fix 56px width calculated value: NIEDUUI-162
        { display: 'block', width: isMobile ? '100%' : 'calc(100% - 56px)' }
      : { display: 'none' };

  return appConfigs
    .filter((appConfig) => appConfig.appType === AppIntegrationType.EMBEDDED)
    .map((appConfig) => (
      <iframe
        key={appConfig.name}
        title={appConfig.name}
        className="absolute inset-y-0 left-0 ml-0 mr-14 w-screen"
        height="100%"
        src={loadedIframes.includes(appConfig.name) ? appConfig.options.url : undefined}
        style={getStyle(appConfig.name)}
      />
    ));
};

export default EmbeddedIframes;
