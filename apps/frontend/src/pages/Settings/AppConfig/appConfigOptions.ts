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
  ClassManagementIcon,
  ConferencesIcon,
  DesktopDeploymentIcon,
  EmbeddedIcon,
  FileSharingIcon,
  ForwardIcon,
  LinuxmusterIcon,
  MailIcon,
  NativeIcon,
  SurveysMenuIcon,
  WhiteBoardIcon,
} from '@/assets/icons';
import type AppConfigOption from '@libs/appconfig/types/appConfigOption';
import APPS from '@libs/appconfig/constants/apps';
import AppConfigSectionsKeys from '@libs/appconfig/constants/appConfigSectionsKeys';
import ONLY_OFFICE_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/onlyOffice';
import MAIL_IMAP_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/imapMailFeed';
import BULLETIN_BOARD_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/bulletinBoard';
import FILE_SHARING_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/fileSharing';
import DOCKER_CONTAINER_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/dockerContainer';
import CLASS_MANAGEMENT_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/classMgmt';

const APP_CONFIG_OPTIONS: AppConfigOption[] = [
  {
    id: APPS.MAIL,
    icon: MailIcon,
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.imapMailFeed]: MAIL_IMAP_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.CONFERENCES,
    icon: ConferencesIcon,
    options: ['url', 'apiKey', 'proxyConfig'],
    isNativeApp: true,
  },
  {
    id: APPS.SURVEYS,
    icon: SurveysMenuIcon,
    options: [],
    isNativeApp: true,
  },
  {
    id: APPS.FILE_SHARING,
    icon: FileSharingIcon,
    options: ['proxyConfig'],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.fileSharing]: FILE_SHARING_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.onlyOffice]: ONLY_OFFICE_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.CLASS_MANAGEMENT,
    icon: ClassManagementIcon,
    options: ['proxyConfig'],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.veyon]: CLASS_MANAGEMENT_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.DESKTOP_DEPLOYMENT,
    icon: DesktopDeploymentIcon,
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.LINUXMUSTER,
    icon: LinuxmusterIcon,
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
  },
  {
    id: APPS.WHITEBOARD,
    icon: WhiteBoardIcon,
    options: [],
    isNativeApp: true,
  },
  {
    id: APPS.BULLETIN_BOARD,
    icon: BulletinBoardIcon,
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.bulletinBoard]: BULLETIN_BOARD_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.FORWARDING,
    icon: ForwardIcon,
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.FRAME,
    icon: EmbeddedIcon,
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.EMBEDDED,
    icon: NativeIcon,
    options: [],
    isNativeApp: false,
  },
];

export default APP_CONFIG_OPTIONS;
