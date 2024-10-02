import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { t } from 'i18next';
import React from 'react';
import { Button } from '@/components/shared/Button';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';

const CollectFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose, action }) => {
  const getDialogBody = () => <div className="text-foreground">{t('classmanagement.CollectFilesDescription')}</div>;

  const getFooter = () => (
    <div className="mt-4 flex justify-between space-x-4">
      <Button
        type="button"
        size="lg"
        variant="btn-collaboration"
        onClick={action}
      >
        {t(`classmanagement.${title}`)}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CollectFilesDialog;
