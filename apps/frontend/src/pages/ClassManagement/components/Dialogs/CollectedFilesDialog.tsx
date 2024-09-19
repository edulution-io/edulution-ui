import { t } from 'i18next';
import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import MoveContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import useUserStore from '@/store/UserStore/UserStore';
import buildBasePath from '@libs/filesharing/utils/buildBasePath';
import { Button } from '@/components/shared/Button';

interface CollectedFilesDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  action: () => void;
}

const CollectedFilesDialog: React.FC<CollectedFilesDialogProps> = ({ title, isOpen, onClose, action }) => {
  const { user } = useUserStore();
  const basePath = buildBasePath(user?.ldapGroups.roles[0], user?.ldapGroups.classes[0]);
  const collectedFilesPath = `${basePath}/${user?.username}/transfer/collected`;

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

export default CollectedFilesDialog;
