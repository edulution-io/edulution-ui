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
import useEduApiStore from '@/store/EduApiStore/useEduApiStore';
import useSentryStore from '@/store/useSentryStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useLogout from '@/hooks/useLogout';

const useInitialAppData = (isAuthenticated: boolean) => {
  const { getAppConfigs, getPublicAppConfigs } = useAppConfigsStore();
  const { getGlobalSettings } = useGlobalSettingsApiStore();
  const { getIsEduApiHealthy } = useEduApiStore();
  const { fetchWebdavShares } = useFileSharingStore();
  const fetchAndInitSentry = useSentryStore((s) => s.fetchAndInitSentry);

  const handleLogout = useLogout();

  useEffect(() => {
    void getPublicAppConfigs();
  }, []);

  useEffect(() => {
    const getInitialAppData = async () => {
      const isApiResponding = await getIsEduApiHealthy();
      if (isApiResponding) {
        void getGlobalSettings();
        void getAppConfigs();
        void fetchWebdavShares();
        void fetchAndInitSentry();
      } else {
        void handleLogout();
      }
    };

    if (isAuthenticated) {
      void getInitialAppData();
    }
  }, [
    isAuthenticated,
    getIsEduApiHealthy,
    getGlobalSettings,
    getAppConfigs,
    fetchWebdavShares,
    fetchAndInitSentry,
    handleLogout,
  ]);
};

export default useInitialAppData;
