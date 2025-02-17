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

import React from 'react';
import { MobileDevicesIcon } from '@/assets/icons';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { useTranslation } from 'react-i18next';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import { EDU_APP_APPSTORE_URL } from '@libs/common/constants';
import { Card } from '@/components/shared/Card';
import useUserStore from '@/store/UserStore/UserStore';

const UserSettingsMobileAccess: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();

  const webdavAccessDetails = {
    displayName: window.document.title,
    url: `${window.location.origin}/webdav`,
    username: user?.username,
    password: '',
    token: '',
  };
  const webdavAccessJson = JSON.stringify(webdavAccessDetails);

  return (
    <>
      <NativeAppHeader
        title={t('usersettings.mobileAccess.title')}
        description={t('usersettings.mobileAccess.description')}
        iconSrc={MobileDevicesIcon}
      />
      <div className="p-4 text-background">
        <h2 className="mb-4 text-xl font-bold">{t('dashboard.mobileAccess.title')}</h2>

        <div className="flex flex-col space-y-8 md:flex-row md:items-start md:space-x-8 md:space-y-0">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold">{t('dashboard.mobileAccess.downloadApp')}</h3>
            <div className="bg-muted">
              <QRCodeDisplay value={EDU_APP_APPSTORE_URL} />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold">{t('dashboard.mobileAccess.accessData')}</h3>
            <div className="bg-muted">
              <QRCodeDisplay value={webdavAccessJson} />
            </div>
          </div>
        </div>

        {/* Login data display */}
        <div className="mt-8">
          <p className="mb-2">{t('dashboard.mobileAccess.copyCredentials')}</p>
          <Card variant="text">
            <pre className="m-2">{`${t('form.url')}: ${webdavAccessDetails.url}`}</pre>
            <pre className="m-2">{`${t('common.username')}: ${webdavAccessDetails.username}`}</pre>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserSettingsMobileAccess;
