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
import { Outlet } from 'react-router-dom';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import MenuBar from '@/components/shared/MenuBar';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import Overlays from '@/components/structure/layout/Overlays';
import useUserStore from '@/store/UserStore/UserStore';
import APPS from '@libs/appconfig/constants/apps';
import OfflineBanner from '@/components/shared/OfflineBanner';
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';

const AppLayout = () => {
  const { isAuthenticated } = useUserStore();
  const menuBar = useMenuBarConfig();
  const { appConfigs } = useAppConfigsStore();
  const { isEduApiHealthy } = useEduApiStore();

  const isAppConfigReady = !appConfigs.find((appConfig) => appConfig.name === APPS.NONE);
  const isAuthenticatedAppReady = isAppConfigReady && isAuthenticated;

  return (
    <div className="flex h-screen flex-row">
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-row">
          {isEduApiHealthy === false && <OfflineBanner />}

          {!menuBar.disabled && <MenuBar />}

          <Outlet />

          {isAuthenticatedAppReady && <Overlays />}
        </div>
      </div>

      {isAuthenticatedAppReady && <Sidebar />}
    </div>
  );
};

export default AppLayout;
