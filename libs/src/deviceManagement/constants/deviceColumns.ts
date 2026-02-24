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

import type DeviceColumnConfig from '@libs/deviceManagement/types/deviceColumnConfig';

const DEVICE_COLUMNS: DeviceColumnConfig[] = [
  { key: 'room', apiKey: 'room', translationKey: 'deviceManagement.columns.room', type: 'text' },
  { key: 'hostname', apiKey: 'hostname', translationKey: 'deviceManagement.columns.hostname', type: 'text' },
  { key: 'group', apiKey: 'group', translationKey: 'deviceManagement.columns.group', type: 'text' },
  { key: 'mac', apiKey: 'mac', translationKey: 'deviceManagement.columns.mac', type: 'text' },
  { key: 'ip', apiKey: 'ip', translationKey: 'deviceManagement.columns.ip', type: 'text' },
  {
    key: 'sophomorixRole',
    apiKey: 'sophomorixRole',
    translationKey: 'deviceManagement.columns.sophomorixRole',
    type: 'dropdown',
  },
  { key: 'pxeFlag', apiKey: 'pxeFlag', translationKey: 'deviceManagement.columns.pxeFlag', type: 'dropdown' },
];

export default DEVICE_COLUMNS;
