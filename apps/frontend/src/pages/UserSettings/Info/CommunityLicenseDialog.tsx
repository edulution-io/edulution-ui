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

import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/useUserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import useCommunityLicenseStore from './useCommunityLicenseStore';

const CommunityLicenseDialog: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useUserStore();
  const { checkForActiveUserLicense, close, isOpen, isLoading } = useCommunityLicenseStore();

  useEffect(() => {
    if (isAuthenticated) {
      void checkForActiveUserLicense();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const getDialogBody = () => (
    <div className="flex flex-col items-start space-y-3">
      <p className="mb-5 text-left">
        <Trans
          i18nKey="licensing.communityLicenseDialog.description"
          values={{ applicationName: APPLICATION_NAME }}
          components={{
            strong: <strong />,
          }}
        />
      </p>
      <div className="flex w-full justify-center shadow">
        <Button
          className="md:absolute md:bottom-4"
          variant="btn-collaboration"
          disabled={isLoading}
          size="lg"
          type="button"
          onClick={() => close()}
        >
          {t('common.close')}
        </Button>
      </div>
    </div>
  );

  return (
    <AdaptiveDialog
      desktopContentClassName="z-50 shadow-2xl border-[1px] border-muted"
      title={t('licensing.communityLicenseDialog.title')}
      isOpen={isOpen}
      handleOpenChange={() => close()}
      body={getDialogBody()}
    />
  );
};

export default CommunityLicenseDialog;
