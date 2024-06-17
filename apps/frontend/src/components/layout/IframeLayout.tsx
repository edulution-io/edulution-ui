import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useAppConfigsStoreOLD from '@/store/appConfigsStoreOLD';
import Sidebar from '@/components/ui/Sidebar';
import { findAppConfigByName, getFromPathName } from '@/utils/common';
import useUserStore from '@/store/userStoreOLD';
import { toast } from 'sonner';

interface IframeLayoutProps {
  scriptOnStartUp?: string;
  scriptOnStop?: string;
}

const IframeLayout: React.FC<IframeLayoutProps> = ({ scriptOnStartUp, scriptOnStop }) => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfig } = useAppConfigsStoreOLD();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, isPreparingLogout } = useUserStore();

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
    try {
      attemptInject();
    } catch (e) {
      console.error(e);
      if (e instanceof DOMException) {
        toast.error(`${e.name}: ${e.message}`);
      }
    }
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

export default IframeLayout;
