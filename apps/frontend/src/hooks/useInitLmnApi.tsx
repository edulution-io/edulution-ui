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

import { useEffect } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/useUserStore';
import useLdapGroups from './useLdapGroups';
import useDeploymentTarget from './useDeploymentTarget';

const useInitLmnApi = () => {
  const { isLmn } = useDeploymentTarget();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { isSuperAdmin } = useLdapGroups();
  const { lmnApiToken, setLmnApiToken, getOwnUser, getLmnVersion } = useLmnApiStore();

  useEffect(() => {
    if (!isLmn || !isAuthenticated) return;

    if (!lmnApiToken) {
      void setLmnApiToken();
    } else {
      void getOwnUser();
      if (isSuperAdmin) {
        void getLmnVersion(true);
      }
    }
  }, [isLmn, isAuthenticated, lmnApiToken, setLmnApiToken, getOwnUser, getLmnVersion, isSuperAdmin]);
};

export default useInitLmnApi;
