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

import { ClassManagementIcon, FilesharingIcon, SurveysIcon, WhiteboardIcon, BulletinBoardIcon } from '@libs/assets';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APPS from './apps';
import APP_INTEGRATION_VARIANT from './appIntegrationVariants';

const { BULLETIN_BOARD, FILE_SHARING, SURVEYS, CLASS_MANAGEMENT, WHITEBOARD } = APPS;
const { NATIVE } = APP_INTEGRATION_VARIANT;

const defaultAppConfig: AppConfigDto[] = [
  {
    name: BULLETIN_BOARD,
    icon: BulletinBoardIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
  },
  {
    name: FILE_SHARING,
    icon: FilesharingIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
  },
  {
    name: SURVEYS,
    icon: SurveysIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
  },
  {
    name: CLASS_MANAGEMENT,
    icon: ClassManagementIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
  },
  {
    name: WHITEBOARD,
    icon: WhiteboardIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
  },
];

export default defaultAppConfig;
