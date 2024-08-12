import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/UserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import useCommunityLicenseStore from './useCommunityLicenseStore';

interface CommunityLicenseDialogProps {
  trigger?: React.ReactNode;
}

const CommunityLicenseDialog: React.FC<CommunityLicenseDialogProps> = ({ trigger }: CommunityLicenseDialogProps) => {
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
    <div className="flex flex-col items-center space-y-4">
      <p>{t('licensing.communityLicenseDialog.description')}</p>
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
  );

  return (
    <AdaptiveDialog
      title={t('licensing.communityLicenseDialog.title')}
      isOpen={isOpen}
      trigger={trigger}
      handleOpenChange={() => close()}
      body={getDialogBody()}
    />
  );
};

export default CommunityLicenseDialog;
