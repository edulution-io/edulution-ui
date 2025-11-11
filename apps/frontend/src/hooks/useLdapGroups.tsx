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

import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useUserStore from '@/store/UserStore/useUserStore';
import getTokenPayload from '@libs/common/utils/getTokenPayload';
import getIsAdmin from '@libs/user/utils/getIsAdmin';

const useLdapGroups = () => {
  const { isAuthenticated, eduApiToken } = useUserStore();
  const { globalSettings } = useGlobalSettingsApiStore();

  if (!isAuthenticated || !eduApiToken) {
    return {
      isSuperAdmin: false,
      ldapGroups: [],
      isAuthReady: false,
    };
  }

  const { adminGroups } = globalSettings.auth;
  const adminGroupsList = adminGroups.map((group) => group.path);
  const payload = getTokenPayload(eduApiToken);
  const ldapGroups = payload.ldapGroups ?? [];
  const isSuperAdmin = getIsAdmin(ldapGroups, adminGroupsList);

  return {
    isSuperAdmin,
    ldapGroups,
    isAuthReady: true,
  };
};

export default useLdapGroups;
