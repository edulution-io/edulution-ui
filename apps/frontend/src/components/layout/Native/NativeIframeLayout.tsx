import React, { useEffect, useRef } from 'react';
import useAppConfigsStore from '@/store/appConfigsStoreOLD';
import { findAppConfigByName } from '@/utils/common';
import useUserStore from '@/store/userStoreOLD';
import useIframeStore from '@/routes/IframeStore';
import { useMediaQuery } from 'usehooks-ts';

interface NativeIframeLayoutProps {
  scriptOnStartUp?: string;
  scriptOnStop?: string;
  appName: string;
}

const NativeIframeLayout: React.FC<NativeIframeLayoutProps> = ({ scriptOnStartUp, scriptOnStop, appName }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { appConfig } = useAppConfigsStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, isPreparingLogout } = useUserStore();
  const { loadedIframes, activeIframe } = useIframeStore();

  const getStyle = () =>
    activeIframe === appName
      ? // Fix 56px width calculated value: NIEDUUI-162
        { display: 'block', width: isMobile ? '100%' : 'calc(100% - 56px)' }
      : { display: 'none' };

  const injectScript = (iframe: HTMLIFrameElement, script: string) => {
    const attemptInject = () => {
      try {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument && iframeDocument.readyState === 'complete') {
          const scriptElement = iframeDocument.createElement('script');
          scriptElement.type = 'text/javascript';
          scriptElement.innerHTML = script;
          iframeDocument.head.appendChild(scriptElement);
        } else {
          setTimeout(attemptInject, 100);
        }
      } catch (e) {
        console.error(e);
      }
    };
    attemptInject();
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && scriptOnStartUp) {
      iframe.onload = () => {
        injectScript(iframe, scriptOnStartUp);
      };
    }
  }, [scriptOnStartUp, isAuthenticated]);

  useEffect(() => {
    if (isPreparingLogout && scriptOnStop && iframeRef.current) {
      injectScript(iframeRef.current, scriptOnStop);
    }
  }, [isPreparingLogout, scriptOnStop]);

  const currentAppConfig = findAppConfigByName(appConfig, appName);
  if (!currentAppConfig) return null;

  return (
    <iframe
      ref={iframeRef}
      title={appName}
      className="absolute inset-y-0 left-0 ml-0 mr-14 w-screen"
      height="100%"
      src={loadedIframes.includes(currentAppConfig.name) ? currentAppConfig.options.url : undefined}
      style={getStyle()}
    />
  );
};

export default NativeIframeLayout;
