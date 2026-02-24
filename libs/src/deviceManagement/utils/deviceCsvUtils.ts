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

import type ListManagementEntry from '@libs/userManagement/types/listManagementEntry';
import type DeviceRow from '@libs/deviceManagement/types/deviceRow';
import DEVICE_COLUMNS from '@libs/deviceManagement/constants/deviceColumns';
import DEVICE_FIELDS from '@libs/deviceManagement/constants/deviceFields';
import {
  createEmptyEntry as createEmptyEntryBase,
  entriesToRows as entriesToRowsBase,
  rowsToEntries as rowsToEntriesBase,
  entriesToCsvWithComments as entriesToCsvWithCommentsBase,
  csvToEntriesWithComments as csvToEntriesWithCommentsBase,
} from '@libs/common/utils/csvEntryUtils';

const DEVICE_ENTRY_DEFAULTS: Record<string, string> = {
  sophomorixRole: 'classroom-studentcomputer',
  pxeFlag: '0',
};

const createEmptyDeviceEntry = (): ListManagementEntry => createEmptyEntryBase(DEVICE_FIELDS, DEVICE_ENTRY_DEFAULTS);

const deviceEntriesToRows = (entries: ListManagementEntry[]): DeviceRow[] =>
  entriesToRowsBase<DeviceRow>(entries, DEVICE_COLUMNS);

const deviceRowsToEntries = (rows: DeviceRow[], originalEntries: ListManagementEntry[]): ListManagementEntry[] =>
  rowsToEntriesBase(rows, originalEntries, DEVICE_COLUMNS, createEmptyDeviceEntry);

const deviceEntriesToCsvWithComments = (
  commentEntries: ListManagementEntry[],
  dataEntries: ListManagementEntry[],
): string => entriesToCsvWithCommentsBase(commentEntries, dataEntries, DEVICE_FIELDS);

const csvToDeviceEntriesWithComments = (
  csv: string,
): { entries: ListManagementEntry[]; commentEntries: ListManagementEntry[] } =>
  csvToEntriesWithCommentsBase(csv, DEVICE_FIELDS);

export {
  deviceEntriesToRows,
  deviceRowsToEntries,
  createEmptyDeviceEntry,
  deviceEntriesToCsvWithComments,
  csvToDeviceEntriesWithComments,
};
