import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useAppConfigsStore from '@/store/appConfigsStore';
import Sidebar from '@/components/ui/Sidebar';
import { findAppConfigByName, getFromPathName } from '@/utils/common';
import useUserStore from '@/store/userStore';

interface IframeLayoutProps {
  scriptOnStartUp?: string;
  scriptOnStop?: string;
}

const IframeLayout: React.FC<IframeLayoutProps> = ({ scriptOnStartUp, scriptOnStop }) => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfig } = useAppConfigsStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated } = useUserStore();

  const injectScript = (script: string) => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        console.info('Injecting script into iframe.');
        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          const scriptElement = iframeDocument.createElement('script');
          scriptElement.type = 'text/javascript';
          scriptElement.innerHTML = script;
          iframeDocument.head.appendChild(scriptElement);
        }
      };
    }
  };

  useEffect(() => {
    if (scriptOnStartUp && isAuthenticated) {
      injectScript(scriptOnStartUp);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (scriptOnStop && !isAuthenticated) {
      injectScript(scriptOnStop);
    }
  }, [isAuthenticated]);

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
