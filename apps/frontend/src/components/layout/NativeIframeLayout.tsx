import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useAppConfigsStore from '@/store/appConfigsStore';
import Sidebar from '@/components/ui/Sidebar';
import { findAppConfigByName, getFromPathName } from '@/utils/common';
import useUserStore from '@/store/userStore';

interface NativeIframeLayoutProps {
  scriptOnStartUp?: string;
  scriptOnStop?: string;
  handleLoadIframe: (appName: string) => void;
}

const NativeIframeLayout: React.FC<NativeIframeLayoutProps> = ({ scriptOnStartUp, scriptOnStop, handleLoadIframe }) => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfig } = useAppConfigsStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, isPreparingLogout } = useUserStore();

  useEffect(() => {
    if (isAuthenticated && handleLoadIframe) {
      const appName = findAppConfigByName(appConfig, rootPathName)?.name;
      if (appName) {
        handleLoadIframe(appName);
      }
    }
  }, [isAuthenticated, pathname]);

  const injectScript = (iframe: HTMLIFrameElement, script: string) => {
    const attemptInject = () => {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDocument && iframeDocument.readyState === 'complete') {
        const scriptElement = iframeDocument.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.innerHTML = script;
        iframeDocument.head.appendChild(scriptElement);
      } else {
        setTimeout(attemptInject, 100);
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

  return (
    <div className="flex">
      <div className="h-screen w-full">
        <iframe
          ref={iframeRef}
          className="h-screen w-full pr-[58px]"
          title={pathname}
          src={findAppConfigByName(appConfig, rootPathName)?.options.url}
        />
      </div>
      <Sidebar />
    </div>
  );
};

export default NativeIframeLayout;
