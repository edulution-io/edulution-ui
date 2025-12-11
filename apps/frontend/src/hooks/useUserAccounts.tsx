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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import useUserStore from '@/store/UserStore/useUserStore';
import UserAccountsToastContent from '@/components/ui/UserAccountsToastContent';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import ROOT_ROUTE from '@libs/common/constants/rootRoute';

const useUserAccounts = (appName: string | null) => {
  const { appConfigs } = useAppConfigsStore();
  const { userAccounts, getUserAccounts } = useUserStore();
  const { pathname } = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const appConfig = useMemo(() => appConfigs.find((appCfg) => appCfg.name === appName), [appConfigs, appName]);

  const foundUserAccounts = useMemo(() => {
    if (!appConfig) return [];
    return userAccounts.filter((u) => u.appName === appConfig.name);
  }, [appConfig, appName, userAccounts]);

  const toastId = `${appConfig?.name}-embedded-login-toast`;

  useEffect(() => {
    setIsCollapsed(false);
    toast.dismiss(toastId);
  }, [pathname, toastId]);

  useEffect(() => {
    if (!userAccounts || userAccounts.length === 0) {
      void getUserAccounts();
    }
    return () => {
      toast.dismiss(toastId);
    };
  }, []);

  useEffect(() => {
    if (!appName || appName === ROOT_ROUTE) return;

    if (!appConfig) return;

    const isOpen = appName === appConfig.name;

    if (isOpen && foundUserAccounts.length > 0) {
      toast(
        () => (
          <UserAccountsToastContent
            userAccounts={foundUserAccounts}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
          />
        ),
        {
          id: toastId,
          duration: 30000,
          position: 'top-right',
        },
      );
    }
  }, [appName, appConfig, foundUserAccounts, isCollapsed]);
};

export default useUserAccounts;
