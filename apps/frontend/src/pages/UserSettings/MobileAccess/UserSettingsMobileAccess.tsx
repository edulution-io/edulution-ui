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
import { t } from 'i18next';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import useUserStore from '@/store/UserStore/UserStore';
import { MdArrowBackIosNew, MdArrowForwardIos, MdOutlineFileDownload } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import { NavLink } from 'react-router-dom';
import { IconContext } from 'react-icons';
import useIsMobileView from '@/hooks/useIsMobileView';
import { Card } from '@/components/shared/Card';
import { EDU_APP_APPSTORE_URL } from '@libs/common/constants';
import { MobileDevicesIcon } from '@/assets/icons';
import NativeAppHeader from '@/components/layout/NativeAppHeader';

const MobileFileAccessSetupBox: React.FC = () => {
  const isMobileView = useIsMobileView();
  const { user } = useUserStore();
  const [isStepOne, setIsStepOne] = useState(true);

  const webdavAccessDetails = {
    displayName: `${window.document.title}`,
    url: `${window.location.origin}/webdav`,
    username: user?.username,
    password: '', // or any other auth field
    token: '',
  };
  const webdavAccessJson = JSON.stringify(webdavAccessDetails);

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  const loginDataTable = () => (
    <>
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
    </>
  );

  const navToAppStoreButton = () => (
    <div className="flex items-center justify-center">
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

  const stepOneOrTwoContent = () => (
    <div className={`${isStepOne ? '' : 'min-w-[85%]'} relative text-background`}>
      <p className="flex justify-center">
        {t(isStepOne ? 'dashboard.mobileAccess.scanAppStoreLink' : 'dashboard.mobileAccess.scanAccessInfo')}
      </p>
      <div className="mt-4 justify-center">
        <QRCodeDisplay value={isStepOne ? EDU_APP_APPSTORE_URL : webdavAccessJson} />
      </div>
      <Button
        type="button"
        variant="btn-outline"
        onClick={() => setIsStepOne(!isStepOne)}
        className={`absolute top-1/2 text-background ${isStepOne ? 'right-0 mr-8' : 'left-0 ml-8'}`}
      >
        {isStepOne ? <MdArrowForwardIos /> : <MdArrowBackIosNew />}
      </Button>

      {isStepOne ? (
        <>
          <p className="my-4">{t('dashboard.mobileAccess.downloadDirect')}</p>
          {navToAppStoreButton()}
          <p className="mt-4">{t('dashboard.mobileAccess.nextStepPreview')}</p>
        </>
      ) : (
        loginDataTable()
      )}
    </div>
  );

  const mobileSheetContent = () => (
    <div className="text-background">
      <p className="my-4">{t('dashboard.mobileAccess.downloadApp')}</p>
      {navToAppStoreButton()}
      <p className="mt-4">{t('dashboard.mobileAccess.accessData')}:</p>
      {loginDataTable()}
    </div>
  );

  return (
    <>
      <NativeAppHeader
        title={t('usersettings.mobileAccess.title')}
        description={t('usersettings.mobileAccess.description')}
        iconSrc={MobileDevicesIcon}
      />
      <div className="rounded border bg-transparent p-4 shadow">
        {isMobileView ? mobileSheetContent() : stepOneOrTwoContent()}
      </div>
    </>
  );
};

export default MobileFileAccessSetupBox;
