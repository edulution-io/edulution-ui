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

const TEACHER_EXTRA_FIELDS = Array.from({ length: 20 }, (_, i) => `extra${String(i + 1).padStart(2, '0')}`);

const LIST_MANAGEMENT_CSV_FIELDS: Record<ManagementListType, string[]> = {
  [MANAGEMENT_LIST_TYPES.STUDENTS]: ['class', 'last_name', 'first_name', 'birthday', 'id'],
  [MANAGEMENT_LIST_TYPES.TEACHERS]: [
    'class',
    'last_name',
    'first_name',
    'birthday',
    'login',
    'password',
    'usertoken',
    'quota',
    'mailquota',
    'reserved',
    ...TEACHER_EXTRA_FIELDS,
  ],
  [MANAGEMENT_LIST_TYPES.PARENTS]: ['class', 'last_name', 'first_name', 'birthday', 'id', 'students_ref'],
  [MANAGEMENT_LIST_TYPES.EXTRASTUDENTS]: ['class', 'last_name', 'first_name', 'birthday', 'login', 'reserved'],
  [MANAGEMENT_LIST_TYPES.STAFF]: ['class', 'last_name', 'first_name', 'birthday', 'id'],
};

export default LIST_MANAGEMENT_CSV_FIELDS;
