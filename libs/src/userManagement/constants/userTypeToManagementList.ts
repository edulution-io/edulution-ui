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

import MANAGEMENT_LIST_TYPES from '@libs/userManagement/constants/managementListTypes';
import type { ManagementListType } from '@libs/userManagement/constants/managementListTypes';
import USER_TYPES from './userTypes';

const USER_TYPE_TO_MANAGEMENT_LIST: Record<string, ManagementListType | null> = {
  [USER_TYPES.STUDENTS]: MANAGEMENT_LIST_TYPES.STUDENTS,
  [USER_TYPES.TEACHERS]: MANAGEMENT_LIST_TYPES.TEACHERS,
  [USER_TYPES.EXTRASTUDENTS]: MANAGEMENT_LIST_TYPES.EXTRASTUDENTS,
  [USER_TYPES.PARENTS]: MANAGEMENT_LIST_TYPES.PARENTS,
  [USER_TYPES.STAFF]: MANAGEMENT_LIST_TYPES.STAFF,
  [USER_TYPES.SCHOOLADMINS]: null,
  [USER_TYPES.SCHOOLBINDUSERS]: null,
  [USER_TYPES.GLOBALADMINS]: null,
  [USER_TYPES.GLOBALBINDUSERS]: null,
};

export default USER_TYPE_TO_MANAGEMENT_LIST;
