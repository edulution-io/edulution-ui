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
import { Outlet } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import type TApps from '@libs/appconfig/types/appsType';
import { ConferencePage } from '@/pages/ConferencePage';
import DesktopDeploymentPage from '@/pages/DesktopDeployment/DesktopDeploymentPage';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';
import Whiteboard from '@/pages/Whiteboard/Whiteboard';

const nativeAppPages: Partial<Record<TApps, JSX.Element>> = {
  [APPS.CONFERENCES]: <ConferencePage />,
  [APPS.WHITEBOARD]: <Whiteboard />,
  [APPS.DESKTOP_DEPLOYMENT]: <DesktopDeploymentPage />,
  [APPS.CLASS_MANAGEMENT]: <Outlet />,
  [APPS.BULLETIN_BOARD]: <BulletinBoardPage />,
};

type NativeAppPageManagerProps = {
  page: string;
};

const NativeAppPageManager: React.FC<NativeAppPageManagerProps> = ({ page }) => nativeAppPages[page as TApps];

export default NativeAppPageManager;
