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

import {
  BulletinBoardIcon,
  DashboardIcon,
  ClassManagementIcon,
  FilesharingIcon,
  SurveysIcon,
  WhiteboardIcon,
} from '@libs/assets';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APPS from './apps';
import APP_INTEGRATION_VARIANT from './appIntegrationVariants';

const { BULLETIN_BOARD, DASHBOARD, FILE_SHARING, SURVEYS, CLASS_MANAGEMENT, WHITEBOARD } = APPS;
const { NATIVE } = APP_INTEGRATION_VARIANT;

const getImageUrl = (src: string) => `data:image/svg+xml,${encodeURIComponent(src)}`;

const defaultAppConfig: AppConfigDto[] = [
  {
    name: DASHBOARD,
    icon: getImageUrl(DashboardIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    position: 1,
  },
  {
    name: BULLETIN_BOARD,
    icon: getImageUrl(BulletinBoardIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    position: 2,
  },
  {
    name: FILE_SHARING,
    icon: getImageUrl(FilesharingIcon),
    appType: NATIVE,
    options: {
      proxyConfig: '""',
    },
    accessGroups: [],
    extendedOptions: {},
    position: 3,
  },
  {
    name: SURVEYS,
    icon: getImageUrl(SurveysIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    position: 4,
  },
  {
    name: CLASS_MANAGEMENT,
    icon: getImageUrl(ClassManagementIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    position: 5,
  },
  {
    name: WHITEBOARD,
    icon: getImageUrl(WhiteboardIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    position: 6,
  },
];

export default defaultAppConfig;
