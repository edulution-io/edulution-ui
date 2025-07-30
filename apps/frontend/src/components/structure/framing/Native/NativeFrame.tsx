/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useRef } from 'react';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useUserStore from '@/store/UserStore/useUserStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import type TApps from '@libs/appconfig/types/appsType';

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
      className="absolute inset-y-0 left-0 ml-0 mr-14 w-full md:w-[calc(100%-var(--sidebar-width))]"
      height="100%"
      src={loadedEmbeddedFrames.includes(currentAppConfig.name) ? initialUrlRef.current : undefined}
      style={activeEmbeddedFrame === appName ? { display: 'block' } : { display: 'none' }}
    />
  );
};

export default NativeFrame;
