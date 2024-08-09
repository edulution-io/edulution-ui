import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/UserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Button } from '@/components/shared/Button';
import useCommunityLicenseStore from '@/pages/Licensing/CommunityLicense/useCommunityLicenseStore';

interface CommunityLicenseDialogProps {
  trigger?: React.ReactNode;
}

const CommunityLicenseDialog = ({ trigger }: CommunityLicenseDialogProps) => {
  const { t } = useTranslation();
  const user = useUserStore();
  const { checkForActiveUserLicenses, close, isOpen, isLoading } = useCommunityLicenseStore();

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
      title={t('licensing.communityLicenseDialog.title')}
      isOpen={isOpen}
      trigger={trigger}
      handleOpenChange={() => {}}
      body={getDialogBody()}
      footer={getFooter()}
      showCloseButton={false}
    />
  );
};

export default CommunityLicenseDialog;
