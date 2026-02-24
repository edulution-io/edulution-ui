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

import MANAGEMENT_LIST_TYPES, { ManagementListType } from '@libs/userManagement/constants/managementListTypes';
import LIST_MANAGEMENT_CSV_FIELDS from '@libs/userManagement/constants/listManagementCsvFields';

const CSV_SEPARATOR = ';';

type ParsedCheckError = {
  filename: string;
  listType: ManagementListType | null;
  fields: Record<string, string>;
};

const LIST_TYPE_VALUES = Object.values(MANAGEMENT_LIST_TYPES);

const parseCheckErrorKey = (key: string): ParsedCheckError => {
  const colonIndex = key.indexOf(':');
  const filename = colonIndex >= 0 ? key.substring(0, colonIndex) : key;
  const csvData = colonIndex >= 0 ? key.substring(colonIndex + 1) : '';

  const listType = LIST_TYPE_VALUES.find((type) => filename.includes(type)) ?? null;
  const csvValues = csvData.split(CSV_SEPARATOR);
  const fieldNames = listType ? LIST_MANAGEMENT_CSV_FIELDS[listType] : [];

  const fields: Record<string, string> = {};
  fieldNames.forEach((name, index) => {
    if (index < csvValues.length) {
      fields[name] = csvValues[index];
    }
  });

  return { filename, listType, fields };
};

export type { ParsedCheckError };
export default parseCheckErrorKey;
