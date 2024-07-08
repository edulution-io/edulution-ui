import useFileManagerStore from '@/pages/FileSharing/FileManagerStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import {
  MdDriveFileRenameOutline,
  MdFilePresent,
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
} from 'react-icons/md';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ActionItems from '@/pages/FileSharing/dialog/ActionsType/ActionItems';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import { FiUpload } from 'react-icons/fi';
import FILE_TYPES from '@/pages/FileSharing/fileoperations/fileCreationDropDownOptions';

const FileSharingFloatingButtonsBar = () => {
  const { selectedItems } = useFileManagerStore();
  const { openDialog } = useFileSharingDialogStore();
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-8 flex flex-row bg-opacity-90">
      {selectedItems.length === 0 && (
        <>
          <FloatingActionButton
            variant="dropdown"
            icon={MdFilePresent}
            text={t('tooltip.create.file')}
            onClick={() => openDialog(ActionItems.CREATE_FILE)}
            options={FILE_TYPES}
          />
          <FloatingActionButton
            icon={HiOutlineFolderAdd}
            text={t('tooltip.create.folder')}
            onClick={() => openDialog(ActionItems.CREATE_FOLDER)}
          />
          <FloatingActionButton
            icon={FiUpload}
            text={t('tooltip.upload')}
            onClick={() => openDialog(ActionItems.UPLOAD_FILE)}
          />
        </>
      )}

      {selectedItems.length === 1 && (
        <FloatingActionButton
          icon={MdDriveFileRenameOutline}
          text={t('tooltip.rename')}
          onClick={() => openDialog(ActionItems.RENAME)}
        />
      )}

      {selectedItems.length > 0 && (
        <>
          <FloatingActionButton
            icon={MdOutlineDeleteOutline}
            text={t('tooltip.delete')}
            onClick={() => openDialog(ActionItems.DELETE)}
          />
          <FloatingActionButton
            icon={MdOutlineDriveFileMove}
            text={t('tooltip.move')}
            onClick={() => openDialog(ActionItems.MOVE)}
          />
        </>
      )}
    </div>
  );
};

export default FileSharingFloatingButtonsBar;
