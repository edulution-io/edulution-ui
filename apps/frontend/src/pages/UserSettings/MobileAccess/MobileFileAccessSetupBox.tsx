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
        <h2>{t('dashboard.mobileAccess.setupWithQrCode')}</h2>
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
