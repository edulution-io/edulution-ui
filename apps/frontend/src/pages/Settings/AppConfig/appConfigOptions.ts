/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import {
  BulletinBoardIcon,
  ClassManagementIcon,
  ConferencesIcon,
  Dashboard,
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
import BULLETIN_BOARD_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/bulletinBoardExtendedOptions';
import FILE_SHARING_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/fileSharing';
import DOCKER_CONTAINER_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/dockerContainerExtendedOptions';
import CLASS_MANAGEMENT_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/classManagementExtendedOptions';
import APP_CONFIG_OPTION_KEYS from '@libs/appconfig/constants/appConfigOptionKeys';
import EMBEDDED_PAGE_EDITOR_CONFIG from '@libs/appconfig/constants/extendedOptions/embeddedPageEditorConfig';
import WEBDAV_SHARE_TABLE_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/webdavShareTableExtendedOptions';
import MAIL_GENERAL_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/mailGeneralExtendedOptions';
import APP_LOGO_EXTENDED_OPTIONS from '@libs/appconfig/constants/extendedOptions/appLogoExtendedOptions';

const APP_CONFIG_OPTIONS: AppConfigOption[] = [
  {
    id: APPS.DASHBOARD,
    icon: Dashboard,
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
    id: APPS.MAIL,
    icon: MailIcon,
    options: [APP_CONFIG_OPTION_KEYS.URL, APP_CONFIG_OPTION_KEYS.PROXYCONFIG],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.general]: MAIL_GENERAL_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.imapMailFeed]: MAIL_IMAP_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.CONFERENCES,
    icon: ConferencesIcon,
    options: [APP_CONFIG_OPTION_KEYS.URL, APP_CONFIG_OPTION_KEYS.APIKEY, APP_CONFIG_OPTION_KEYS.PROXYCONFIG],
    isNativeApp: true,
  },
  {
    id: APPS.SURVEYS,
    icon: SurveysMenuIcon,
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.appLogo]: APP_LOGO_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.FILE_SHARING,
    icon: FileSharingIcon,
    options: [APP_CONFIG_OPTION_KEYS.PROXYCONFIG],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.fileSharing]: FILE_SHARING_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.onlyOffice]: ONLY_OFFICE_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.webdavShare]: WEBDAV_SHARE_TABLE_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.CLASS_MANAGEMENT,
    icon: ClassManagementIcon,
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
      [AppConfigSectionsKeys.veyon]: CLASS_MANAGEMENT_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.DESKTOP_DEPLOYMENT,
    icon: DesktopDeploymentIcon,
    options: [APP_CONFIG_OPTION_KEYS.URL, APP_CONFIG_OPTION_KEYS.PROXYCONFIG],
    isNativeApp: true,
    extendedOptions: {
      [AppConfigSectionsKeys.docker]: DOCKER_CONTAINER_EXTENDED_OPTIONS,
    },
  },
  {
    id: APPS.LINUXMUSTER,
    icon: LinuxmusterIcon,
    options: [APP_CONFIG_OPTION_KEYS.URL, APP_CONFIG_OPTION_KEYS.PROXYCONFIG],
    isNativeApp: true,
  },
  {
    id: APPS.WHITEBOARD,
    icon: WhiteBoardIcon,
    isNativeApp: true,
  },
  {
    id: APPS.FORWARDING,
    icon: ForwardIcon,
    options: [APP_CONFIG_OPTION_KEYS.URL, APP_CONFIG_OPTION_KEYS.PROXYCONFIG],
    isNativeApp: false,
  },
  {
    id: APPS.FRAME,
    icon: EmbeddedIcon,
    options: [APP_CONFIG_OPTION_KEYS.URL, APP_CONFIG_OPTION_KEYS.PROXYCONFIG],
    isNativeApp: false,
  },
  {
    id: APPS.EMBEDDED,
    icon: NativeIcon,
    options: [],
    isNativeApp: false,
    extendedOptions: {
      [AppConfigSectionsKeys.editor]: EMBEDDED_PAGE_EDITOR_CONFIG,
    },
  },
];

export default APP_CONFIG_OPTIONS;
