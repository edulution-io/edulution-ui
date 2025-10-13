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

import React, { useEffect } from 'react';
import MailPage from '@/pages/Mail/MailPage';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import APPS from '@libs/appconfig/constants/apps';
import { useLocation } from 'react-router-dom';
import useUserStore from '@/store/UserStore/useUserStore';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import getFromPathName from '@libs/common/utils/getFromPathName';

const isActiveNativeFrame = (appConfig: AppConfigDto, loadedFrames: string[]) => {
  const { appType } = appConfig;
  if (appType !== APP_INTEGRATION_VARIANT.NATIVE) return false;
  return loadedFrames.includes(appConfig.name);
};

const NativeFrameManager = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);

  const { appConfigs } = useAppConfigsStore();
  const { isAuthenticated } = useUserStore();
  const { setEmbeddedFrameLoaded, setActiveEmbeddedFrame, loadedEmbeddedFrames } = useFrameStore();

  useEffect(() => {
    const appName = findAppConfigByName(appConfigs, rootPathName)?.name;
    if (isAuthenticated && appName) {
      setEmbeddedFrameLoaded(appName);
      setActiveEmbeddedFrame(appName);
    } else {
      setActiveEmbeddedFrame(null);
    }

    return () => {
      setActiveEmbeddedFrame(null);
    };
  }, [isAuthenticated, pathname]);

  return appConfigs
    .filter((appConfig) => isActiveNativeFrame(appConfig, loadedEmbeddedFrames))
    .map((appConfig) => {
      switch (appConfig.name) {
        case APPS.MAIL:
          return <MailPage key={appConfig.name} />;
        default:
          return null;
      }
    });
};

export default NativeFrameManager;
