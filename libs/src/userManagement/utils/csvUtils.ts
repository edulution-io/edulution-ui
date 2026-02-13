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

import type { ManagementListType } from '@libs/userManagement/constants/managementListTypes';
import type ListManagementRow from '@libs/userManagement/types/listManagementRow';
import type ListManagementEntry from '@libs/userManagement/types/listManagementEntry';
import LIST_MANAGEMENT_COLUMNS from '@libs/userManagement/constants/listManagementColumns';
import LIST_MANAGEMENT_CSV_FIELDS from '@libs/userManagement/constants/listManagementCsvFields';
import LIST_MANAGEMENT_DEFAULTS from '@libs/userManagement/constants/listManagementDefaults';

const entriesToRows = (entries: ListManagementEntry[], managementList: ManagementListType): ListManagementRow[] => {
  if (!Array.isArray(entries)) return [];
  const columns = LIST_MANAGEMENT_COLUMNS[managementList];

  return entries.map((entry) => {
    const row: Partial<ListManagementRow> = { id: crypto.randomUUID() };

    columns.forEach((col) => {
      (row as Record<string, string>)[col.key] = entry[col.apiKey] ?? '';
    });

    return row as ListManagementRow;
  });
};

const createEmptyEntry = (managementListType: ManagementListType): ListManagementEntry => {
  const fields = LIST_MANAGEMENT_CSV_FIELDS[managementListType];
  const defaults = LIST_MANAGEMENT_DEFAULTS[managementListType];
  const entry: ListManagementEntry = {};
  fields.forEach((field) => {
    entry[field] = defaults?.[field] ?? null;
  });
  return entry;
};

const rowsToEntries = (
  rows: ListManagementRow[],
  originalEntries: ListManagementEntry[],
  managementListType: ManagementListType,
): ListManagementEntry[] => {
  const columns = LIST_MANAGEMENT_COLUMNS[managementListType];

  return rows.map((row, index) => {
    const base: ListManagementEntry =
      index < originalEntries.length ? { ...originalEntries[index] } : createEmptyEntry(managementListType);

    columns.forEach((col) => {
      base[col.apiKey] = (row as unknown as Record<string, string>)[col.key] ?? null;
    });

    return base;
  });
};

const entriesToCsv = (entries: ListManagementEntry[], managementList: ManagementListType): string => {
  const fields = LIST_MANAGEMENT_CSV_FIELDS[managementList];

  return entries.map((entry) => fields.map((field) => entry[field] ?? '').join(';')).join('\n');
};

const csvToEntries = (csv: string, managementList: ManagementListType): ListManagementEntry[] => {
  const fields = LIST_MANAGEMENT_CSV_FIELDS[managementList];
  return csv
    .split('\n')
    .filter((line) => line.trim().length > 0 && !line.trimStart().startsWith('#'))
    .map((line) => {
      const values = line.split(';');
      const entry: ListManagementEntry = {};
      fields.forEach((field, index) => {
        entry[field] = values[index] ?? null;
      });
      return entry;
    });
};

export { createEmptyEntry, entriesToRows, rowsToEntries, entriesToCsv, csvToEntries };
