import React from 'react';
import { AppIntegrationType } from '@/datatypes/types';
import useAppConfigsStore from '@/store/appConfigsStore';
import useIframeStore from '@/routes/IframeStore';
import { useMediaQuery } from 'usehooks-ts';

const EmbeddedIframes = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { appConfig } = useAppConfigsStore();
  const { loadedIframes, activeIframe } = useIframeStore();

  const getStyle = (appName: string) =>
    activeIframe === appName
      ? { display: 'block', width: isMobile ? '100%' : 'calc(100% - 56px)' }
      : { display: 'none' };

  return appConfig
    .filter((item) => item.appType === AppIntegrationType.EMBEDDED)
    .map((item) => (
      <iframe
        key={item.name}
        title={item.name}
        className="absolute inset-y-0 left-0 ml-0 mr-14 w-screen"
        height="100%"
        src={loadedIframes.includes(item.name) ? item.options.url : undefined}
        style={getStyle(item.name)}
      />
    ));
};

export default EmbeddedIframes;
