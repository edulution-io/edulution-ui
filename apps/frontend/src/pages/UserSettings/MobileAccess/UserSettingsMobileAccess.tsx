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

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBackIosNew, MdArrowForwardIos, MdOutlineFileDownload } from 'react-icons/md';
import { IconContext } from 'react-icons';
import { NavLink } from 'react-router-dom';

import { MobileDevicesIcon } from '@/assets/icons';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import useUserStore from '@/store/UserStore/UserStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import { EDU_APP_APPSTORE_URL } from '@libs/common/constants';

const UserSettingsMobileAccess: React.FC = () => {
  const { t } = useTranslation();
  const isMobileView = useIsMobileView();
  const { user } = useUserStore();
  const isMobile = useIsMobileView();
  const [isStepOne, setIsStepOne] = useState(true);

  const webdavAccessDetails = {
    displayName: document.title,
    url: `${window.location.origin}/webdav`,
    username: user?.username,
    password: '',
    token: '',
  };
  const webdavAccessJson = JSON.stringify(webdavAccessDetails);

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  const navToAppStoreButton = () => (
    <div className="mt-4 flex items-center justify-center">
      <Button
        variant="btn-outline"
        className="flex items-center justify-center"
      >
        <NavLink
          to={EDU_APP_APPSTORE_URL}
          target="_blank"
          className="flex flex-col items-center"
        >
          <IconContext.Provider value={iconContextValue}>
            <MdOutlineFileDownload className="text-background" />
          </IconContext.Provider>
        </NavLink>
      </Button>
    </div>
  );

  const loginDataTable = () => (
    <div className="mt-4">
      {!isMobileView && <p className="mt-4">{t('dashboard.mobileAccess.copyCredentials')}</p>}
      <div className="mt-4 overflow-auto">
        {t('form.url')}:
        <Card variant="text">
          <pre className="m-2 text-background">{webdavAccessDetails.url}</pre>
        </Card>
        {t('common.username')}:
        <Card variant="text">
          <pre className="m-2 text-background">{user?.username}</pre>
        </Card>
      </div>
    </div>
  );

  const stepContent = () => (
    <div className="relative w-full text-background">
      <h3 className="mb-2 text-xl font-bold">
        {isStepOne ? t('usersettings.mobileAccess.stepOneTitle') : t('usersettings.mobileAccess.stepTwoTitle')}
      </h3>

      <p className="flex justify-center">
        {t(isStepOne ? 'dashboard.mobileAccess.scanAppStoreLink' : 'dashboard.mobileAccess.scanAccessInfo')}
      </p>

      <div className="mt-4 flex justify-center">
        <QRCodeDisplay
          value={isStepOne ? EDU_APP_APPSTORE_URL : webdavAccessJson}
          size={isMobile ? 'md' : 'lg'}
        />
      </div>

      <Button
        type="button"
        variant="btn-outline"
        onClick={() => setIsStepOne(!isStepOne)}
        className={`absolute top-1/2 -translate-y-1/2 text-background
          ${isStepOne ? 'right-0 mr-4' : 'left-0 ml-4'}
        `}
      >
        {isStepOne ? <MdArrowForwardIos /> : <MdArrowBackIosNew />}
      </Button>

      {isStepOne ? <div className="mt-2 flex justify-center">{navToAppStoreButton()}</div> : loginDataTable()}
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-foreground text-background">
      <NativeAppHeader
        title={t('usersettings.mobileAccess.title')}
        description={t('usersettings.mobileAccess.description')}
        iconSrc={MobileDevicesIcon}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-4 text-xl font-bold">{t('dashboard.mobileAccess.title')}</h2>
        <div className="w-full">{stepContent()}</div>
      </div>
    </div>
  );
};

export default UserSettingsMobileAccess;
