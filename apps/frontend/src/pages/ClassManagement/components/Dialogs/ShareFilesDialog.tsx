import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { t } from 'i18next';
import React from 'react';
import MoveContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import { Button } from '@/components/shared/Button';

interface ShareFilesDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  action: () => void;
}

const ShareFilesDialog: React.FC<ShareFilesDialogProps> = ({ title, isOpen, onClose, action }) => {
  const getDialogBody = () => <MoveContentDialogBody showAllFiles />;

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

export default ShareFilesDialog;
