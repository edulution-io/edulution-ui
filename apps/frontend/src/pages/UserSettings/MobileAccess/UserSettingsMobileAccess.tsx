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
import useUserStore from '@/store/UserStore/UserStore';
import { MdOutlineFileDownload } from 'react-icons/md';
import { NavLink } from 'react-router-dom';
import useMedia from '@/hooks/useMedia';
import { EDU_APP_APPSTORE_URL } from '@libs/common/constants';
import { MobileDevicesIcon } from '@/assets/icons';
import ConnectionSetupPhonePreview from '@/pages/UserSettings/MobileAccess/ConnectionSetupPhonePreview';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import Separator from '@/components/ui/Separator';
import PageLayout from '@/components/structure/layout/PageLayout';
import EDU_API_BASE_URL from '@libs/common/constants/eduApiBaseUrl';

const MobileFileAccessSetupBox: React.FC = () => {
  const { isMobileView } = useMedia();
  const { user } = useUserStore();

  const webdavAccessDetails = {
    displayName: `${window.document.title}`,
    url: `${EDU_API_BASE_URL}/webdav`,
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
      <AccordionSH
        type="multiple"
        defaultValue={['mails', 'accessManual', 'accessWithQrCode']}
      >
        <AccordionItem value="mails">
          <AccordionTrigger className="flex text-h4">
            <h4>{t('dashboard.mobileAccess.downloadApp')}</h4>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            <div className="mt-2 flex flex-col items-center justify-center gap-4">
              {!isMobileView && <QRCodeDisplay value={EDU_APP_APPSTORE_URL} />}

              <NavLink
                to={EDU_APP_APPSTORE_URL}
                target="_blank"
                className="flex flex-col items-center"
              >
                <MdOutlineFileDownload className="text-xl text-background" />
                <span className="text-sm text-blue-400">{t('common.download')}</span>
              </NavLink>
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator className="my-1 bg-muted" />
        <AccordionItem value="accessWithQrCode">
          <AccordionTrigger className="flex text-h4">
            <h4>{t('dashboard.mobileAccess.setupWithQrCode')}</h4>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            <p className="text-sm text-muted-foreground">{t('dashboard.mobileAccess.scanAccessInfo')}</p>
            <div className="space-y-2 p-4 shadow">
              <div className="mt-2 flex justify-center">
                <QRCodeDisplay value={webdavAccessJson} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator className="my-1 bg-muted" />
        <AccordionItem value="accessManual">
          <AccordionTrigger className="flex text-h4">
            <h4>{t('dashboard.mobileAccess.manualSetup')}</h4>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            <p className="text-sm text-muted-foreground">{t('dashboard.mobileAccess.manualAccessInfo')}</p>
            <div className="mt-2 flex justify-center">
              <ConnectionSetupPhonePreview
                username={webdavAccessDetails.username || ''}
                schoolname={webdavAccessDetails.displayName}
                schoolurl={webdavAccessDetails.url}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </AccordionSH>
    </PageLayout>
  );
};

export default MobileFileAccessSetupBox;
