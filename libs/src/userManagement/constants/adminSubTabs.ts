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

import type UserType from '@libs/userManagement/types/userType';
import type AdminSubTab from '@libs/userManagement/types/adminSubTab';
import USER_TYPES from './userTypes';
import USER_MANAGEMENT_TABS from './userManagementTabs';

const ADMIN_SUB_TABS: Partial<Record<UserType, AdminSubTab[]>> = {
  [USER_TYPES.SCHOOLADMINS]: [
    {
      id: USER_MANAGEMENT_TABS.SCHOOLADMINS,
      nameKey: 'usermanagement.schooladmins',
      subUserType: USER_TYPES.SCHOOLADMINS,
    },
    {
      id: USER_MANAGEMENT_TABS.SCHOOLBINDUSERS,
      nameKey: 'usermanagement.schoolbindusers',
      subUserType: USER_TYPES.SCHOOLBINDUSERS,
    },
  ],
  [USER_TYPES.GLOBALADMINS]: [
    {
      id: USER_MANAGEMENT_TABS.GLOBALADMINS,
      nameKey: 'usermanagement.globaladmins',
      subUserType: USER_TYPES.GLOBALADMINS,
    },
    {
      id: USER_MANAGEMENT_TABS.GLOBALBINDUSERS,
      nameKey: 'usermanagement.globalbindusers',
      subUserType: USER_TYPES.GLOBALBINDUSERS,
    },
  ],
};

export default ADMIN_SUB_TABS;
