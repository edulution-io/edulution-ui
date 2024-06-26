import React, { useEffect, useRef } from 'react';
import { findAppConfigByName } from '@/utils/common';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/store/appConfigsStore';
import useUserStore from '@/store/UserStore/UserStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import useIsMobileView from '@/hooks/useIsMobileView';

interface NativeIframeLayoutProps {
  scriptOnStartUp?: string;
  scriptOnStop?: string;
  appName: string;
}

const NativeIframeLayout: React.FC<NativeIframeLayoutProps> = ({ scriptOnStartUp, scriptOnStop, appName }) => {
  const isMobileView = useIsMobileView();
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, isPreparingLogout } = useUserStore();
  const { loadedFrames, activeFrame } = useFrameStore();

  const getStyle = () =>
    activeFrame === appName
      ? // Fix 56px width calculated value: NIEDUUI-162
        { display: 'block', width: isMobileView ? '100%' : 'calc(100% - 56px)' }
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
        if (e instanceof DOMException) {
          toast.error(t('errors.automaticLoginFailed'));
        }
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

  const currentAppConfig = findAppConfigByName(appConfigs, appName);
  if (!currentAppConfig) return null;

  return (
    <iframe
      ref={iframeRef}
      title={appName}
      className="absolute inset-y-0 left-0 ml-0 mr-14"
      height="100%"
      src={loadedFrames.includes(currentAppConfig.name) ? currentAppConfig.options.url : undefined}
      style={getStyle()}
    />
  );
};

export default NativeIframeLayout;
