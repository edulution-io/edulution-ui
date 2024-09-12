import { t } from 'i18next';
import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import MoveContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import useUserStore from '@/store/UserStore/UserStore';
import buildBasePath from '@libs/filesharing/utils/buildBasePath';

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
      <button
        type="button"
        className="hover:ciRed rounded-md bg-ciLightRed px-4 py-2 text-foreground"
        onClick={action}
      >
        {t('classmanagement.deactivate')}
      </button>
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
