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

import React, { useEffect, useRef } from 'react';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useUserStore from '@/store/UserStore/useUserStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import type TApps from '@libs/appconfig/types/appsType';
import IFRAME_ALLOWED_CONFIG from '@libs/ui/constants/iframeAllowedConfig';

interface NativeFrameProps {
  scriptOnStartUp?: string;
  scriptOnStop?: string;
  appName: TApps;
}

const NativeFrame: React.FC<NativeFrameProps> = ({ scriptOnStartUp, scriptOnStop, appName }) => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated, isPreparingLogout, eduApiToken } = useUserStore();
  const { loadedEmbeddedFrames, activeEmbeddedFrame } = useFrameStore();

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

  const initialUrlRef = useRef<string | undefined>(undefined);
  if (!initialUrlRef.current && currentAppConfig.options.url) {
    initialUrlRef.current = currentAppConfig.options.url.replace(/token=[^&]+/, `token=${eduApiToken}`);
  }

  return (
    <iframe
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
