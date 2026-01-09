/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect, useRef, useState } from 'react';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useUserStore from '@/store/UserStore/useUserStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import IFRAME_ALLOWED_CONFIG from '@libs/ui/constants/iframeAllowedConfig';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

interface NativeFrameProps {
  scriptOnStartUp?: string;
  scriptOnStop?: string;
  appName: string;
}

const NativeFrame: React.FC<NativeFrameProps> = ({
  scriptOnStartUp: scriptOnStartUpProp,
  scriptOnStop: scriptOnStopProp,
  appName,
}) => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, isPreparingLogout, eduApiToken } = useUserStore();
  const { loadedEmbeddedFrames, activeEmbeddedFrame } = useFrameStore();

  const currentAppConfig = findAppConfigByName(appConfigs, appName);

  const onLoadEnabled = currentAppConfig?.extendedOptions?.[ExtendedOptionKeys.FRAME_SCRIPT_ON_LOAD_ENABLED];
  const scriptOnStartUp =
    scriptOnStartUpProp ||
    (onLoadEnabled
      ? (currentAppConfig?.extendedOptions?.[ExtendedOptionKeys.FRAME_SCRIPT_ON_LOAD_CONTENT] as string)
      : undefined);

  const onLogoutEnabled = currentAppConfig?.extendedOptions?.[ExtendedOptionKeys.FRAME_SCRIPT_ON_LOGOUT_ENABLED];
  const scriptOnStop =
    scriptOnStopProp ||
    (onLogoutEnabled
      ? (currentAppConfig?.extendedOptions?.[ExtendedOptionKeys.FRAME_SCRIPT_ON_LOGOUT_CONTENT] as string)
      : undefined);

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
          toast.error(t('errors.scriptInjectionFailed'));
        }
      }
    };
    attemptInject();
  };

  const isFrameLoaded = loadedEmbeddedFrames.includes(appName);
  const [reloadKey, setReloadKey] = useState(0);
  const prevScriptRef = useRef(scriptOnStartUp);

  useEffect(() => {
    if (isFrameLoaded && prevScriptRef.current !== scriptOnStartUp) {
      setReloadKey((k) => k + 1);
    }
    prevScriptRef.current = scriptOnStartUp;
  }, [scriptOnStartUp, isFrameLoaded]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && scriptOnStartUp && isFrameLoaded) {
      iframe.onload = () => {
        injectScript(iframe, scriptOnStartUp);
      };
    }
  }, [scriptOnStartUp, isAuthenticated, isFrameLoaded, reloadKey]);

  const initialUrlRef = useRef<string | undefined>(undefined);
  const baseUrlRef = useRef<string | undefined>(undefined);

  const currentBaseUrl = currentAppConfig?.options.url;
  if (currentBaseUrl && currentBaseUrl !== baseUrlRef.current) {
    baseUrlRef.current = currentBaseUrl;
    initialUrlRef.current = currentBaseUrl.replace(/token=[^&]+/, `token=${eduApiToken}`);
  }

  useEffect(() => {
    if (isPreparingLogout && scriptOnStop && isFrameLoaded && iframeRef.current) {
      injectScript(iframeRef.current, scriptOnStop);
    }
  }, [isPreparingLogout, scriptOnStop, isFrameLoaded]);

  if (!currentAppConfig) return null;

  return (
    <iframe
      key={reloadKey}
      ref={iframeRef}
      title={appName}
      className="absolute inset-y-0 left-0 ml-0 w-full"
      height="100%"
      allow={IFRAME_ALLOWED_CONFIG}
      src={loadedEmbeddedFrames.includes(currentAppConfig.name) ? initialUrlRef.current : undefined}
      style={activeEmbeddedFrame === appName ? { display: 'block' } : { display: 'none' }}
    />
  );
};

export default NativeFrame;
