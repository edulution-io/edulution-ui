import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface AddAppConfigDialogProps {
  handleDeleteSettingsItem: () => void;
}

const DeleteAppConfigDialog: React.FC<AddAppConfigDialogProps> = ({ handleDeleteSettingsItem }) => {
  const { t } = useTranslation();
  const { isDeleteAppConfigDialogOpen, setIsDeleteAppConfigDialogOpen, isLoading } = useAppConfigsStore();

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return <p>{t('settings.deleteApp.description')}</p>;
  };

  const handleDelete = () => {
    handleDeleteSettingsItem();
    setIsDeleteAppConfigDialogOpen(false);
  };

  const dialogFooter = (
    <div className="mt-4 flex justify-end text-background">
      <Button
        type="button"
        variant="btn-collaboration"
        size="lg"
        onClick={handleDelete}
        disabled={isLoading}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isDeleteAppConfigDialogOpen}
      handleOpenChange={() => setIsDeleteAppConfigDialogOpen(false)}
      title={t('settings.deleteApp.title')}
      body={getDialogBody()}
      footer={dialogFooter}
    />
  );
};

export default DeleteAppConfigDialog;
