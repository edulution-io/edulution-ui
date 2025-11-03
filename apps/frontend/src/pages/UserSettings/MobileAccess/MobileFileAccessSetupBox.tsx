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
import { t } from 'i18next';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import useUserStore from '@/store/UserStore/useUserStore';
import { MobileDevicesIcon } from '@/assets/icons';
import Separator from '@/components/ui/Separator';
import PageLayout from '@/components/structure/layout/PageLayout';
import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import { EDU_DOCS_URL } from '@libs/common/constants';
import { Button } from '@/components/shared/Button';

const EDU_APP_SETUP_URL = `${EDU_DOCS_URL}/docs/edulution-app/setup`;

const MobileFileAccessSetupBox: React.FC = () => {
  const { user } = useUserStore();

  const webdavAccessDetails = {
    displayName: APPLICATION_NAME,
    url: EDU_BASE_URL,
    username: user?.username,
    password: '',
    token: '',
  };
  const webdavAccessJson = JSON.stringify(webdavAccessDetails);

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('usersettings.mobileAccess.title'),
        description: t('usersettings.mobileAccess.description'),
        iconSrc: MobileDevicesIcon,
      }}
    >
      <div className="space-y-2">
        <h3>{t('dashboard.mobileAccess.setupWithQrCode')}</h3>
        <p>{t('usersettings.mobileAccess.docsDescription')}</p>
        <Button
          type="button"
          variant="btn-infrastructure"
          size="lg"
          onClick={() => window.open(EDU_APP_SETUP_URL, '_blank', 'noopener,noreferrer')}
        >
          {t('usersettings.mobileAccess.button')}
        </Button>
        <Separator className="my-1 bg-muted" />
        <p>{t('dashboard.mobileAccess.scanAccessInfo')}</p>
        <div className="space-y-2 p-4 shadow">
          <div className="mt-2 flex justify-center">
            <QRCodeDisplay value={webdavAccessJson} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MobileFileAccessSetupBox;
