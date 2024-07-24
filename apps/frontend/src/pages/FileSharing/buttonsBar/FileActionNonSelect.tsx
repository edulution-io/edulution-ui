import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { MdFilePresent } from 'react-icons/md';
import FileAction from '@libs/filesharing/FileAction';
import FileTypesConfiguration from '@libs/ui/types/filesharing/FileTypesConfiguration';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import { FiUpload } from 'react-icons/fi';
import React, { FC } from 'react';
import { t } from 'i18next';
import FileActionButtonProps from '@libs/filesharing/FileActionButtonProps';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';

const FileActionNonSelect: FC<FileActionButtonProps> = ({ openDialog }) => {
  const { setSelectedFileType } = useFileSharingDialogStore();
  return (
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
  );
};

export default FileActionNonSelect;
