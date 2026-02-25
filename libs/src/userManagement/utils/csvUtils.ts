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
import {
  isCommentEntry,
  createEmptyEntry as createEmptyEntryBase,
  entriesToRows as entriesToRowsBase,
  rowsToEntries as rowsToEntriesBase,
  entriesToCsvWithComments as entriesToCsvWithCommentsBase,
  csvToEntriesWithComments as csvToEntriesWithCommentsBase,
} from '@libs/common/utils/csvEntryUtils';

const createEmptyEntry = (managementListType: ManagementListType): ListManagementEntry =>
  createEmptyEntryBase(LIST_MANAGEMENT_CSV_FIELDS[managementListType], LIST_MANAGEMENT_DEFAULTS[managementListType]);

const entriesToRows = (entries: ListManagementEntry[], managementList: ManagementListType): ListManagementRow[] =>
  entriesToRowsBase<ListManagementRow>(entries, LIST_MANAGEMENT_COLUMNS[managementList]);

const rowsToEntries = (
  rows: ListManagementRow[],
  originalEntries: ListManagementEntry[],
  managementListType: ManagementListType,
): ListManagementEntry[] =>
  rowsToEntriesBase(rows, originalEntries, LIST_MANAGEMENT_COLUMNS[managementListType], () =>
    createEmptyEntry(managementListType),
  );

const entriesToCsvWithComments = (
  commentEntries: ListManagementEntry[],
  dataEntries: ListManagementEntry[],
  managementList: ManagementListType,
): string => entriesToCsvWithCommentsBase(commentEntries, dataEntries, LIST_MANAGEMENT_CSV_FIELDS[managementList]);

const csvToEntriesWithComments = (
  csv: string,
  managementList: ManagementListType,
): { entries: ListManagementEntry[]; commentEntries: ListManagementEntry[] } =>
  csvToEntriesWithCommentsBase(csv, LIST_MANAGEMENT_CSV_FIELDS[managementList]);

export {
  isCommentEntry,
  createEmptyEntry,
  entriesToRows,
  rowsToEntries,
  entriesToCsvWithComments,
  csvToEntriesWithComments,
};
