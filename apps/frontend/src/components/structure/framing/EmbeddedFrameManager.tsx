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
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import useUserStore from '@/store/UserStore/UserStore';
import { toast } from 'sonner';
import UserAccountsToastContent from '@/components/ui/UserAccountsToastContent';

const EmbeddedFrameManager = () => {
  const { appConfigs } = useAppConfigsStore();
  const { loadedEmbeddedFrames, activeEmbeddedFrame } = useFrameStore();
  const { userAccounts, getUserAccounts } = useUserStore();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const appConfig = useMemo(
    () => appConfigs.find((appCfg) => appCfg.name === activeEmbeddedFrame),
    [appConfigs, activeEmbeddedFrame],
  );

  const foundUserAccounts = useMemo(() => {
    if (!appConfig) return [];
    return userAccounts.filter((u) => u.appName === appConfig.name);
  }, [appConfig, loadedEmbeddedFrames, userAccounts]);

  const toastId = `${appConfig?.name}-embedded-login-toast`;

  useEffect(() => {
    setIsCollapsed(true);
    toast.dismiss(toastId);
  }, [toastId]);

  useEffect(() => {
    void getUserAccounts();
  }, []);

  useEffect(() => {
    if (!activeEmbeddedFrame) return;

    if (!appConfig) return;

    const isOpen = activeEmbeddedFrame === appConfig.name;

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
  }, [activeEmbeddedFrame, appConfig, foundUserAccounts, isCollapsed]);

  return appConfigs
    .filter((appCfg) => appCfg.appType === APP_INTEGRATION_VARIANT.FRAMED)
    .map((appCfg) => {
      const isOpen = activeEmbeddedFrame === appCfg.name;
      const url = loadedEmbeddedFrames.includes(appCfg.name) ? appCfg.options.url : undefined;

      return (
        <iframe
          key={appCfg.name}
          title={appCfg.name}
          className={`absolute inset-y-0 left-0 ml-0 mr-14 w-full md:w-[calc(100%-var(--sidebar-width))] ${isOpen ? 'block' : 'hidden'}`}
          height="100%"
          src={url}
        />
      );
    });
};

export default EmbeddedFrameManager;
