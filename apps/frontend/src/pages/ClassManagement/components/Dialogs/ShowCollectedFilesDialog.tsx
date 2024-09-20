import { t } from 'i18next';
import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import MoveContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import useUserStore from '@/store/UserStore/UserStore';
import { Button } from '@/components/shared/Button';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';
import useUserPath from '@/pages/FileSharing/hooks/useUserPath';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';

const ShowCollectedFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose, action }) => {
  const { user } = useUserStore();
  const { basePath } = useUserPath();
  const collectedFilesPath = `${basePath}/${user?.username}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}`;

  const getDialogBody = () => (
    <MoveContentDialogBody
      showAllFiles
      pathToFetch={collectedFilesPath}
      showSelectedFile={false}
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

export default ShowCollectedFilesDialog;
