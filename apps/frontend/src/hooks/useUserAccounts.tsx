/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
