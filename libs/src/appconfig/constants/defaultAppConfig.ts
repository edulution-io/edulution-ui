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
  DashboardIcon,
  ClassManagementIcon,
  FilesharingIcon,
  InfoBoardIcon,
  SurveysIcon,
  WhiteboardIcon,
} from '@libs/assets';
import getImageUrl from '@libs/assets/getImageUrl';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APPS from './apps';
import APP_INTEGRATION_VARIANT from './appIntegrationVariant';
import { ALL_DISPLAY_LOCATIONS } from './appDisplayLocations';

const { BULLETIN_BOARD, DASHBOARD, FILE_SHARING, SURVEYS, CLASS_MANAGEMENT, WHITEBOARD } = APPS;
const { NATIVE } = APP_INTEGRATION_VARIANT;

const defaultAppConfig: AppConfigDto[] = [
  {
    name: DASHBOARD,
    icon: getImageUrl(DashboardIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    usesPushNotifications: false,
    position: 1,
    displayLocations: [...ALL_DISPLAY_LOCATIONS],
  },
  {
    name: BULLETIN_BOARD,
    icon: getImageUrl(InfoBoardIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    usesPushNotifications: true,
    position: 2,
    displayLocations: [...ALL_DISPLAY_LOCATIONS],
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
    usesPushNotifications: false,
    position: 3,
    displayLocations: [...ALL_DISPLAY_LOCATIONS],
  },
  {
    name: SURVEYS,
    icon: getImageUrl(SurveysIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    usesPushNotifications: true,
    position: 4,
    displayLocations: [...ALL_DISPLAY_LOCATIONS],
  },
  {
    name: CLASS_MANAGEMENT,
    icon: getImageUrl(ClassManagementIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    usesPushNotifications: false,
    position: 5,
    displayLocations: [...ALL_DISPLAY_LOCATIONS],
  },
  {
    name: WHITEBOARD,
    icon: getImageUrl(WhiteboardIcon),
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: {},
    usesPushNotifications: false,
    position: 6,
    displayLocations: [...ALL_DISPLAY_LOCATIONS],
  },
];

export default defaultAppConfig;
