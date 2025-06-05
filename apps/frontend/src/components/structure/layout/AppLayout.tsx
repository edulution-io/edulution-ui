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

import React from 'react';
import { Sidebar } from '@/components';
import Header from '@/components/ui/Header';
import { Outlet, useLocation } from 'react-router-dom';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import MenuBar from '@/components/shared/MenuBar';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import Overlays from '@/components/structure/layout/Overlays';
import useUserStore from '@/store/UserStore/UserStore';
import APPS from '@libs/appconfig/constants/apps';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import OfflineBanner from '@/components/shared/OfflineBanner';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';

const AppLayout = () => {
  const { isAuthenticated } = useUserStore();
  const { pathname } = useLocation();
  const menuBar = useMenuBarConfig();
  const { appConfigs } = useAppConfigsStore();
  const { isEduApiHealthy } = useEduApiStore();

  const isMainPage = pathname === DASHBOARD_ROUTE;
  const isCurrentAppForwardingPage = appConfigs.find(
    (a) => a.name === pathname.split('/')[1] && a.appType === APP_INTEGRATION_VARIANT.FORWARDED,
  );
  const isAppHeaderVisible = isMainPage || isCurrentAppForwardingPage;
  const isAppConfigReady = !appConfigs.find((appConfig) => appConfig.name === APPS.NONE);
  const isAuthenticatedAppReady = isAppConfigReady && isAuthenticated;

  return (
    <div className="flex h-screen flex-row">
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {isAppHeaderVisible && <Header hideHeadingText={!isMainPage} />}

        <div className="flex min-h-0 flex-1 flex-row">
          {isEduApiHealthy === false && <OfflineBanner />}

          {!menuBar.disabled && !isMainPage && <MenuBar />}
          <Outlet />
          {isAuthenticatedAppReady && <Overlays />}
        </div>
      </div>

      {isAuthenticatedAppReady && <Sidebar />}
    </div>
  );
};

export default AppLayout;
