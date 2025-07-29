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
import { Trans, useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/useUserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LinkText from '@/components/ui/LinkText';
import { Button } from '@/components/shared/Button';
import COMMUNITY_URL from '@libs/common/constants/communityLink';
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

  const urlObject = new URL(COMMUNITY_URL);
  const rootUrl = `${urlObject.protocol}//${urlObject.hostname}`;

  const getDialogBody = () => (
    <div className="flex flex-col items-start">
      <p className="mb-5 text-left">
        <Trans
          i18nKey="licensing.communityLicenseDialog.description"
          values={{ link: rootUrl, applicationName: APPLICATION_NAME }}
          components={{
            link1: (
              <LinkText
                to={COMMUNITY_URL}
                title={rootUrl}
              />
            ),
            strong: <strong />,
            br: <br />,
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
