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

import React, { useState } from 'react';
import { Sidebar } from '@/components';
import { Outlet, useLocation } from 'react-router-dom';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import MenuBar from '@/components/shared/MenuBar';
import MobileTopBar from '@/components/shared/MobileTopBar';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import Overlays from '@/components/structure/layout/Overlays';
import useUserStore from '@/store/UserStore/useUserStore';
import APPS from '@libs/appconfig/constants/apps';
import OfflineBanner from '@/components/shared/OfflineBanner';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';
import useMedia from '@/hooks/useMedia';
import APP_LAYOUT_ID from '@libs/ui/constants/appLayoutId';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';

const AppLayout = () => {
  const { isAuthenticated } = useUserStore();
  const location = useLocation();
  const menuBar = useMenuBarConfig();
  const { appConfigs } = useAppConfigsStore();
  const { isEduApiHealthy } = useEduApiStore();
  const { isMobileView, isTabletView } = useMedia();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);
  const [pageKey, setPageKey] = useState(0);

  const isAppConfigReady = !appConfigs.find((appConfig) => appConfig.name === APPS.NONE);
  const isOnLoginPage = location.pathname === LOGIN_ROUTE;
  const isAuthenticatedAppReady = isAppConfigReady && isAuthenticated && !isOnLoginPage;

  const showMobileTopBar = (isMobileView || isTabletView || isEdulutionApp) && isAuthenticatedAppReady;

  const refreshPage = () => {
    setPageKey((k) => k + 1);
  };

  return (
    <div className="flex h-dvh flex-row">
      <div className="flex h-dvh flex-1 flex-col overflow-hidden">
        {isEduApiHealthy === false && <OfflineBanner />}

        {showMobileTopBar && (
          <MobileTopBar
            showLeftButton={!menuBar.disabled}
            showRightButton
            refreshPage={refreshPage}
          />
        )}

        <div
          className="relative flex min-h-0 flex-1 flex-row"
          id={APP_LAYOUT_ID}
        >
          {!menuBar.disabled && <MenuBar />}

          <Outlet key={`outlet-${pageKey}`} />

          {isAuthenticatedAppReady && <Overlays key={`overlays-${pageKey}`} />}
        </div>
      </div>

      {isAuthenticatedAppReady && <Sidebar />}
    </div>
  );
};

export default AppLayout;
