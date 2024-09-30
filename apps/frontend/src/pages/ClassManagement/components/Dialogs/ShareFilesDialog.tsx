import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { t } from 'i18next';
import React from 'react';
import MoveContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import { Button } from '@/components/shared/Button';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';
import useUserPath from '@/pages/FileSharing/hooks/useUserPath';

const ShareFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose, action }) => {
  const { homePath } = useUserPath();
  const getDialogBody = () => (
    <MoveContentDialogBody
      showAllFiles
      pathToFetch={homePath}
    />
  );

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
