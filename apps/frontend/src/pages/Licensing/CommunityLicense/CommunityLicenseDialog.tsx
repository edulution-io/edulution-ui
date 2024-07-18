import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Button } from '@/components/shared/Button';
import useUserStore from '@/store/UserStore/UserStore';
import useUsersLicenseStore from '@/pages/Licensing/CommunityLicense/useUsersLicenseStore';

interface CommunityLicenseDialogProps {
  trigger?: React.ReactNode;
}

const CommunityLicenseDialog = ({ trigger }: CommunityLicenseDialogProps) => {
  const { t } = useTranslation();
  const user = useUserStore();
  const { checkForActiveUserLicenses, close, isOpen, isLoading } = useUsersLicenseStore();

  useEffect(() => {
    void checkForActiveUserLicenses();
  }, []);

  const getDialogBody = () => (
    <div className="rounded-xl bg-ciLightRed p-4 text-black">
      <p>{t('licensing.communityLicenseDialog.description')}</p>
    </div>
  );

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={close}>
        <Button
          variant="btn-collaboration"
          disabled={isLoading}
          size="lg"
          type="submit"
          className="bg-ciRed"
        >
          {t('common.close')}
        </Button>
      </form>
    </div>
  );

  if (!user.isAuthenticated) {
    return null;
  }

  if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
  return (
    <AdaptiveDialog
      isOpen={isOpen}
      trigger={trigger}
      handleOpenChange={close}
      title={t('licensing.communityLicenseDialog.title')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CommunityLicenseDialog;
