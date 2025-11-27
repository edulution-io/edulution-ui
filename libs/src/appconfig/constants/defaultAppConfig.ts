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
  DashboardIcon,
  ClassManagementIcon,
  FilesharingIcon,
  SurveysIcon,
  WhiteboardIcon,
} from '@libs/assets';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APPS from './apps';
import APP_INTEGRATION_VARIANT from './appIntegrationVariant';

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
