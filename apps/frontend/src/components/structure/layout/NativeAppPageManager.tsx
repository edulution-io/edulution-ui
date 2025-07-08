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
import { Outlet, useLocation } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import type TApps from '@libs/appconfig/types/appsType';
import { ConferencePage } from '@/pages/ConferencePage';
import DesktopDeploymentPage from '@/pages/DesktopDeployment/DesktopDeploymentPage';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';
import Whiteboard from '@/pages/Whiteboard/Whiteboard';
import { getFromPathName } from '@libs/common/utils';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useUserStore from '@/store/UserStore/useUserStore';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';

const nativeAppPages: Partial<Record<TApps, JSX.Element>> = {
  [APPS.CONFERENCES]: <ConferencePage />,
  [APPS.MAIL]: <div id={APPS.MAIL} />,
  [APPS.LINUXMUSTER]: <div id={APPS.LINUXMUSTER} />,
  [APPS.WHITEBOARD]: <Whiteboard />,
  [APPS.DESKTOP_DEPLOYMENT]: <DesktopDeploymentPage />,
  [APPS.CLASS_MANAGEMENT]: <Outlet />,
  [APPS.BULLETIN_BOARD]: <BulletinBoardPage />,
};

type NativeAppPageManagerProps = {
  page: string;
};

const NativeAppPageManager: React.FC<NativeAppPageManagerProps> = ({ page }) => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfigs } = useAppConfigsStore();
  const { isAuthenticated } = useUserStore();
  const { setEmbeddedFrameLoaded, setActiveEmbeddedFrame } = useFrameStore();

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

  return nativeAppPages[page as TApps];
};

export default NativeAppPageManager;
