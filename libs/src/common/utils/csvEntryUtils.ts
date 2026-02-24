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
import type BaseColumnConfig from '@libs/common/types/baseColumnConfig';

const CSV_SEPARATOR = ';';
const COMMENT_PREFIX = '#';

const isCommentEntry = (entry: ListManagementEntry): boolean => {
  const values = Object.values(entry);
  if (values.length === 0) return false;
  const firstValue = values[0];
  return typeof firstValue === 'string' && firstValue.trimStart().startsWith(COMMENT_PREFIX);
};

const createEmptyEntry = (fields: readonly string[], defaults?: Record<string, string>): ListManagementEntry => {
  const entry: ListManagementEntry = {};
  fields.forEach((field) => {
    entry[field] = defaults?.[field] ?? null;
  });
  return entry;
};

const entriesToRows = <T extends { id: string }>(entries: ListManagementEntry[], columns: BaseColumnConfig[]): T[] => {
  if (!Array.isArray(entries)) return [];

  return entries.map((entry) => {
    const row: Record<string, string> = { id: crypto.randomUUID() };

    columns.forEach((col) => {
      row[col.key] = (entry[col.entryKey] as string) ?? '';
    });

    return row as T;
  });
};

const rowsToEntries = <T>(
  rows: T[],
  originalEntries: ListManagementEntry[],
  columns: BaseColumnConfig[],
  emptyEntryFactory: () => ListManagementEntry,
): ListManagementEntry[] =>
  rows.map((row, index) => {
    const base: ListManagementEntry =
      index < originalEntries.length ? { ...originalEntries[index] } : emptyEntryFactory();

    columns.forEach((col) => {
      base[col.entryKey] = (row as unknown as Record<string, string>)[col.key] ?? null;
    });

    return base;
  });

const entriesToCsvWithComments = (
  commentEntries: ListManagementEntry[],
  dataEntries: ListManagementEntry[],
  fields: readonly string[],
): string => {
  const commentLines = commentEntries.map((entry) => entry[fields[0]] ?? '');
  const dataLines = dataEntries.map((entry) => fields.map((field) => entry[field] ?? '').join(CSV_SEPARATOR));
  return [...commentLines, ...dataLines].join('\n');
};

const csvToEntriesWithComments = (
  csv: string,
  fields: readonly string[],
): { entries: ListManagementEntry[]; commentEntries: ListManagementEntry[] } => {
  const entries: ListManagementEntry[] = [];
  const commentEntries: ListManagementEntry[] = [];

  csv
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .forEach((line) => {
      if (line.trimStart().startsWith(COMMENT_PREFIX)) {
        const entry: ListManagementEntry = {};
        entry[fields[0]] = line;
        fields.slice(1).forEach((field) => {
          entry[field] = null;
        });
        commentEntries.push(entry);
      } else {
        const values = line.split(CSV_SEPARATOR);
        const entry: ListManagementEntry = {};
        fields.forEach((field, index) => {
          entry[field] = values[index] ?? null;
        });
        entries.push(entry);
      }
    });

  return { entries, commentEntries };
};

export {
  isCommentEntry,
  createEmptyEntry,
  entriesToRows,
  rowsToEntries,
  entriesToCsvWithComments,
  csvToEntriesWithComments,
};
