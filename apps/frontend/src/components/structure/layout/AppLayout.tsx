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
import { useAuth } from 'react-oidc-context';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import Overlays from '@/components/structure/layout/Overlays';

const AppLayout = () => {
  const auth = useAuth();
  const { pathname } = useLocation();
  const menuBar = useMenuBarConfig();
  const { appConfigs } = useAppConfigsStore();

  const isMainPage = pathname === '/';
  const isCurrentAppForwardingPage = appConfigs.find(
    (a) => a.name === pathname.split('/')[1] && a.appType === APP_INTEGRATION_VARIANT.FORWARDED,
  );
  const isEdulutionHeaderVisible = pathname === '/' || isCurrentAppForwardingPage;

  return (
    <div className="flex h-screen flex-row">
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {isEdulutionHeaderVisible && <Header hideHeadingText={!isMainPage} />}

        <div className="flex min-h-0 flex-1 flex-row">
          {!menuBar.disabled && !isMainPage && <MenuBar />}
          <Outlet />
          <Overlays />
        </div>
      </div>

      {auth.isAuthenticated && <Sidebar />}
    </div>
  );
};

export default AppLayout;
