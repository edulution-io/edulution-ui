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
import PageLayout from '@/components/structure/layout/PageLayout';
import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import { EDU_DOCS_URL } from '@libs/common/constants';
import { Button } from '@/components/shared/Button';
import { SectionAccordion, SettingsAccordionItem } from '@/components/ui/SectionAccordion';

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
      <SectionAccordion defaultOpenAll>
        {/* Setup Instructions */}
        <SettingsAccordionItem
          id="setup"
          label={t('usersettings.mobileAccess.setup')}
        >
          <div className="space-y-4">
            <p>{t('usersettings.mobileAccess.docsDescription')}</p>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="btn-infrastructure"
                size="lg"
                onClick={() => window.open(EDU_APP_SETUP_URL, '_blank', 'noopener,noreferrer')}
              >
                {t('usersettings.mobileAccess.button')}
              </Button>
            </div>
          </div>
        </SettingsAccordionItem>

        {/* QR Code */}
        <SettingsAccordionItem
          id="qrCode"
          label={t('usersettings.mobileAccess.qrCode')}
        >
          <div className="space-y-4">
            <p>{t('dashboard.mobileAccess.scanAccessInfo')}</p>
            <div className="flex justify-center">
              <QRCodeDisplay value={webdavAccessJson} />
            </div>
          </div>
        </SettingsAccordionItem>
      </SectionAccordion>
    </PageLayout>
  );
};

export default MobileFileAccessSetupBox;
