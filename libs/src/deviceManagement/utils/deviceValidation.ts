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

import type { DeviceColumnKey } from '@libs/deviceManagement/types/deviceColumnConfig';
import type DeviceRow from '@libs/deviceManagement/types/deviceRow';

const HOST_REGEX = /^[a-zA-Z0-9-]+$/;
const MAX_HOST_LENGTH = 15;
const GROUP_REGEX = /^[a-zA-Z0-9+\-_]+$/i;
const MAC_ADDRESS_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
const IP_ADDRESS_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

const isValidHost = (value: string): boolean => HOST_REGEX.test(value) && value.length <= MAX_HOST_LENGTH;

const isValidGroup = (value: string): boolean => GROUP_REGEX.test(value);

const isValidMacAddress = (value: string): boolean => MAC_ADDRESS_REGEX.test(value);

const isValidIpAddress = (value: string): boolean => {
  const match = IP_ADDRESS_REGEX.exec(value);
  if (!match) return false;
  return match.slice(1).every((octet) => {
    const num = Number(octet);
    return num >= 0 && num <= 255;
  });
};

const DROPDOWN_KEYS: Set<DeviceColumnKey> = new Set(['sophomorixRole', 'pxeFlag']);

const validateDeviceCell = (columnKey: DeviceColumnKey, value: string): boolean => {
  if (DROPDOWN_KEYS.has(columnKey)) return true;
  if (!value) return false;
  if (columnKey === 'room' || columnKey === 'hostname') return isValidHost(value);
  if (columnKey === 'group') return isValidGroup(value);
  if (columnKey === 'mac') return isValidMacAddress(value);
  if (columnKey === 'ip') return isValidIpAddress(value);
  return true;
};

const UNIQUE_KEYS: DeviceColumnKey[] = ['hostname', 'mac', 'ip'];

const findDuplicates = (rows: DeviceRow[], deletedRowIds: Set<string>): Set<string> => {
  const duplicates = new Set<string>();

  UNIQUE_KEYS.forEach((key) => {
    const seen = new Map<string, string>();
    rows.forEach((row) => {
      if (deletedRowIds.has(row.id)) return;
      const value = row[key]?.toLowerCase().trim();
      if (!value) return;
      const existingId = seen.get(value);
      if (existingId) {
        duplicates.add(`${existingId}-${key}`);
        duplicates.add(`${row.id}-${key}`);
      } else {
        seen.set(value, row.id);
      }
    });
  });

  return duplicates;
};

const validateDeviceRows = (rows: DeviceRow[], deletedRowIds: Set<string>): boolean => {
  const hasDuplicates = findDuplicates(rows, deletedRowIds).size > 0;
  if (hasDuplicates) return false;

  return rows.every((row) => {
    if (deletedRowIds.has(row.id)) return true;
    return (
      validateDeviceCell('room', row.room) &&
      validateDeviceCell('hostname', row.hostname) &&
      validateDeviceCell('group', row.group) &&
      validateDeviceCell('mac', row.mac) &&
      validateDeviceCell('ip', row.ip)
    );
  });
};

export { validateDeviceCell, validateDeviceRows, findDuplicates, isValidMacAddress, isValidIpAddress };
