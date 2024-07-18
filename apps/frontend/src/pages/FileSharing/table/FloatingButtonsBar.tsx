import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import {
  MdDriveFileRenameOutline,
  MdFilePresent,
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
} from 'react-icons/md';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import { FiUpload } from 'react-icons/fi';
import FileAction from '@libs/filesharing/FileAction';
import FileTypesConfiguration from '@libs/ui/types/filesharing/FileTypesConfiguration';

const FileSharingFloatingButtonsBar = () => {
  const { selectedItems } = useFileSharingStore();
  const { openDialog } = useFileSharingDialogStore();
  const { t } = useTranslation();
  const { setSelectedFileType } = useFileSharingDialogStore();
  return (
    <div className="fixed bottom-8 flex flex-row bg-opacity-90">
      {selectedItems.length === 0 && (
        <>
          <FloatingActionButton
            variant="dropdown"
            icon={MdFilePresent}
            text={t('tooltip.create.file')}
            onClick={() => openDialog(FileAction.CREATE_FILE)}
            options={FileTypesConfiguration}
            onSelectFileSelect={setSelectedFileType}
          />
          <FloatingActionButton
            icon={HiOutlineFolderAdd}
            text={t('tooltip.create.folder')}
            onClick={() => openDialog(FileAction.CREATE_FOLDER)}
          />
          <FloatingActionButton
            icon={FiUpload}
            text={t('tooltip.upload')}
            onClick={() => openDialog(FileAction.UPLOAD_FILE)}
          />
        </>
      )}

      {selectedItems.length === 1 && (
        <FloatingActionButton
          icon={MdDriveFileRenameOutline}
          text={t('tooltip.rename')}
          onClick={() => openDialog(FileAction.RENAME)}
        />
      )}

      {selectedItems.length > 0 && (
        <>
          <FloatingActionButton
            icon={MdOutlineDeleteOutline}
            text={t('tooltip.delete')}
            onClick={() => openDialog(FileAction.DELETE)}
          />
          <FloatingActionButton
            icon={MdOutlineDriveFileMove}
            text={t('tooltip.move')}
            onClick={() => openDialog(FileAction.MOVE)}
          />
        </>
      )}
    </div>
  );
};

export default FileSharingFloatingButtonsBar;
