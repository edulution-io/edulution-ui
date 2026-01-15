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
import { useLocation } from 'react-router-dom';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useUserStore from '@/store/UserStore/useUserStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import { combineUrlParts, getExternalUrlForDeepLink, getSubPathFromBrowserUrl } from '@libs/common/utils';
import IFRAME_ALLOWED_CONFIG from '@libs/ui/constants/iframeAllowedConfig';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import useFrameUrlSync from '@/hooks/useFrameUrlSync';

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
  const { pathname, hash } = useLocation();
  const { appConfigs } = useAppConfigsStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, isPreparingLogout, eduApiToken } = useUserStore();
  const { loadedEmbeddedFrames, activeEmbeddedFrame } = useFrameStore();

  const currentAppConfig = findAppConfigByName(appConfigs, appName);
  const isFrameLoaded = loadedEmbeddedFrames.includes(appName);

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

  const urlSyncEnabled = !!currentAppConfig?.extendedOptions?.[ExtendedOptionKeys.FRAME_URL_SYNC_ENABLED];
  const preloadBasePage =
    currentAppConfig?.extendedOptions?.[ExtendedOptionKeys.FRAME_URL_SYNC_PRELOAD_BASE_PAGE] !== false;
  const externalBaseUrl = currentAppConfig?.options?.url || '';

  const isActiveFrame = activeEmbeddedFrame === appName;

  const browserSubPath = combineUrlParts(getSubPathFromBrowserUrl(pathname, hash, appName));
  const deepLinkUrl =
    !preloadBasePage && browserSubPath ? getExternalUrlForDeepLink(externalBaseUrl, browserSubPath) : null;

  const initialBrowserSubPathRef = useRef<string | null>(browserSubPath);
  const hasNavigatedToDeepLinkRef = useRef(false);
  const currentSrcRef = useRef<string | undefined>(undefined);

  const hasPendingDeepLink = preloadBasePage && initialBrowserSubPathRef.current && !hasNavigatedToDeepLinkRef.current;

  useEffect(() => {
    if (!preloadBasePage || !isFrameLoaded || !isActiveFrame || hasNavigatedToDeepLinkRef.current) {
      return undefined;
    }

    const targetSubPath = initialBrowserSubPathRef.current;
    if (!targetSubPath) return undefined;

    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    const navigateToDeepLink = () => {
      const targetUrl = getExternalUrlForDeepLink(externalBaseUrl, targetSubPath);
      iframe.src = targetUrl;
      currentSrcRef.current = targetUrl;
      hasNavigatedToDeepLinkRef.current = true;
    };

    const handleLoad = () => {
      setTimeout(navigateToDeepLink, 100);
    };

    iframe.addEventListener('load', handleLoad, { once: true });
    return () => iframe.removeEventListener('load', handleLoad);
  }, [preloadBasePage, isFrameLoaded, isActiveFrame, externalBaseUrl]);

  const urlSyncShouldBeEnabled = urlSyncEnabled && isFrameLoaded && isActiveFrame && !hasPendingDeepLink;

  useFrameUrlSync({
    appName,
    iframeRef,
    enabled: urlSyncShouldBeEnabled,
  });

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

  const getIframeSrc = () => {
    if (!isFrameLoaded) return undefined;

    if (deepLinkUrl) {
      currentSrcRef.current = deepLinkUrl;
      return deepLinkUrl;
    }

    if (currentSrcRef.current) {
      return currentSrcRef.current;
    }

    currentSrcRef.current = initialUrlRef.current;
    return initialUrlRef.current;
  };

  return (
    <iframe
      key={reloadKey}
      ref={iframeRef}
      title={appName}
      className="absolute inset-y-0 left-0 ml-0 w-full"
      height="100%"
      allow={IFRAME_ALLOWED_CONFIG}
      src={getIframeSrc()}
      style={isActiveFrame ? { display: 'block' } : { display: 'none' }}
    />
  );
};

export default NativeFrame;
