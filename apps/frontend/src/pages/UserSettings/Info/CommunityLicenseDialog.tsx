import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/UserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LinkText from '@/components/ui/LinkText';
import { Button } from '@/components/shared/Button';
import COMMUNITY_URL from '@libs/common/constants/communityLink';
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
          values={{ link: rootUrl }}
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
      <div className="flex w-full justify-center">
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
      title={t('licensing.communityLicenseDialog.title')}
      isOpen={isOpen}
      handleOpenChange={() => close()}
      body={getDialogBody()}
    />
  );
};

export default CommunityLicenseDialog;
