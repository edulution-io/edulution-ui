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

import React, { useEffect } from 'react';
import MailPage from '@/pages/Mail/MailPage';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import LinuxmusterPage from '@/pages/LinuxmusterPage/LinuxmusterPage';
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
        case APPS.LINUXMUSTER:
          return <LinuxmusterPage key={appConfig.name} />;
        default:
          return null;
      }
    });
};

export default NativeFrameManager;
