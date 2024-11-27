import React, { useEffect, useRef } from 'react';
import { findAppConfigByName } from '@/utils/common';
import useFrameStore from '@/components/framing/FrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useUserStore from '@/store/UserStore/UserStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';
import APP_CONFIG_SECTIONS_NAME_GENERAL from '@libs/appconfig/constants/sectionsNameAppConfigGeneral';

interface NativeIframeLayoutProps {
  scriptOnStartUp?: string;
  scriptOnStop?: string;
  appName: string;
}

const NativeIframeLayout: React.FC<NativeIframeLayoutProps> = ({ scriptOnStartUp, scriptOnStop, appName }) => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, isPreparingLogout } = useUserStore();
  const { loadedFrames, activeFrame } = useFrameStore();

  const getStyle = () => (activeFrame === appName ? { display: 'block' } : { display: 'none' });

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

  const appConfigGENERALSection = currentAppConfig.options?.find(
    (section) => section.sectionName === APP_CONFIG_SECTIONS_NAME_GENERAL,
  );
  const appConfigURLField = appConfigGENERALSection?.options.find(
    (field) => field.name === APP_CONFIG_SECTION_KEYS_GENERAL.URL,
  );

  return (
    <iframe
      ref={iframeRef}
      title={appName}
      className="absolute inset-y-0 left-0 ml-0 mr-14 w-full md:w-[calc(100%-var(--sidebar-width))]"
      height="100%"
      src={
        loadedFrames.includes(currentAppConfig.name)
          ? (appConfigURLField?.value as string) || (appConfigURLField?.defaultValue as string)
          : undefined
      }
      style={getStyle()}
    />
  );
};

export default NativeIframeLayout;
