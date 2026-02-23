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

const deviceEntriesToRows = (entries: ListManagementEntry[]): DeviceRow[] => {
  if (!Array.isArray(entries)) return [];

  return entries.map((entry) => {
    const row: Partial<DeviceRow> = { id: crypto.randomUUID() };

    DEVICE_COLUMNS.forEach((col) => {
      (row as Record<string, string>)[col.key] = (entry[col.apiKey] as string) ?? '';
    });

    return row as DeviceRow;
  });
};

const createEmptyDeviceEntry = (): ListManagementEntry => {
  const entry: ListManagementEntry = {};
  DEVICE_FIELDS.forEach((field) => {
    entry[field] = '';
  });
  entry.sophomorixRole = 'classroom-studentcomputer';
  entry.pxeFlag = '0';
  return entry;
};

const deviceRowsToEntries = (rows: DeviceRow[], originalEntries: ListManagementEntry[]): ListManagementEntry[] =>
  rows.map((row, index) => {
    const base: ListManagementEntry =
      index < originalEntries.length ? { ...originalEntries[index] } : createEmptyDeviceEntry();

    DEVICE_COLUMNS.forEach((col) => {
      base[col.apiKey] = (row as unknown as Record<string, string>)[col.key] ?? null;
    });

    return base;
  });

const deviceEntriesToCsv = (entries: ListManagementEntry[]): string =>
  entries.map((entry) => DEVICE_FIELDS.map((field) => entry[field] ?? '').join(';')).join('\n');

const csvToDeviceEntries = (csv: string): ListManagementEntry[] =>
  csv
    .split('\n')
    .filter((line) => line.trim().length > 0 && !line.trimStart().startsWith('#'))
    .map((line) => {
      const values = line.split(';');
      const entry: ListManagementEntry = {};
      DEVICE_FIELDS.forEach((field, index) => {
        entry[field] = values[index] ?? null;
      });
      return entry;
    });

export { deviceEntriesToRows, deviceRowsToEntries, createEmptyDeviceEntry, deviceEntriesToCsv, csvToDeviceEntries };
