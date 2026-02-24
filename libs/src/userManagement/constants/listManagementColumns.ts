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
import type ColumnConfig from '@libs/userManagement/types/columnConfig';

const LIST_MANAGEMENT_COLUMNS: Record<ManagementListType, ColumnConfig[]> = {
  [MANAGEMENT_LIST_TYPES.STUDENTS]: [
    { key: 'class', entryKey: 'class', translationKey: 'usermanagement.list.class' },
    { key: 'lastName', entryKey: 'last_name', translationKey: 'usermanagement.list.lastName' },
    { key: 'firstName', entryKey: 'first_name', translationKey: 'usermanagement.list.firstName' },
    { key: 'birthday', entryKey: 'birthday', translationKey: 'usermanagement.list.birthday' },
  ],
  [MANAGEMENT_LIST_TYPES.PARENTS]: [
    { key: 'lastName', entryKey: 'last_name', translationKey: 'usermanagement.list.lastName' },
    { key: 'firstName', entryKey: 'first_name', translationKey: 'usermanagement.list.firstName' },
  ],
  [MANAGEMENT_LIST_TYPES.TEACHERS]: [
    { key: 'lastName', entryKey: 'last_name', translationKey: 'usermanagement.list.lastName' },
    { key: 'firstName', entryKey: 'first_name', translationKey: 'usermanagement.list.firstName' },
    { key: 'birthday', entryKey: 'birthday', translationKey: 'usermanagement.list.birthday' },
    { key: 'login', entryKey: 'login', translationKey: 'usermanagement.list.login' },
  ],
  [MANAGEMENT_LIST_TYPES.EXTRASTUDENTS]: [
    { key: 'class', entryKey: 'class', translationKey: 'usermanagement.list.class' },
    { key: 'lastName', entryKey: 'last_name', translationKey: 'usermanagement.list.lastName' },
    { key: 'firstName', entryKey: 'first_name', translationKey: 'usermanagement.list.firstName' },
    { key: 'birthday', entryKey: 'birthday', translationKey: 'usermanagement.list.birthday' },
    { key: 'login', entryKey: 'login', translationKey: 'usermanagement.list.login' },
  ],
  [MANAGEMENT_LIST_TYPES.STAFF]: [
    { key: 'category', entryKey: 'class', translationKey: 'usermanagement.list.category' },
    { key: 'lastName', entryKey: 'last_name', translationKey: 'usermanagement.list.lastName' },
    { key: 'firstName', entryKey: 'first_name', translationKey: 'usermanagement.list.firstName' },
  ],
};

export default LIST_MANAGEMENT_COLUMNS;
