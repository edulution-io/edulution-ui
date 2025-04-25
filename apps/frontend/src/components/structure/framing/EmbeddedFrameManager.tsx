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

import React, { useEffect } from 'react';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import useUserStore from '@/store/UserStore/UserStore';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import copyToClipboard from '@/utils/copyToClipboard';
import UserAccountDto from '@libs/user/types/userAccount.dto';
import Input from '@/components/shared/Input';

const EmbeddedFrameManager = () => {
  const { appConfigs } = useAppConfigsStore();
  const { loadedEmbeddedFrames, activeEmbeddedFrame } = useFrameStore();
  const { userAccounts, getUserAccounts } = useUserStore();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    void getUserAccounts();
  }, []);

  useEffect(() => {
    toast.dismiss('embedded-login-toast');
  }, [location]);

  const getToastContent = (foundUserAccounts: UserAccountDto[]) => (
    <>
      <p className="mb-2">{t('common.loginDetails')}</p>
      <div className="space-y-4">
        {foundUserAccounts.map((userAccount) => (
          <div
            key={userAccount.accountId}
            className="flex flex-col gap-2"
          >
            <Input
              title={t('common.username')}
              type="text"
              value={userAccount.accountUser}
              readOnly
              className="cursor-pointer"
              onClick={() => copyToClipboard(userAccount.accountUser)}
            />
            <Input
              title={t('common.password')}
              type="password"
              value={userAccount.accountPassword}
              readOnly
              className="cursor-pointer"
              onClick={() => copyToClipboard(userAccount.accountPassword)}
            />
          </div>
        ))}
      </div>
    </>
  );

  return appConfigs
    .filter((appConfig) => appConfig.appType === APP_INTEGRATION_VARIANT.EMBEDDED)
    .map((appConfig) => {
      const isOpen = activeEmbeddedFrame === appConfig.name;
      const url = loadedEmbeddedFrames.includes(appConfig.name) ? appConfig.options.url : undefined;

      const foundUserAccounts = userAccounts.filter((acc) => acc.accountUrl === url);

      if (isOpen && foundUserAccounts.length > 0 && foundUserAccounts[0].accountUrl) {
        toast(() => getToastContent(foundUserAccounts), {
          id: 'embedded-login-toast',
          duration: 10000,
        });
      }

      return (
        <iframe
          key={appConfig.name}
          title={appConfig.name}
          className={`absolute inset-y-0 left-0 ml-0 mr-14 w-full md:w-[calc(100%-var(--sidebar-width))] ${isOpen ? 'block' : 'hidden'}`}
          height="100%"
          src={url}
        />
      );
    });
};

export default EmbeddedFrameManager;
