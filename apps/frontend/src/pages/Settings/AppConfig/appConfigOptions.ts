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
  AiChatIcon,
  AntiMalwareIcon,
  BackupIcon,
  BulletinBoardIcon,
  ChatIcon,
  ClassManagementIcon,
  ConferencesIcon,
  DesktopDeploymentIcon,
  FileSharingIcon,
  FirewallIcon,
  ForumsIcon,
  KnowledgeBaseIcon,
  LearningManagementIcon,
  LinuxmusterIcon,
  LocationServicesIcon,
  MailIcon,
  MobileDevicesIcon,
  NetworkIcon,
  PrinterIcon,
  RoomBookingIcon,
  SchoolInformationIcon,
  SurveysMenuIcon,
  TicketSystemIcon,
  VirtualizationIcon,
  WhiteBoardIcon,
  WlanIcon,
} from '@/assets/icons';
import { AppConfigOption } from '@libs/appconfig/types';
import APPS from '@libs/appconfig/constants/apps';
import AppConfigSectionsKeys from '@libs/appconfig/constants/appConfigSectionsKeys';
import ONLY_OFFICE_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/onlyOffice';
import MAIL_IMAP_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/imapMailFeed';
import BULLETIN_BOARD_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/bulletinBoard';
import FILE_SHARING_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/fileSharing';
import DOCKER_CONTAINER_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/dockerContainer';
import CLASS_MANAGEMENT_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/classMgmt';

export const APP_CONFIG_OPTIONS: AppConfigOption[] = [
  {
    id: APPS.TICKET_SYSTEM,
    icon: TicketSystemIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.MAIL,
    icon: MailIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.imapMailFeed]: MAIL_IMAP_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
    },
  },
  { id: APPS.CHAT, icon: ChatIcon, color: 'bg-ciDarkBlue', options: ['url', 'proxyConfig'], isNativeApp: false },
  {
    id: APPS.CONFERENCES,
    icon: ConferencesIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'apiKey', 'proxyConfig'],
    isNativeApp: true,
  },
  {
    id: APPS.SURVEYS,
    icon: SurveysMenuIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
  },
  {
    id: APPS.KNOWLEDGE_BASE,
    icon: KnowledgeBaseIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.FILE_SHARING,
    icon: FileSharingIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.fileSharing]: FILE_SHARING_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.onlyOffice]: ONLY_OFFICE_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
    },
  },
  { id: APPS.FORUMS, icon: ForumsIcon, color: 'bg-ciDarkBlue', options: ['url', 'proxyConfig'], isNativeApp: false },
  {
    id: APPS.ROOM_BOOKING,
    icon: RoomBookingIcon,
    color: 'bg-ciLightBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.LEARNING_MANAGEMENT,
    icon: LearningManagementIcon,
    color: 'bg-ciLightBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.SCHOOL_INFORMATION,
    icon: SchoolInformationIcon,
    color: 'bg-ciLightBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.CLASS_MANAGEMENT,
    icon: ClassManagementIcon,
    color: 'bg-ciLightBlue',
    options: ['proxyConfig'],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.veyon]: CLASS_MANAGEMENT_EXTENDED_OPTIONS,
    },
  },
  { id: APPS.PRINTER, icon: PrinterIcon, color: 'bg-ciLightGreen', options: ['url'], isNativeApp: false },
  { id: APPS.NETWORK, icon: NetworkIcon, color: 'bg-ciLightGreen', options: ['url'], isNativeApp: false },
  {
    id: APPS.LOCATION_SERVICES,
    icon: LocationServicesIcon,
    color: 'bg-ciLightGreen',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.DESKTOP_DEPLOYMENT,
    icon: DesktopDeploymentIcon,
    color: 'bg-ciLightGreen',
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
    },
  },
  { id: APPS.WLAN, icon: WlanIcon, color: 'bg-ciLightGreen', options: ['url'], isNativeApp: false },
  {
    id: APPS.MOBILE_DEVICES,
    icon: MobileDevicesIcon,
    color: 'bg-ciLightGreen',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  {
    id: APPS.VIRTUALIZATION,
    icon: VirtualizationIcon,
    color: 'bg-ciLightGreen',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  { id: APPS.FIREWALL, icon: FirewallIcon, color: 'bg-ciGreenToBlue', options: ['url'], isNativeApp: false },
  {
    id: APPS.ANTIMALWARE,
    icon: AntiMalwareIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: false,
  },
  { id: APPS.BACKUP, icon: BackupIcon, color: 'bg-ciGreenToBlue', options: ['url', 'proxyConfig'], isNativeApp: false },
  { id: APPS.AICHAT, icon: AiChatIcon, color: 'bg-ciGreenToBlue', options: ['url', 'proxyConfig'], isNativeApp: false },
  {
    id: APPS.LINUXMUSTER,
    icon: LinuxmusterIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
  },
  {
    id: APPS.WHITEBOARD,
    icon: WhiteBoardIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'proxyConfig'],
    isNativeApp: true,
  },
  {
    id: APPS.BULLETIN_BOARD,
    icon: BulletinBoardIcon,
    color: 'bg-ciDarkBlue',
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.bulletinBoard]: BULLETIN_BOARD_EXTENDED_OPTIONS,
    },
  },
];

export default APP_CONFIG_OPTIONS;
