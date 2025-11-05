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

import React, { useState } from 'react';
import { Sidebar } from '@/components';
import { Outlet } from 'react-router-dom';
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

const AppLayout = () => {
  const { isAuthenticated } = useUserStore();
  const menuBar = useMenuBarConfig();
  const { appConfigs } = useAppConfigsStore();
  const { isEduApiHealthy } = useEduApiStore();
  const { isMobileView } = useMedia();
  const [pageKey, setPageKey] = useState(0);

  const isAppConfigReady = !appConfigs.find((appConfig) => appConfig.name === APPS.NONE);
  const isAuthenticatedAppReady = isAppConfigReady && isAuthenticated;

  const refreshPage = () => {
    setPageKey((k) => k + 1);
  };

  return (
    <div className="flex h-screen flex-row">
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {isEduApiHealthy === false && <OfflineBanner />}

        {isMobileView && isAuthenticatedAppReady && (
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
